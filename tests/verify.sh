#!/usr/bin/env bash
#
# verify.sh — prove a regression test is a *valid* regression test.
#
# Fixed bug: deploy the version where the bug was reported, run the spec (must
# FAIL — red), then deploy the version that fixed it and run again (must PASS —
# green). A test that does not fail on the broken version is not catching the
# bug, so this is the real check.
#
# Open bug (status "open", no fixedVersion): deploy the version where it still
# reproduces and run the spec, which must FAIL (red) — confirming the bug is
# still there. When someone fixes it the spec turns green; record the fixed
# version in the manifest and this becomes a normal red->green check.
#
#   ./verify.sh                 # list the tickets you can verify
#   ./verify.sh 1412            # verify a fixed bug (red on broken, green on fixed)
#   ./verify.sh 1412-reopened   # verify an open bug (still red on the latest)
#   HEADED=1 ./verify.sh 1412   # show the browser so you can watch it run
#
# One-time setup: copy .env.example to .env and fill in the admin password.

set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$here"
manifest="e2e/regression-manifest.json"
server="${C8O_SERVER:-https://test-repro.convertigo.net}"

bold=$'\033[1m'; red=$'\033[31m'; green=$'\033[32m'; yellow=$'\033[33m'; dim=$'\033[2m'; rst=$'\033[0m'

field() { node -e "const m=require('./$manifest').tests['$1']||{};const v=m['$2'];process.stdout.write(v==null?'':String(v))"; }
repro() { node -e "const s=(require('./$manifest').tests['$1']||{}).reproduction||[];s.forEach((x,i)=>console.log('  '+(i+1)+'. '+x))"; }
list_tests() { node -e "const t=require('./$manifest').tests;for(const k of Object.keys(t))console.log('  '+k.padEnd(30)+(t[k].kind||'').padEnd(11)+' '+t[k].title)"; }

# Resolve "latest" to the newest release tag.
resolve_version() {
  local v="$1"
  if [[ "$v" == "latest" ]]; then
    gh release list -R "${C8O_REPO:-convertigo/C8oForms}" --limit 1 --json tagName --jq '.[0].tagName'
  else
    printf '%s' "$v"
  fi
}

id="${1:-}"
if [[ -z "$id" ]]; then
  echo "${bold}Tests you can verify:${rst}"
  list_tests
  echo
  echo "Usage: ./verify.sh <id>     (e.g. ./verify.sh 1412)"
  exit 0
fi

title="$(field "$id" title)"
spec="$(field "$id" spec)"
kind="$(field "$id" kind)"
broken="$(field "$id" brokenVersion)"
fixed="$(field "$id" fixedVersion)"
smoke_version="$(field "$id" version)"
grep_filter="$(field "$id" grep)"
ticket="$id"
[[ -n "$spec" ]] || { echo "${red}Unknown test '$id'.${rst} Run ./verify.sh to list available tests."; exit 1; }

headed=()
[[ "${HEADED:-}" == "1" ]] && headed=(--headed)

served_version() {
  curl -s "$server/convertigo/projects/C8Oforms/DisplayObjects/mobile/assets/i18n/fr.json" \
    | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{try{process.stdout.write(JSON.parse(s).version_c8o||'?')}catch{process.stdout.write('?')}})"
}

# Deploy a version, confirm the server is serving it, run the spec. Progress
# streams to the terminal; the spec result lands in PHASE_RESULT.
PHASE_RESULT=""
run_phase() {
  local label="$1" version="$2"
  echo
  echo "${bold}-- $label: deploying $version --${rst}"
  node scripts/deploy-version.mjs "$version"
  local got; got="$(served_version)"
  if [[ "$got" == "$version" ]]; then
    echo "${dim}server confirmed on $got${rst}"
  else
    echo "${yellow}warning: the server is serving '$got' (expected '$version')${rst}"
  fi
  echo "${bold}-- $label: running $spec${grep_filter:+ (-g \"$grep_filter\")} --${rst}"
  local grep_args=()
  [[ -n "$grep_filter" ]] && grep_args=(-g "$grep_filter")
  if npx playwright test "$spec" ${grep_args[@]+"${grep_args[@]}"} ${headed[@]+"${headed[@]}"}; then
    PHASE_RESULT=PASS
  else
    PHASE_RESULT=FAIL
  fi
}

