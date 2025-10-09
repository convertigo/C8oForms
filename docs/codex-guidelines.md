# Codex Guidelines for the C8Oforms Project

This document sums up the conventions Codex must follow when generating assets for the C8Oforms Convertigo project. The goal is to keep generated YAML sequences and supporting files consistent with the existing code base and with Convertigo’s requirements.

## 1. General Project Expectations

- Only modify or create files inside `_c8oProject/…` (sequences, mobile pages, shared actions, etc.) unless explicitly requested.
- **Do not edit generated front-end code** under `_private/ionic/`. Any UI change must be done through the Convertigo YAML descriptors (`_c8oProject/mobilePages/*.yaml`, `_c8oProject/sharedActions/*.yaml`, components in `_c8oProject/mobileComponents/`, …); Convertigo will regenerate the Ionic TypeScript/HTML from those sources.
- When a bug surfaces in the generated app (e.g., viewer/editor toast behavior), locate the corresponding YAML definition and patch the script block there. Never patch `_private/ionic/src/...` directly.
- If IntelliSense/Monaco typings need updates, adjust the relevant shared component YAML (e.g., `_c8oProject/mobileSharedComponents/monacoEditor.yaml`) so generated definitions and completions stay in sync with actual page properties. Avoid touching the compiled TS files.
- When you need richer completion (e.g., expose `page.formsSubmit.*` members), extend the TypeScript interfaces inside those YAML definitions—define helper types (mirroring the structures you see in the relevant mobile page, such as `viewerPage.fillFormSubmit`) and update the page interface so Monaco offers the expected properties.
- The form submission cache is exposed as `page.formsSubmit`; ensure Monaco interfaces and API completion dictionaries reuse that plural key so IntelliSense keeps the right suggestions (avoid reintroducing `formSubmit`).
- When overriding user settings through `APIV2_OverrideUserSettings`, use `hasOwnProperty` (or equivalent) when copying meta entries so boolean flags like `advancedEditing: false` persist instead of being dropped by truthy checks.
- For CSV exports (`APIV2_CSV`), always iterate according to the header definitions when building rows so that empty responses still reserve their column slots and keep the data aligned, even when a header entry is `null`.
- Prefer ASCII characters. Introduce non-ASCII only if the existing files already use them and it is necessary (e.g., translation strings).
- Avoid destructive git commands or removing user changes unless the user explicitly asks for it.

## 2. YAML Formatting Rules

Convertigo sequences and mobile pages are stored as YAML with a specific indentation style:

```
accessibility: Private
↓Sequence_JS [steps.SimpleStep-...]: 
  expression: |
    'var ...'
```

- Use two spaces for indentation inside YAML structures, matching the existing files.
- Use the Unicode arrow (↓) prefix (already present in existing files) when adding new sequence steps.
- Quote strings uniformly: existing files typically use single quotes inside the Rhino JS expression block.
- Preserve trailing spaces and blank lines only when they already exist; otherwise keep the file tidy.

### Expression Blocks (Sequences & Mobile Pages)

- Keep JavaScript/Rhino code inside `expression: |` blocks, wrapped in single quotes in accordance with Convertigo exports.
- Keep the closing quote on the final line.
- Avoid trailing spaces in these blocks.

## 3. JavaScript / Rhino Inside Sequences

When writing JS inside sequences:

- Use `var` declarations to match existing style (Rhino compatibility).
- Use helper imports via `include("js/common.js");` only when needed; don’t duplicate helpers already present.
- Convertigo provides utility classes (`context`, `log`, `fsclient`, etc.); follow existing patterns.
- Prefer `toJSON`, `toJettison`, and other helpers defined in `js/common.js` when interacting with CouchDB.
- Avoid modern JS features not supported by Rhino (e.g., arrow functions with `const`). Use classic function syntax when unsure.

## 4. Logging and Comments

- Log messages in English (`log.warn`, `log.error`).
- Only add concise comments that genuinely help understand complex code paths.
- Keep logging informative but not overly verbose; reference the sequence purpose for easier troubleshooting (e.g., prefix with `c8oGrp audit`).

## 5. Variables and Defaults

- Expose sequence variables with meaningful defaults. For example:
  ```yaml
  ↓execute [variables.RequestableVariable-...]: 
    value: false
    comment: Optional description...
  ```
- Document variables using `comment:` entries when helpful. Keep comments short and in English.
- Stick to existing naming conventions (camelCase for variable names like `chunkSize`).

## 6. CouchDB Access Patterns

- Use Mango `find` queries with indexes where possible (`fsclient.postFind`). Include `use_index` to avoid full scans.
- Prefer `bookmark` pagination over `skip` in large collections.
- Use `postBulkDocs` with merge rules when updating multiple documents and ensure merge scope (`override`) matches expectations.
- Always parse responses via `toJSON` and convert updates via `toJettison`.
- Respect existing helper logic (e.g., `mapFromC8oGrp` pattern) rather than rewriting from scratch.

## 7. Error Handling

- Wrap bulk operations in `try/catch`. Log errors and record them in the output XML nodes (`errors`).
- Never silently swallow exceptions; at minimum, log them so Convertigo admins can trace issues.
- Ensure loops break when `bookmark` is exhausted to avoid infinite loops.

## 8. Dry-Run vs Apply Modes

- For maintenance sequences, provide a dry-run mode (`execute=false`) that only reports actions without modifying data.
- When `execute=true`, perform updates and report results under `<updated>` / `<errors>` nodes.
- Maintain context heartbeats: `context.getRootContext().lastAccessTime = new Date().getTime();` inside long loops.

## 9. Output Structure

- Structure outputs with clear root nodes (e.g., `<summary>`, `<documents>`, `<errors>`).
- When reporting per-document details, include ID, `current` vs `expected` state, and `status`.
- Only output entries that need user attention (e.g., mismatches) to keep responses manageable.

## 10. Testing Expectations

- Codex should not run automated tests unless the user explicitly requests it, but should validate syntax manually (e.g., double-check indentation, closing quotes).
- Keep sequences idempotent; re-running in apply mode should stabilize the dataset without causing duplicate changes.

## 11. Asking for Clarification

- If requirements are ambiguous (e.g., whether to include the creator in `c8oGrp`), ask the user before implementing assumptions.
- Reflect confirmed rules in this guideline.

## 12. Checklist Before Delivering a Sequence

1. **YAML indentation matches existing files.**
2. **JavaScript inside `expression` uses Rhino-compatible syntax.**
3. **Variables documented and default to safe values (dry-run).**
4. **Loops update the context heartbeat and break correctly.**
5. **Bulk updates wrapped in `try/catch`, logging success/failure.**
6. **Outputs focus on deviations (e.g., mismatches).**
7. **No accidental `_all_docs` scans when an index exists.**
8. **File saved with ASCII, no stray BOM/UTF-8 markers.**

By following these rules Codex keeps generated sequences consistent, safe to run, and easy for the team to review. Update this file whenever new conventions are agreed upon.
- When editing mobile pages (`_c8oProject/mobilePages/...`), the same Rhino/TypeScript hybrid style applies inside `scriptContent`; continue using `var` and Convertigo helpers there as well.
