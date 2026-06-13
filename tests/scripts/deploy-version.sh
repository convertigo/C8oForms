#!/usr/bin/env bash
#
# Deploy a given C8oForms release (project + all dependencies) onto the
# test-repro server, replacing whatever is currently there.
#
# The release asset no_code_studio_and_dependencies.zip is a bag of ~18 .car
# files, not one deployable archive, so we wipe the existing projects (best
# effort) and POST each .car to projects.Deploy, dependencies first and the
# C8Oforms app last so its references resolve.
#
# Usage:
#   deploy-version.sh <release-tag>          # e.g. 2.2.0-beta214
#   deploy-version.sh --dir <folder-of-cars>
#
# Configuration is read from tests/.env (copy tests/.env.example). Required:
#   CONVERTIGO_ADMIN_PASSWORD   admin password for the test-repro server
# Optional:
#   C8O_SERVER   default https://test-repro.convertigo.net
#   C8O_REPO     default convertigo/C8oForms

set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[[ -f "$here/../.env" ]] && set -a && . "$here/../.env" && set +a

server="${C8O_SERVER:-https://test-repro.convertigo.net}"
repo="${C8O_REPO:-convertigo/C8oForms}"
admin_user="admin"

WIPE_PROJECTS=(
  C8Oforms C8Oforms_PWAs lib_Actions_C8Oforms lib_BaseRow
  lib_ExtendedComponents_ui_ngx lib_FullSyncGrp lib_GeneratePWAAssets
  lib_Geocoding lib_Geocoding_ui_ngx lib_OAuth lib_ProductTour lib_UserManager
  lib_UserManager_ui_ngx lib_Vonage lib_Vonage_ui_ngx libApexCharts lib_Leaflet
  BaserowIntegration mobilebuilder_tpl_7_9_0 mobilebuilder_tpl_8_0_0_ngx
  mobilebuilder_tpl_8_1_0_ngx mobilebuilder_tpl_8_3_0_ngx mobilebuilder_tpl_8_4_0_ngx
)

die() { printf 'deploy-version: error: %s\n' "$*" >&2; exit 1; }
log() { printf 'deploy-version: %s\n' "$*"; }

[[ -n "${CONVERTIGO_ADMIN_PASSWORD:-}" ]] \
  || die "CONVERTIGO_ADMIN_PASSWORD is not set (copy tests/.env.example to tests/.env)"

car_dir=""; cleanup_dir=""
if [[ "${1:-}" == "--dir" ]]; then
  car_dir="${2:?--dir needs a folder}"
else
  tag="${1:?usage: deploy-version.sh <release-tag> | --dir <folder>}"
  car_dir="$(mktemp -d)"; cleanup_dir="$car_dir"
  log "downloading $tag from $repo"
  gh release download "$tag" -R "$repo" \
    --pattern "no_code_studio_and_dependencies.zip" \
    --dir "$car_dir" --clobber
  ( cd "$car_dir" && unzip -o -q no_code_studio_and_dependencies.zip )
fi
[[ -d "$car_dir" ]] || die "car directory not found: $car_dir"

jar="$(mktemp)"
trap '[[ -n "$cleanup_dir" ]] && rm -rf "$cleanup_dir"; rm -f "$jar"' EXIT

# bash 3.2 (macOS default) has no mapfile, so read the list with a loop.
all_cars=()
while IFS= read -r c; do all_cars+=("$c"); done \
  < <(cd "$car_dir" && ls ./*.car 2>/dev/null | sed 's|.*/||; s/\.car$//')
[[ ${#all_cars[@]} -gt 0 ]] || die "no .car files in $car_dir"

ordered=()
for c in "${all_cars[@]}"; do
  [[ "$c" == "C8Oforms" || "$c" == "C8Oforms_PWAs" ]] && continue
  ordered+=("$c")
done
for c in "${all_cars[@]}"; do [[ "$c" == "C8Oforms_PWAs" ]] && ordered+=("$c"); done
for c in "${all_cars[@]}"; do [[ "$c" == "C8Oforms" ]] && ordered+=("$c"); done

srv="$server/convertigo"
log "authenticating on $srv"
curl -sS -c "$jar" -X POST \
  --data-urlencode "authType=login" \
  --data-urlencode "authUserName=$admin_user" \
  --data-urlencode "authPassword=$CONVERTIGO_ADMIN_PASSWORD" \
  "$srv/admin/services/engine.Authenticate" -o /dev/null \
  || die "authentication failed"

log "wiping ${#WIPE_PROJECTS[@]} projects (best-effort)"
for p in "${WIPE_PROJECTS[@]}"; do
  curl -sS -b "$jar" -X POST \
    --data-urlencode "projectName=$p" \
    "$srv/admin/services/projects.Delete" -o /dev/null || true
done

log "deploying ${#ordered[@]} archives"
failed=0
for c in "${ordered[@]}"; do
  printf 'deploy-version:   %s ... ' "$c"
  out="$(curl -sS -b "$jar" -X POST \
    -F "archive=@${car_dir}/${c}.car;type=application/octet-stream" \
    "$srv/admin/services/projects.Deploy?bAssembleXsl=false")"
  if printf '%s' "$out" | grep -qi '<error'; then
    echo "FAILED"; printf '%s\n' "$out" | head -c 400 >&2; echo >&2; failed=1
  else
    echo "ok"
  fi
done

[[ $failed -eq 0 ]] || die "at least one deployment failed"
log "done"