echo "${bold}Verifying test '$id' (${kind:-regression})${rst}"
echo "  $title"
echo "  spec: $spec"
echo
echo "${bold}How to reproduce manually:${rst}"
repro "$id"

# ── Smoke test: just deploy a version and confirm the spec passes (green) ─────
if [[ "$kind" == "smoke" ]]; then
  v="$(resolve_version "${smoke_version:-latest}")"
  echo
  echo "  kind: ${bold}SMOKE${rst} — must PASS on $v"
  run_phase "Smoke" "$v"; result="$PHASE_RESULT"
  echo
  echo "${bold}=================== VERDICT '$id' ===================${rst}"
  if [[ "$result" == "PASS" ]]; then
    echo "  ${green}OK${rst} the journey passes on $v (test is ${green}GREEN${rst})"
    echo "${bold}====================================================${rst}"
    exit 0
  else
    echo "  ${red}X${rst}  the journey FAILED on $v"
    echo "${bold}====================================================${rst}"
    exit 1
  fi
fi

# ── Open bug: no fix yet, just confirm it still reproduces (red) ──────────────
if [[ "$kind" == "open" || -z "$fixed" ]]; then
  echo
  echo "  status: ${yellow}OPEN${rst} — broken on $broken, no fix yet (the test MUST fail)"
  run_phase "Open bug" "$broken"; broken_result="$PHASE_RESULT"

  echo
  echo "${bold}=================== VERDICT '$id' ===================${rst}"
  if [[ "$broken_result" == "FAIL" ]]; then
    echo "  ${green}OK${rst} the bug still reproduces on $broken (test is ${red}RED${rst}, as expected for an open bug)"
    echo "${bold}====================================================${rst}"
    echo "${green}${bold}Open bug confirmed.${rst} Fix it, then set fixedVersion in the manifest to turn this into a red->green check."
    exit 0
  else
    echo "  ${yellow}!${rst} the test PASSED on $broken — the bug may be fixed"
    echo "${bold}====================================================${rst}"
    echo "${yellow}${bold}Looks fixed.${rst} Record the fixed version in regression-manifest.json and flip kind to \"regression\"."
    exit 1
  fi
fi

# ── Fixed bug: red on broken, green on fixed ─────────────────────────────────
echo
echo "  broken version: $broken   (the test must FAIL)"
echo "  fixed version : $fixed    (the test must PASS)"

run_phase "Broken version" "$broken";  broken_result="$PHASE_RESULT"
run_phase "Fixed version" "$fixed";     fixed_result="$PHASE_RESULT"

echo
echo "${bold}=================== VERDICT '$id' ===================${rst}"
if [[ "$broken_result" == "FAIL" ]]; then
  echo "  ${green}OK${rst} broken version ($broken): test ${red}RED${rst} as expected"
else
  echo "  ${red}X${rst}  broken version ($broken): test GREEN — it does NOT catch the bug!"
fi
if [[ "$fixed_result" == "PASS" ]]; then
  echo "  ${green}OK${rst} fixed version  ($fixed): test ${green}GREEN${rst} as expected"
else
  echo "  ${red}X${rst}  fixed version  ($fixed): test RED — the fix does not hold or the test is broken"
fi
echo "${bold}====================================================${rst}"

if [[ "$broken_result" == "FAIL" && "$fixed_result" == "PASS" ]]; then
  echo "${green}${bold}Valid regression test:${rst} red on the broken version, green on the fixed one."
  exit 0
else
  echo "${red}${bold}Verification FAILED:${rst} the red->green cycle is not satisfied (see above)."
  exit 1
fi
