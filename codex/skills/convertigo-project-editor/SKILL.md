---
name: convertigo-project-editor
description: Edit and maintain Convertigo projects (C8Oforms) via YAML in _c8oProject (sequences, connectors, mobile pages/components, shared actions/components, and project metadata). Use when asked to change Convertigo YAML descriptors, sequence steps or SmartTypes, mobile UI definitions, or to validate/reload a project after YAML edits.
---

# Convertigo Project Editor

## Overview
Enable safe edits of Convertigo YAML in this repo and validate them with the required reload/compile workflow.

## Quick start
1. Identify the target area (sequence, connector, mobile page/component, shared action/component, project root).
2. Locate the YAML under `_c8oProject/` or in `c8oProject.yaml` with `🗏` references, then edit the referenced file.
3. Apply YAML/JS rules (indentation, symbols, FormatedContent quoting, Rhino-safe JS).
4. Reload and compile the project to validate.

## Project docs (open only when needed)
- `codex/docs/codex-guidelines.md`: project conventions, guardrails, reload/compile workflow.
- `codex/docs/convertigo-yaml-guide.md`: YamlConverter rules, symbols, indentation, subfiles.
- `codex/docs/sequence-steps-reference.md`: step list and YAML keys.
- `codex/docs/sequence-step-details.md`: step parameters and behavior.
- `codex/docs/sequence-step-properties.md`: palette names and short descriptions.
- `codex/docs/convertigo-gradle-guide.md`: Gradle load/build/deploy commands.
- `codex/docs/front-bug-findings.md`: known front issues (reference only; do not edit _private/ionic).

## Editing rules (must follow)
- Only modify files under `_c8oProject/` unless explicitly requested.
- Never edit `_private/ionic/`; update the YAML descriptors instead.
- Keep YAML indentation at 2 spaces; never add tabs.
- Use Convertigo symbols `↓`, `↑`, `→`, `🗏` exactly as exported.
- For `FormatedContent` blocks, keep the opening/closing single-quote lines and use tabs inside the JS body (no extra blank lines).
- Keep JS Rhino-compatible (`var`, classic functions; avoid modern syntax).
- Prefer ASCII; use non-ASCII only when already present in the file (e.g., translations).

## Sequence edits
- Choose the proper step type from `sequence-steps-reference.md`; confirm parameters in `sequence-step-details.md`.
- Preserve SmartType structure and existing step ordering.
- Add variables with safe defaults and short comments when needed.

## Mobile pages/actions/components
- Edit YAML under `_c8oProject/mobilePages`, `_c8oProject/mobileSharedActions`, `_c8oProject/mobileComponents`, `_c8oProject/mobileSharedComponents`.
- Keep `scriptContent` JS Rhino-compatible.
- Update Monaco/IntelliSense types in shared components when needed (see `codex/docs/codex-guidelines.md`).

## Validation workflow (required after YAML edits)
- Preferred: Convertigo CLI reload via jar path from `codex/.env` with debug logs; confirm output contains `Project "C8Oforms" imported!`.
- Then call the Studio reload endpoint, wait 10 seconds, then trigger a Studio compile (use the exact curl commands in `codex/docs/codex-guidelines.md`).
- Fallback: `JAVA_HOME=$(/usr/libexec/java_home -v 17) ./gradlew load --info --no-build-cache --no-daemon` if CLI is unavailable.
- A run is valid only when no `Exception occurs for project: C8Oforms` appears.

## Deliverables
- Provide a short summary of files edited and why.
- Mention how validation was performed, or state explicitly if validation was skipped.
