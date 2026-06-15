# C8oForms e2e regression tests

A Playwright suite driven by GitHub issues: each reproducible bug becomes a spec
`e2e/issue-NNNN.spec.ts`, validated **red** on the version where the bug was
found and **green** on the version that fixed it, then kept in the permanent
suite.

## Running the tests

```bash
cd tests
cp .env.example .env                          # once: test user is pre-filled; set CONVERTIGO_ADMIN_PASSWORD if you also deploy
npm install
npx playwright install chromium
npx playwright test                           # targets https://test-repro.convertigo.net
C8OFORMS_BASE_URL=... npx playwright test      # any other server
```

Credentials and the target server live in `tests/.env` (gitignored), loaded by
`playwright.config.ts` via dotenv — nothing is hardcoded. The test user defaults
are in `.env.example`; `CONVERTIGO_ADMIN_PASSWORD` (deploy server) is only needed
for `verify.sh`.

### Running against a local server

How you point at the app depends on how it is served:

- **Convertigo server** (a local studio, or test-repro) — set `C8OFORMS_BASE_URL`
  to the host; the `/convertigo/projects/C8Oforms/DisplayObjects/mobile/` path is
  appended automatically:

  ```bash
  C8OFORMS_BASE_URL=http://localhost:18080 npx playwright test
  ```

- **Dev server** (`ng serve`), where the app is served at the root — set
  `C8OFORMS_APP_URL` to the full URL; it is used as-is and wins over
  `C8OFORMS_BASE_URL`:

  ```bash
  C8OFORMS_APP_URL=http://localhost:41378/ npx playwright test
  ```

Either can also live in `tests/.env`. No fixture to set up: every spec builds its
own form through the UI, so it works the same on any server. A quick local smoke:

```bash
cd tests
C8OFORMS_BASE_URL=http://localhost:18080 npx playwright test e2e/journeys.spec.ts
# watch it, slowed down:
C8OFORMS_BASE_URL=http://localhost:18080 C8OFORMS_SLOWMO=600 \
  npx playwright test e2e/journeys.spec.ts --headed
```

## Visual runner (dashboard)

A small local web app to browse the manifest and run tests by clicking — handy
for a tester who wants to watch the run in a real browser.

```bash
cd tests
npm install            # once
npm run runner         # then open http://127.0.0.1:8771
```

It needs the backend, so open the printed URL — don't just open the HTML file.
From the page you can:

- see every manifest test (kind, versions, reproduction steps) and the version
  the server is currently serving;
- **Run all** or **Run this** on a single test;
- pick the **version**: *Latest* (the newest release) or *Broken* (the test's
  broken version). Either way the runner **checks the served version first and
  deploys only if it differs**, then confirms the right version is live before
  running — so you never run against the wrong build;
- toggle **headed** and set a **slow-mo** delay (ms) so each action is slow
  enough to follow on screen;
- watch the deploy + Playwright output stream live, with a green/red verdict.

Closing the tab cancels the run and kills the browser/deploy it spawned. The
slow-mo value is passed to Playwright via `C8OFORMS_SLOWMO` (also usable
directly: `C8OFORMS_SLOWMO=800 npx playwright test --headed`).

## CI release gate

On a tag push, `.github/workflows/build_and_deploy.yml` runs the **whole suite**
against the freshly deployed endpoint, then `ci/gate.mjs` decides whether to
release. It blocks the release **only on an unexpected failure** — a test that
should pass going red (a regression that came back, or a broken journey).
Failures of `open`-kind specs are red on purpose and do **not** block; they are
reported as "expected red". So every test runs (full visibility), and a known
open bug never blocks shipping unrelated fixes. When an open bug is fixed, flip
its `kind` to `regression` and it starts gating like the rest.

## Verifying a test (for testers)

`verify.sh` proves a test is a **real** regression test: it deploys the version
where the bug was reported, runs the test (which must be **red**), then deploys
the fixed version and runs it again (which must be **green**). A test that does
not fail on the broken version is not catching the bug — that is exactly what
this command checks.

```bash
cd tests
cp .env.example .env        # once: set CONVERTIGO_ADMIN_PASSWORD
npm install                 # once
npx playwright install chromium  # once

./verify.sh                       # list every test you can verify
./verify.sh 1412                  # regression: red on broken, green on fixed
./verify.sh journey-create-form   # smoke: green on the latest version
HEADED=1 ./verify.sh 1412         # same, with the browser visible so you can watch
```

