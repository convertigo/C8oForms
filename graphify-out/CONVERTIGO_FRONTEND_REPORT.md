# Convertigo Front-End Enrichment

This post-processing pass enriches the existing Graphify graph with deterministic
links between `_c8oProject` YAML objects and their generated Angular/Ionic
counterparts under `_private/ionic/src/app`.

## Outputs

- `graph.json` was enriched in place.
- `graph.html` was regenerated from the enriched graph.
- `graph.before-convertigo-frontend.json` keeps the original Graphify graph.
- `convertigo-frontend-enrichment.json` contains machine-readable counters.
- `convertigo_frontend_enrich.py` is the relaunchable enrichment script.

## Scope

- YAML source inspected:
  - `_c8oProject/mobileSharedComponents`
  - `_c8oProject/mobileSharedActions`
  - `_c8oProject/mobilePages`
  - `_c8oProject/mobileMenus`
- Generated front-end inspected:
  - `_private/ionic/src/app/components`
  - `_private/ionic/src/app/pages`
  - `_private/ionic/src/app/app.routes.ts`
- Excluded:
  - `_private/ionic/node_modules`
  - Angular cache and build internals

## Graph Delta

- Total graph after enrichment: 1,919 nodes, 5,982 edges.
- Convertigo front-end nodes added/reused: 250.
- Convertigo front-end deterministic edges: 3,847.

## Relation Counts

- `uses_shared_component`: 846
- `invokes_shared_action`: 995
- `calls_sequence`: 208
- `navigates_to_page`: 234
- `uses_connector`: 68
- `generates_frontend`: 235
- `renders_component`: 683
- `imports_component`: 537
- `routes_to_page`: 41

## Verified Examples

- `itemBarcodeSelector` now links to:
  - `sharedQuestionElem`
  - `BarcodeDataInteractionsEditor`
  - `DefaultValueEditorWithPalette`
  - `updateState`
  - `tickAction`
  - generated component files in `_private/ionic/src/app/components/c8oforms.itembarcodeselector`

- `viewerPage` now links to:
  - generated page files in `_private/ionic/src/app/pages/viewerpage`
  - rendered viewer components such as `itemTextViewer`, `itemBarcodeViewver`,
    `itemGridViewer`, `itemMapViewer`, `itemVideoCallViewer`
  - invoked shared actions such as `callViewLiveAndFillFormListViewer` and
    `ProcessSubmitFormViewerPage`
  - route definitions from `_private/ionic/src/app/app.routes.ts`

## Known Gaps

- 29 requestables were not matched to local `_c8oProject/sequences` or connectors.
  These include external libraries or dynamic requestables.
- 3 page navigation references were not matched to local mobile page YAML.
- 14 generated components have no direct `_c8oProject/mobileSharedComponents`
  source match, mostly library or generated helper components.