The script streams progress (deploy + test) and prints a verdict. It exits 0 when
the expectation for that test's kind holds, 1 otherwise — usable as-is in CI.

### The manifest drives every test

[e2e/regression-manifest.json](e2e/regression-manifest.json) is the single
registry of all e2e specs — it is where you wire up every new test. Each entry
has a `kind` that tells `verify.sh` what to do:

| `kind` | meaning | `verify.sh` deploys | expects |
|---|---|---|---|
| `regression` | fixed bug | `brokenVersion` then `fixedVersion` | red then green |
| `open` | bug not fixed yet (`fixedVersion: null`) | `brokenVersion` | red (still reproduces) |
| `smoke` | journey / sanity (e.g. authoring) | `version` (`"latest"` resolves to the newest release) | green |

Other fields: `title`, `spec`, `rootCause` (bugs), `reproduction` (manual steps,
shown by `verify.sh`), and `grep` (optional — a test-title substring so one entry
targets one `test()` inside a multi-test spec, e.g. the three authoring journeys
in `journeys.spec.ts`). **To add a test**, write the spec then add its manifest
entry.

### Open bugs (not fixed yet)

A bug that has no fix yet still gets a spec, and that spec is meant to **fail
(red)** — it is a reminder that there is work to do, not a flake. Do not mark it
`test.fail()`: we want it red so it gets fixed. Mark its manifest entry with
`kind: "open"` and `fixedVersion: null`; `verify.sh <id>` then deploys the version
where it still reproduces and confirms the test is red. When the bug is fixed the
spec turns green on its own — record the fixed version and flip `kind` to
`"regression"`.

Example: `e2e/issue-1412-reopened.spec.ts` (clearing the map height collapses it),
still open on beta225.

> ⚠️ `verify.sh` redeploys the shared `test-repro` server on every run (twice for
> a fixed bug). Use it to validate a test, not in a tight loop — coordinate if
> several people share the server.

## Creating a test from a ticket

1. Read the whole ticket **including comments** (`gh issue view NNNN
   --json body,comments`). A reopened ticket often describes a second bug in the
   comments. The **Version** field gives the broken version; `git tag --contains
   <commit "ref #NNNN fixed">` gives the first fixed release.
2. Deploy the broken version on the repro server with `scripts/deploy-version.sh
   <tag>` (wipes the projects, then deploys every `.car`, dependencies first and
   `C8Oforms` last).
3. Reproduce the bug, write the spec, confirm it is **red**.
4. Deploy the fixed version, confirm the spec is **green** (or, for an open bug,
   leave it red and mark the manifest entry `open`).

## Authoring journeys & self-seeding fixtures

`e2e/journeys.spec.ts` tests the core authoring actions a user takes — create a
blank form, add a component, rename its technical identifier — and the same
helpers (`createBlankForm`, `addComponent`, `setTechnicalId`, `createFormWithMap`
in `e2e/helpers/studio.ts`) let any spec build its own fixture through the UI
instead of depending on a pre-existing document.

The #1412 specs call `createFormWithMap` in their setup, so **every test creates
its own fresh form** (blank form → add a map → rename it `map_repro`). No
pre-existing document, full per-test isolation, and it works the same on any
server — local, test-repro, or CI.

> The authoring helpers drive the editor UI, so the specs assume the deployed
> build's authoring screens match the current selectors. For the C8oForms beta
> line that holds across the versions `verify.sh` deploys; if a much older build
> ever diverged, that is where to look first.

## Conventions

- **Selectors**: use Convertigo priority CSS classes `classNNNN` (the bean's
  stable id in the YAML, which survives rebuilds and i18n) — never text locators
  for UI labels. Resolve a priority with `grep <priority> _c8oProject/`. Plain
  *data* text (a template name, a form title) is fine as a filter.
- **Editor**: never wait for `networkidle` (live connections). The component
  "configure" overlay is not a DOM descendant of the component and only appears
  on mouse-enter — `openComponentConfig()` handles both (move mouse out then back
  in, then click the overlay by geometric containment).
- **Both surfaces**: a component renders in the editor canvas and in the
  viewer/preview (the "Aperçu" button → `…/viewer/<id>`). Layout bugs often break
  both — assert the rendered size in the editor and after `openPreview()`.
- **Fixtures**: CouchDB documents (forms) survive a project redeploy. Repro forms
  are created with the `nocode-form-*` MCP tools and the test user.
- Check the version actually served:
  `curl .../DisplayObjects/mobile/assets/i18n/fr.json | head -2`.
