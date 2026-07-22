# No-Code Studio Functional Test Catalog

Last updated: 2026-07-09

Purpose: maintain a living list of functional tests to create for the C8oForms
No-Code Studio. This catalog is intentionally separate from non-regression
tests: a scenario already covered by an issue/ticket spec must still be created
here if it belongs to the expected functional baseline.

## Scope

- No red/green cycle: these tests validate expected functional behavior on the
  current target version.
- No dependency on GitHub bugs: a `feature` or `enhancement` ticket may be used
  as a business reference, but it does not drive the test logic.
- No inherited coverage: `issue-*.spec.ts`, `visibility-*`, or
  `journeys.spec.ts` specs may inspire gestures, but they do not mark this
  catalog as covered.
- Tests manipulate applications through the Studio UI: creation, components,
  configuration, sources, visibility, navigation, publication, and sharing.
- Existing Playwright helpers may be reused or extended, provided the functional
  scenario remains autonomous and readable.

## Statuses

| Status | Meaning |
| --- | --- |
| `[ ]` | To create in the dedicated functional suite. |
| `[~]` | In progress or partially covered in the dedicated functional suite. |
| `[x]` | Implemented in the dedicated functional suite. |
| `[?]` | Needs clarification with a product rule, test data, or business scenario. |
| `[n/a]` | Explicitly out of the current functional-test scope. |

## Current Status Summary

Current catalog state:

- Implemented: 116 functional items.
- Partially covered / known product gap: 0 functional items.
- Needs clarification: 5 functional items.
- Out of scope: 3 placeholders.
- No remaining item is marked as to create.
- Playwright currently collects 148 functional test cases:
  - 137 normally runnable cases with the minimal fixture set.
  - 6 user-fixture cases that can auto-provision accounts when `CONVERTIGO_ADMIN_PASSWORD` is set.
  - 1 source-isolation case that still needs a secondary MCP token.
  - 4 `fixme` cases tracking product contracts that are not defined yet.

The next automation pass should start only after one of the clarification inputs
below is resolved.

## Open Clarifications

| Area | IDs | Required input before further automation |
| --- | --- | --- |
| Date and Time runtime formatting | CMP-DATE-001, CMP-TIME-001 | Define the expected runtime rendering for alternate display formats and timezone/hour-cycle behavior after the options are persisted. Dedicated `fixme` tests now track the missing runtime contracts. |
| JavaScript source filters | SRC-006 | Define the expected viewer runtime behavior for JavaScript filter values, including whether `translation/getBrowserLang` should filter rows or only persist authored code. A dedicated `fixme` test now tracks the missing viewer contract. |
| Multi-user source isolation | SRC-010 | Provide `C8OFORMS_FUNCTIONAL_SECONDARY_MCP_TOKEN`; the secondary user itself can be explicit or auto-provisioned with `CONVERTIGO_ADMIN_PASSWORD`. Conditional automation runs when the user and token are available. |
| Mobile editor Preview entry point | X-003 | Expose or define a user-clickable mobile Preview entry point; at 390px the current toolbar Preview button is rendered/enabled but outside the viewport and the overflow menu does not expose Preview. |

## Known Product Gaps

No known product gap is currently tracked in this catalog.

## Clarification Traceability

| IDs | Playwright trace | Unlock condition |
| --- | --- | --- |
| CMP-DATE-001 | `functional-components-values.spec.ts` / `CMP-DATE-001 - Date alternate display format runtime rendering contract` (`fixme`) | Define the expected viewer value for alternate Date display formats and timezone-sensitive rendering. |
| CMP-TIME-001 | `functional-components-values.spec.ts` / `CMP-TIME-001 - Time alternate display format runtime rendering contract` (`fixme`) | Define the expected viewer value for 12-hour/seconds display formats and hour-cycle behavior. |
| SRC-006 | `functional-sources.spec.ts` / `SRC-006 - JavaScript source filter runtime behavior contract` (`fixme`) | Define whether JavaScript filter values must filter viewer rows or only persist authored source code. |
| SRC-010 | `functional-sources.spec.ts` / `SRC-010 - Baserow source picker isolates configured users` | Set a primary MCP token and `C8OFORMS_FUNCTIONAL_SECONDARY_MCP_TOKEN`; the secondary Studio user can be explicit or auto-provisioned with `CONVERTIGO_ADMIN_PASSWORD`. |
| X-003 | `functional-transverse.spec.ts` / `X-003 - mobile Preview button opens the viewer` (`fixme`) | Expose or define a user-clickable mobile Preview entry point. |

## Playwright Implementation Rules

- Specs can be grouped by domain, for example `functional-authoring.spec.ts`,
  `functional-components-common.spec.ts`, `functional-sources.spec.ts`,
  `functional-publication-sharing.spec.ts`.
- Each test creates its own preconditions: application, pages, components, and
  configuration through the Studio UI.
- No test may create or modify an application through CouchDB documents, direct
  sequence calls, or `nocode-form-*` MCP tools.
- External fixtures, for example Baserow, are `ensure-or-create`, then selected
  and configured from the Studio UI.
- Assertions should remain i18n-neutral: Convertigo priority classes, icons,
  component tags, routes, and observable DOM states before visible text.
- Any new reusable interaction must be promoted to
  dedicated functional helper files such as
  `tests/e2e/helpers/functional-studio.ts`. Existing shared helpers from
  `tests/e2e/helpers/studio.ts` may be reused, but should not be changed unless
  the change is intentionally shared with the non-regression suite.
- GitHub `feature` or `enhancement` tickets may be added as references in a
  column or test comment, without changing the functional nature of the
  scenario.
- Authentication coverage currently targets username/password login only. SSO
  providers such as Google, Microsoft, LinkedIn, and OpenID are out of scope
  until explicit product scenarios are defined.

## Core Journeys

| Status | ID | Functional test | Preconditions | Main assertions |
| --- | --- | --- | --- | --- |
| `[x]` | AUTH-001 | Log in with the current test user. | No pre-existing state. | The selector page loads and the blank application creation card is visible. |
| `[x]` | AUTH-002 | Log out, then return to a protected route. | User is logged in. | The session is closed; direct access to an editor redirects to login. |
| `[x]` | AUTH-003 | Session persistence after reload. | User is logged in on selector. | Reload keeps the user authenticated and applications remain accessible. |
| `[x]` | AUTH-004 | Change the user language. | User is logged in. | After changing language and reloading, the UI loads without breaking i18n-neutral selectors. |
| `[x]` | AUTH-005 | Invalid login. | None. | The error state appears and selector does not open. |
| `[x]` | AUTH-006 | Open the forgotten password modal. | User is on the username/password login screen. | The forgotten password modal opens, exposes the expected email input/action, and can be closed without logging in. Email delivery is not asserted unless a test mailbox or mail sink is available. |
| `[n/a]` | AUTH-SSO-001 | SSO login providers: Google, Microsoft, LinkedIn, OpenID. | Explicitly excluded from the current username/password login scope. | Keep as a catalog placeholder; define provider-specific expectations before any future automation. |
| `[x]` | APP-001 | Create a blank application. | User is logged in. | The editor opens on `/editor/<id>` and the page is empty. |
| `[x]` | APP-002 | Create an application from a template. | User is logged in; at least one template is available. | The created application contains the expected template components. |
| `[x]` | APP-003 | Create a folder and validate its title. | User is on selector. | The save button is disabled for an empty title; the folder appears after creation. |
| `[x]` | APP-004 | Rename an application. | Application created by the test. | The new name is visible on selector and persists after reload. |
| `[x]` | APP-005 | Delete an application with cancel then confirm. | Application created by the test. | Cancel keeps the app; confirm removes it from the list. |
| `[x]` | APP-006 | Duplicate an application. | Application with at least one component. | The copy opens, contains the component, and has a distinct title. |
| `[x]` | APP-007 | Move an application into a folder. | Folder and application created by the test. | The app appears in the folder; folder filters remain consistent. |
| `[x]` | APP-008 | Search applications by name, accents, case, and punctuation. | Applications named by the test. | Results remain correct and spaces/punctuation are preserved. |
| `[x]` | APP-009 | Selector filters: my applications, hidden folders, collaborators. | Apps/folders/collaborator created by the test. | Each filter isolates the expected population after activation and reload. |
| `[x]` | APP-010 | Open an existing application from selector. | App created, then user returned to selector. | The editor reopens the correct app and components are present. |

## Dashboard Sections

The dashboard sections may be empty on a clean environment. Tests that need
visible content must create their own application, source-backed component,
publication, and external Baserow table preconditions.

| Status | ID | Functional test | Preconditions | Main assertions |
| --- | --- | --- | --- | --- |
| `[x]` | DASH-001 | Access the dashboard sections for Edition apps, Published apps, and No-code database. | User is logged in. If the sections are empty, the test creates a new application, ensures a Baserow table, adds a component configured from that Baserow source, and publishes the application. | The three i18n dashboard sections are accessible through both entry points: the left main menu links and the three dashboard buttons. The created application is visible in Edition apps, the published application is visible in Published apps, and the Baserow table is visible in No-code database. |
| `[x]` | DASH-002 | Empty dashboard sections render usable empty states. | User has no edited app, no published app, or no Baserow-backed app in the relevant section. Automation covers no-match empty result states for Edition apps and Published apps through the dashboard search, verifies that the No-code database section opens a ready Baserow workspace without a stuck loader, and auto-provisions plus cleans the default empty fixture user through `C8Oforms.AddUser` when `CONVERTIGO_ADMIN_PASSWORD` is set. | Empty result states open without loader, crash, or broken layout, and still expose expected navigation/actions through dashboard buttons and left-menu links. |

## Editor, Pages, And Studio Shell

| Status | ID | Functional test | Preconditions | Main assertions |
| --- | --- | --- | --- | --- |
| `[x]` | EDT-001 | Navigate between Palette, Pages, Workflows, and Settings. | Blank application open. | Each panel opens, the canvas remains usable, and sidebar buttons stay visible. |
| `[x]` | EDT-002 | Open application settings from Workflows. | Editor is on Workflows. | Settings open without blocking sidebar navigation. |
| `[x]` | EDT-003 | Autosave a configuration after close/reload. | Component added and configured. | The configured value reappears after close, reopen, and browser reload. |
| `[x]` | EDT-004 | Add a page. | Blank application. | The page appears in the Pages panel and becomes navigable. |
| `[x]` | EDT-005 | Rename a page: empty, duplicate, valid name. | Two pages. | Expected errors appear; the valid name persists. |
| `[x]` | EDT-006 | Delete a page with cancel then confirm. | Two pages. | Cancel keeps the page; confirm deletes it without breaking the active page. |
| `[x]` | EDT-007 | Reorder pages. | Three pages. | Visual order changes and remains stable after reload. |
| `[x]` | EDT-008 | Duplicate a page. | Page with components. | The copied page contains the components and technical IDs are adjusted if needed. |
| `[x]` | EDT-009 | Configure page buttons. | Two pages. | Previous/next/submit buttons change according to configuration. |
| `[x]` | EDT-010 | Return home from editor, then reopen. | Application open. | Selector is displayed; reopen restores the same document. |

## Common Component Contract

These tests should be parameterized by component where possible. The base
component list comes from `PALETTE_ICON`: Layout, Group, Map, Text input,
Description, Checkbox, Checkbox group, Button, Radio, Radio group, Slider,
Select, Date, Time, Camera, Grid, Chart, Barcode, Import file, Signature,
Location, Business logic.

| Status | ID | Functional test | Preconditions | Main assertions |
| --- | --- | --- | --- | --- |
| `[x]` | CMP-COM-001 | Add every component from the palette. | Blank application. | The expected viewer/editor tag appears for each component. |
| `[x]` | CMP-COM-002 | Rename the technical identifier. | Component added. | The field keeps its value after blur. |
| `[x]` | CMP-COM-003 | Validate empty, duplicate, and invalid technical identifiers. | Two components. | Errors block save or restore a valid state. |
| `[x]` | CMP-COM-004 | Delete a component: cancel then confirm. | Component added. | Cancel keeps the component; confirm removes it from canvas and viewer. |
| `[x]` | CMP-COM-005 | Duplicate a component. | Configured component. | The copy keeps expected properties and receives a distinct technical ID. |
| `[x]` | CMP-COM-006 | Reorder components by drag-and-drop. | Three components. | DOM/viewer order follows the drag and persists after reload. |
| `[x]` | CMP-COM-007 | Configure common label, placeholder, and required state. | Compatible component. | Values render in editor and viewer. |
| `[x]` | CMP-COM-008 | Default value in visual, Aa, and JS modes. | Compatible component. | The viewer initializes the value according to each mode. |
| `[x]` | CMP-COM-009 | Visibility on the main target component types. | Text source created through UI. | One visible and one hidden instance behave correctly for Text, Description, Checkbox, Checkbox group, Select, Radio, Radio group, Slider, Button, Date, Time, Camera, Barcode, Import file, Signature, and Location. |
| `[x]` | CMP-COM-010 | Component navigation with a condition. | Two pages and source component. | Page change occurs only when the condition is true. |

## Component Matrix

| Status | ID | Component | Functional tests to cover |
| --- | --- | --- | --- |
| `[x]` | CMP-TEXT-001 | Text input | Label, placeholder, required state, default value, viewer input, submission. |
| `[x]` | CMP-TEXT-002 | Text input | Aa/JS/Source Palette default values and `fields[...]` expressions. |
| `[x]` | CMP-DESC-001 | Description | TinyMCE, rich text, Source Palette insertion, editor/viewer rendering. |
| `[x]` | CMP-CHECK-001 | Checkbox | Local options: add, delete, order, default selection, submission. |
| `[x]` | CMP-CHECK-002 | Checkbox | Baserow source configuration and viewer behavior are covered. The tests ensure the Baserow table schema exists, replace the default empty rows with controlled option rows, configure a Checkbox source through the Studio UI, persist display/value column mappings, reopen the picker to verify the mappings, render the Baserow rows as viewer options, select multiple options, and submit the response. |
| `[x]` | CMP-CHECKGROUP-001 | Checkbox group | Default rows/options, visual/Aa/JS default values, custom row and option labels, viewer rendering, and submission are covered. | The configuration persists renamed rows/options after reopening, Preview renders the custom labels, applies the configured multi-selection defaults, and submits successfully. |
| `[x]` | CMP-RADIO-001 | Radio | Local options, default value, exclusive selection, submission. |
| `[x]` | CMP-RADIOGROUP-001 | Radio group | Default rows/options, visual/Aa/JS default values, custom row and option labels, viewer rendering, and submission are covered. | The configuration persists renamed rows/options after reopening, Preview renders the custom labels, applies the configured per-row radio defaults, and submits successfully. |
| `[x]` | CMP-SELECT-001 | Select | Local options, default value, and dropdown opening without empty trailing zone are covered. | The current Studio UI does not expose a local Select search control, so the functional contract is covered by the available local-option behavior. |
| `[x]` | CMP-SELECT-002 | Select | Baserow source configured through the UI and verified through `SRC-003`, `SRC-006`, and `SRC-007`. | Display/value columns persist after reopen; filtering by a hidden text column keeps only matching viewer options; sorting by a hidden numeric column controls viewer option order. |
| `[x]` | CMP-SLIDER-001 | Slider | Min, Max, Step, Min label, Max label, Pin/value display, Snaps/tick marks, and editor/viewer value are covered. | The Slider configuration persists data and style values, editor/viewer rendering exposes value indicator and tick marks, and the viewer value can be changed with the configured step. |
| `[?]` | CMP-DATE-001 | Date | Default value, configured min/max bounds, default displayed format, direct viewer picker editing, edited formatted value, viewer submission, and alternate display-format option persistence (`YYYY/MM/DD`) are covered. A dedicated `fixme` tracks runtime alternate-format rendering and timezone-specific assertions, which still need stable product contracts: current exploration showed the persisted `YYYY/MM/DD` option still renders the viewer input as `DD/MM/YYYY`. |
| `[?]` | CMP-TIME-001 | Time | Default HH:mm value, viewer picker input, edited value rendering, submission, and alternate display-format option persistence (`hh:mm:ss:A`) are covered. A dedicated `fixme` tracks runtime 12-hour/seconds rendering, which still needs a stable product contract: current exploration showed the persisted `hh:mm:ss:A` option still opens the viewer picker with a 24-hour `h23` hour cycle. |
| `[x]` | CMP-BUTTON-001 | Button | Simple label, advanced TinyMCE label, icon, icon removal, editor/viewer rendering. |
| `[x]` | CMP-BUTTON-002 | Button | A Text source and a Button are created through the UI; the Button state is configured as enabled only when the source equals the expected value, and a Toast action is added to the Button workflow. | In Preview, a non-matching source value keeps the Button disabled; the matching value enables it; clicking the enabled Button runs the configured Toast workflow. |
| `[x]` | CMP-MAP-001 | Map | A Map is created through the UI, configured with a custom height, checked in the editor and Preview, then covered by a dedicated reset scenario. | The configured height renders in editor and viewer; clearing the height returns the editor and viewer to the default Map height, and reopening the configuration does not restore the custom value. |
| `[x]` | CMP-MAP-002 | Map | A Map is created through the UI and backed by a Baserow source with title, latitude, and longitude roles. | Reopening the Map source configuration keeps the three roles selected; Preview renders at least the expected Leaflet markers and exposes their Baserow titles. |
| `[x]` | CMP-GRID-001 | Grid | Baserow source, visible columns, rendered rows, footer toggle, pagination mode, rows-per-page persistence, hidden-column rendering through `CMP-GRID-002`, and typed Baserow formatting are covered. The typed-format scenario verifies Date EU, Date ISO, DateTime US 12h, Duration h:mm:ss display values, and anti-regression checks against raw duration seconds, old `yyyy/mm/dd` fallback, and one-hour datetime shifts. |
| `[x]` | CMP-GRID-002 | Grid | A dedicated Baserow table is filtered by a text status column, sorted by a numeric rank column, includes a nullable text column hidden from the viewer, and is configured to return the selected row. | The hidden column state persists after reopening the source configuration; Preview shows only filtered rows in sorted order without the hidden column header/value, the first visible row becomes selected when clicked, and the same filtered/sorted/hidden-column state remains after viewer reload. |
| `[x]` | CMP-CHART-001 | Chart | A Chart is created through the UI and backed by a Baserow source with category/value roles; the Chart type toggle exposes the supported types and is switched through `line` then `donut`; height is switched from automatic to personalized. | Source roles, selected `donut` type, and personalized height persist after reopening the configuration; switching back to automatic hides the personalized height input; Preview renders the configured Chart surface. |
| `[x]` | CMP-CAMERA-001 | Camera | Required validation, hidden image file input fallback, selected-image preview, and viewer submission are covered. | Native camera capture requires a dedicated browser/device fixture and is out of scope for the current desktop Playwright functional contract. |
| `[x]` | CMP-FILE-001 | Import file | Dedicated upload modal, default single-file selection, configured multiple-file mode, max-size refusal, accepted file rendering, Preview submission, published PWA submission, stored response entries, and downloadable attachments are covered. The current File submissions editor exposes multiple-file and max-size settings, not a file-type allow-list control. |
| `[x]` | CMP-BARCODE-001 | Barcode | Fallback input, configured placeholder, required validation, action buttons presence, produced value, and viewer submission are covered. | Camera scan and image-based decoding require a dedicated browser/device fixture and are out of scope for the current desktop Playwright functional contract. |
| `[x]` | CMP-SIGN-001 | Signature | Required validation, draw, clear, redraw, canvas state, Preview submission, published PWA submission, stored response metadata, and downloadable persisted signature image are covered. |
| `[x]` | CMP-LOCATION-001 | Location | Accepted geolocation permission, manual get-position action, produced latitude/longitude value, and viewer submission are covered. Refused geolocation permission is also covered: the component keeps an empty `n/a` value and a required Location blocks submission. | The functional permission/value/submission contract is covered; exact localized permission-error copy is intentionally not asserted without a product text contract. |
| `[x]` | CMP-LAYOUT-001 | Horizontal layout | Add Text input, Description, and Checkbox children through drag-and-drop; reorder a nested child; delete one child without deleting the layout. |
| `[x]` | CMP-GROUP-001 | Group | Add child components, visibility on group, deletion/reorder. |
| `[x]` | CMP-BIZ-001 | Business logic | Static and dynamic Business logic formulas are created through Workflows and consumed from the Source Palette by Select defaults. | A static formula is evaluated in Preview and again after viewer reload; a JavaScript formula returning `fields[id]` initializes the Select from a Text source and refreshes when that source value changes, without parsing toasts. |

## Sources, Data, And Source Palette

| Status | ID | Functional test | Preconditions | Main assertions |
| --- | --- | --- | --- | --- |
| `[x]` | SRC-001 | Open the source selection panel from a compatible component. | Component added. | The source panel appears. |
| `[x]` | SRC-002 | Configure a Baserow table for Grid. | Table ensure-created. | Expected columns are visible and the viewer displays rows. |
| `[x]` | SRC-003 | Configure Select from Baserow. | Table ensure-created. | Display/value columns persist after reopen. |
| `[x]` | SRC-004 | Configure Chart from Baserow. | Table ensure-created. | Category and Value persist after reopen. |
| `[x]` | SRC-005 | Configure Map from Baserow. | Table ensure-created. | Title/Latitude/Longitude persist after reopen. |
| `[?]` | SRC-006 | Filter a source in visual, Aa, and JS modes. | Source-backed Select component with an ensure-created Baserow table. Current automation covers the visual filter builder (`FilterBR`) by selecting the hidden field/operator through the UI, covers the Aa/text value mode, and covers JavaScript/Monaco authoring by dropping `translation/getBrowserLang` from the Source Palette into the filter value. `FilterBR` exposes text and JavaScript value buttons, not a separate third visual value button. A dedicated `fixme` tracks the viewer JavaScript runtime contract. | The viewer displays only expected rows for the visual + Aa/text filter; the JS editor receives the expected Source Palette code and drag payload. JavaScript runtime filtering remains unstable because a separate static JS exploration returned unfiltered viewer rows, so this needs a stable product contract before it can be marked complete. |
| `[x]` | SRC-007 | Sort a source, including by hidden column. | Source-backed Select component with an ensure-created Baserow table and a hidden numeric sort column. | Viewer order follows the configured descending hidden-column sort. |
| `[x]` | SRC-008 | Source Palette: sections, collapse all, and drag payload. | Editor with visible Source Palette. Automation covers visible sections, collapse-all, manual section toggles, and drag payload for `user/email`. | The current Source Palette does not expose a dedicated search control; the available section/collapse/drag behavior is covered. |
| `[x]` | SRC-009 | Source error: missing table or incompatible schema. | Data Grid source is intentionally left without a configured Baserow table. | The Sort panel displays the missing-configuration error state without an infinite loader. |
| `[?]` | SRC-010 | Multi-user isolation for Baserow sources. | Two configured test users, a primary MCP token, and a secondary MCP token are required. The secondary Studio user can be explicit or auto-provisioned with `CONVERTIGO_ADMIN_PASSWORD`; `C8OFORMS_FUNCTIONAL_SECONDARY_MCP_TOKEN` is still required for the isolated secondary Baserow fixture. | Each user should see only their own Baserow workspace/table in the source picker; keep the final CI fixture contract explicit before marking this item complete. |

## Visibility, States, And Navigation

| Status | ID | Functional test | Preconditions | Main assertions |
| --- | --- | --- | --- | --- |
| `[x]` | VIS-001 | Visibility modes: always, never, authenticated, unauthenticated, condition. | Description targets and a Text source are created through the UI, then the application is checked in authenticated Preview and as an anonymous published PWA opened from a fresh browser context. | In the authenticated viewer, always/authenticated/condition targets render while never/unauthenticated targets stay hidden; in the anonymous viewer, always/unauthenticated/condition targets render while never/authenticated targets stay hidden without requiring login. |
| `[x]` | VIS-002 | All condition operators. | Filled, empty, and numeric Text sources plus filled and empty Checkbox sources are created through the UI. | Visible and hidden Description targets validate `equals`, `different`, `contains`, `not_contains`, `among_following`, `out_following`, `is_empty`, `is_filled`, `greater`, `greaterequals`, `minus`, and `minusequals` in Preview. |
| `[x]` | VIS-003 | Visibility on every target component type. | Text source created through the UI. Current automation is implemented as `CMP-COM-009` for Text, Description, Checkbox, Checkbox group, Select, Radio, Radio group, Slider, Button, Date, Time, Camera, Barcode, Import file, Signature, and Location, plus dedicated `VIS-003` scenarios for Grid, Chart, Map, Layout, and Group. | One visible and one hidden instance behaves correctly for each target type covered by the Studio palette categories: main components, data display components, layout, and container. |
| `[x]` | VIS-004 | Field picker: sort, search, scroll, and selection. | Several named Text components are created through the UI in a non-alphabetical order, then one Description target opens the Visibility field picker. | The picker lists the created Text sources in alphabetical order, keeps a bounded scroll-ready list, filters by search, lets the searched field be selected, and keeps the chosen field after reopening the Visibility config. |
| `[x]` | VIS-005 | Conditions based on Date, Time, Select, Radio, and Checkbox group. | Select, Radio, Date, Time, and Checkbox group sources are configured through the UI with deterministic default values. | Select, Radio, Date, Time, and Checkbox group `equals` conditions show matching targets and hide non-matching targets in Preview, including Checkbox group multiple-value tags such as `Line 1_Option 1`. |
| `[x]` | VIS-006 | Cancel a Visibility mode change. | A Description component has a conditional Visibility rule based on a Text source. | Cancelling the confirmation keeps the conditional mode, field, operator, and value after reopening the config; confirming the switch selects the simple target mode and hides the condition controls. |
| `[x]` | NAV-001 | Simple navigation to another page. | Two pages are created through the UI with unique Description markers. | The viewer opens on Page 1; clicking the i18n-neutral Next tab button opens the target page and hides the source marker. |
| `[x]` | NAV-002 | Conditional navigation by Select/Radio/Checkbox. | Select, Radio, and Checkbox sources are each created through the UI with two local options and a target page. | For each source type, a non-matching value keeps the viewer on the source page and the configured matching value opens the target page. |
| `[x]` | NAV-003 | Navigation after page reorder or rename. | A Radio component has a conditional navigation rule targeting a second page, then that target page is renamed through the Pages panel. | Reopening the Radio navigation config shows the renamed target page, and selecting the matching Radio value in Preview still opens the target page marker. |
| `[n/a]` | NAV-004 | External URL/mail/tel navigation if supported. | Button or compatible component. Current Navigation helpers and UI/code inspection expose stable `goTo` and `authorize` actions only; no external URL/mail/tel action entry point has been identified in the current product UI. | Kept as a catalog placeholder. Move back to `[ ]` only when a supported external URL/mail/tel navigation entry point and URL contract are exposed. |

## Workflows And Actions

| Status | ID | Functional test | Preconditions | Main assertions |
| --- | --- | --- | --- | --- |
| `[x]` | WF-001 | Open a button workflow and add an action. | A Button component is created through the UI. | The Button workflow opens, a Toast action appears on the workflow canvas, and its Message configuration opens. |
| `[x]` | WF-002 | Submit action with required validations. | A required Text input is created through the UI. | The viewer Submit action is blocked while the required Text input is empty, keeps the viewer on the form, then completes the response after the required value is filled. |
| `[x]` | WF-003 | If action: Fields, Aa, JS modes and visible tabs. | A Text source and Button workflow are created through the UI. | The If action keeps the selected Text source, exposes Fields, Aa, and JavaScript modes, exposes a field operator select, and shows only the If configuration tab. |
| `[x]` | WF-004 | Loop action: iterators and Source Palette button. | A Button workflow is created through the UI. | The Loop action appears on the workflow canvas, its Source Palette button is fully visible, and the iterator can be configured in Aa and JavaScript modes. |
| `[x]` | WF-005 | Toast action. | A Button component and Toast action are configured through the UI. | Clicking the Button in Preview displays the configured Toast message. |
| `[x]` | WF-006 | Send mail action. | A Button workflow is created through the UI. | To, JavaScript subject, body with a Source Palette user-name token, and Form summary persist after returning to action selection and reselecting the Mail action. |
| `[x]` | WF-007 | No-Code Database Add Row action. | A Baserow table is ensure-created, then Text sources and Button workflows are created through the UI. | Name and Note mappings use distinct Source Palette entries; clicking the Button in Preview runs Add Row and the action response contains the created row with both mapped values. A separate configuration test verifies that an Add Row column mapping exposes the delete action, opens the confirmation dialog, and is removed from the mapping list after confirmation. |
| `[n/a]` | WF-008 | Update Row and Delete Row actions if exposed. | Baserow table ensure-created. Current code and helper catalog expose Add Row / local-grid row actions, but no stable No-Code Database Update Row or Delete Row action entry was identified in the current product UI. | Kept as a catalog placeholder. Move back to `[ ]` only when stable No-Code Database Update Row/Delete Row actions are exposed and the row identity plus error-handling contract is defined. |
| `[x]` | WF-009 | Replace an already configured action. | A Send mail action is configured with To, JavaScript subject, body token, and Form summary through the UI. | Reselecting the same Mail action opens the replacement warning; cancelling the warning closes it and preserves every configured value. |
| `[x]` | WF-010 | Workflow persistence after close/reload. | A Button workflow with a configured Toast action is created through the UI. | After reloading the editor, the Button workflow can be reopened, the Toast action is still on the workflow canvas, and its configured message is preserved. |

## Publication, PWA, Viewer, And Responses

| Status | ID | Functional test | Preconditions | Main assertions |
| --- | --- | --- | --- | --- |
| `[x]` | PUB-001 | Publish an authenticated application. | Application created and published as an authenticated PWA through the UI. | The PWA document persists `notAnonymous=true`, the app appears in Published Applications, and the published viewer opens for the current authenticated user. |
| `[x]` | PUB-002 | Publish an anonymous application. | Application created and published as an anonymous PWA through the UI. | The PWA document persists `notAnonymous=false`; the standalone public PWA opens in a fresh browser context without a logged-in Studio session. |
| `[x]` | PUB-003 | Edit an existing PWA without republishing a new app. | PWA already published. | Updating only the PWA short name changes the PWA document revision, keeps the published application version unchanged, and does not duplicate the Published Applications card. |
| `[x]` | PUB-004 | Switch anonymous back to authenticated. | Anonymous PWA. | Saving the existing PWA as authenticated persists `notAnonymous=true`, and reopening the PWA editor shows the authenticated access mode selected. |
| `[x]` | PUB-005 | PWA configuration: name, short name, icon, color. | A PWA is published through the UI wizard, then its PWA document and reopened PWA editor are checked. | The PWA document persists name, short name, and a visible theme/background color; the reopened editor shows the persisted name and short name plus the icon editor; the published viewer opens with the application title and themed toolbar color. |
| `[x]` | PUB-006 | Viewer toolbar buttons: reload, menu, theme. | Anonymous PWA published with its generated theme. | The published toolbar is visible; reload and menu buttons expose the theme color through Ionic CSS variables and rendered icon color, with transparent hover background. |
| `[x]` | PUB-007 | Submit a simple form. | Anonymous published app with one required and one optional Text input created through the UI. | The published viewer accepts both values and reaches the response completion page, indicating that the response was created. |
| `[x]` | PUB-008 | Submit with files, signature, and media components. | Media components. Current automation covers Import file, Camera fallback image, Barcode fallback, Signature, and Location submissions in the Studio Preview viewer, plus an anonymous published PWA submission with Import file, Camera fallback image, Barcode fallback, and Signature. | Preview and published PWA submissions reach the response completion page with produced media values; `APIV2_getResponses` exposes the stored Barcode value, Import file, Camera, and Signature entries; Import file, Camera, and Signature attachment URLs are downloadable with non-empty payloads and expected content types. |
| `[x]` | PUB-009 | Viewer on mobile/tablet/desktop. | Anonymous published app with a Text input, opened on mobile, tablet, and desktop viewports. | The viewer renders, the Text input remains visible, and the menu, reload, and submit actions stay inside the viewport and pass Playwright actionability checks. |
| `[x]` | PUB-010 | PWA offline/cache mode. | Anonymous and authenticated PWAs with Text input witnesses are published through the UI. Current automation verifies each published PWA serves `manifest.webmanifest`, `ngsw.json`, and `ngsw-worker.js`, that service-worker metadata exposes the expected `app` and `assets` asset groups, opens each standalone PWA, verifies Angular service-worker registration and page control, verifies CacheStorage contains Angular/PWA app-shell entries for the target PWA, then reloads offline and confirms the cached Text input still renders and remains editable. | PWA cache metadata, service-worker registration/control, CacheStorage population, anonymous offline reload, authenticated offline reload with an active session, and cached form-data rendering/actionability are covered. |

## Sharing, Collaborators, And Rights

| Status | ID | Functional test | Preconditions | Main assertions |
| --- | --- | --- | --- | --- |
| `[x]` | SHARE-001 | Add a collaborator from the editor. | Application created and editor collaborators modal opened through the UI. Automation selects the first available collaborator from autocomplete, saves the modal, verifies through `APIV2_GetManageAccessRights` that the collaborator is persisted in the access-rights document, then adds an explicit or auto-provisioned functional secondary user and logs in as that collaborator. | UI add, save, access-rights persistence, and cross-user collaborator discovery are covered. The collaborator finds the shared app with My applications disabled and does not see it as an owned app with My applications enabled. |
| `[x]` | SHARE-002 | CSV button available in the collaborators modal. | Application created and the editor collaborators modal opened through the UI. | The modal exposes a `.csv` file input and a visible associated button that opens a single-file chooser. |
| `[x]` | SHARE-003 | Import collaborators from CSV. | Application created and the editor collaborators modal opened through the UI. The test resolves an existing user through autocomplete, then imports a generated CSV row using `email;Edition_Responses`. | The CSV-imported collaborator is listed before save, the imported rights value is applied, and the modal saves successfully. |
| `[x]` | SHARE-004 | Remove a collaborator. | Application created, existing collaborator added from autocomplete, modal saved, access-rights persistence verified through `APIV2_GetManageAccessRights`, modal reopened, collaborator removed through the row action, saved again, reopened for UI verification, then `APIV2_GetManageAccessRights` is checked again to confirm the collaborator is absent. Cross-user automation also uses an explicit or auto-provisioned functional secondary user as owner. | UI removal, access-rights persistence/revocation, and cross-user revocation are covered; the revoked user no longer finds the app after revocation. |
| `[x]` | SHARE-005 | Share with a group. | A temporary group fixture is created through admin sequences, the published application share modal is opened through the UI, the group is selected from autocomplete, the modal is saved, the published document is verified, then the group/share fixture is cleaned up. Cross-user automation resolves an explicit or auto-provisioned functional secondary user from Admin users, adds that user to the temporary group, shares an authenticated PWA with the group, and opens the PWA as the group member. | Group creation, UI selection, save, persistence, cleanup, and group-member PWA access are covered. |
| `[x]` | SHARE-006 | Share a published application with email notification. | PWA published. Automation opens the Share application modal, selects a new recipient, enables email notification, verifies configurable subject/body fields before save, saves the modal, reopens it, and verifies the recipient remains listed. | Mail delivery/reception is intentionally out of scope; the subject/body fields are invitation parameters for newly added recipients and are not expected to reopen for existing recipients. |
| `[x]` | SHARE-007 | Public link and QR code for an anonymous PWA. | Anonymous PWA published through the UI. The functional scenario covers the Published Applications QR toggle, including show/hide labels and tooltip state, then enables the public share link from the published application sharing modal. | The QR control remains usable, the public-link QR label is shown, and the public-link setting remains enabled after saving and reopening the sharing modal. |
| `[x]` | SHARE-008 | Access denied for unauthorized user. | Authenticated PWA not shared. Automation creates the private PWA and opens it as an explicit or auto-provisioned functional secondary user. | The denied state renders for the unauthorized user without crash or infinite loader. |
| `[x]` | SHARE-009 | Search apps where I am a collaborator. | Automation uses an explicit or auto-provisioned functional secondary user as the other owner: that owner creates an app, shares it with the current user, then the current user searches it from the selector. | The shared app appears when the collaborator searches with the My applications filter disabled, and disappears when My applications is enabled. |

## Settings, Administration, And Cross-Cutting Quality

| Status | ID | Functional test | Preconditions | Main assertions |
| --- | --- | --- | --- | --- |
| `[x]` | SET-001 | Manage user MCP tokens. | User is logged in and opens Settings. | The MCP URL is visible; a named token can be created with a one-shot raw value, existing listings do not expose the raw token after reload, and the token can be revoked. |
| `[x]` | SET-002 | User profile and preferences. | User is logged in. Automation covers language preference persistence through `AUTH-004`, MCP token preferences through `SET-001`, displayed profile identity in Settings, and default home page (`published_First`) preference persistence through `SET-002`. | The current Settings UI exposes profile identity as display-only information; no editable profile fields are available in the functional contract. |
| `[x]` | SET-003 | Server symbols/settings impacting the viewer, such as logo/RGPD. | Admin fixtures are available for `C8Oforms.customHeaderLogo` and the GDPR configuration document. Current automation sets a temporary custom header logo through the Convertigo admin API, creates and submits an application through the Studio UI, verifies the custom logo is rendered and height-constrained on the viewer completion page, then restores the original symbol. It also sets a temporary GDPR viewer toast in all supported languages, publishes a simple anonymous PWA through the Studio UI, verifies the configured toast appears in the published viewer, then restores the previous GDPR configuration. Finally, it sets language-specific GDPR menu sections, switches the active Studio language through `fr`, `en`, `es`, and `it`, opens the GDPR page, verifies the matching localized menu text is rendered, and restores the previous user language and GDPR configuration. | Custom header logo, GDPR viewer toast, and localized GDPR menu rendering are covered. |
| `[x]` | ADM-001 | User and group management. | A dedicated functional Studio user is explicitly configured or auto-provisioned with the C8Oforms admin right. Automation logs in through the normal username/password UI, opens the Admin dashboard, verifies Users and Groups management grids/toolbars, creates a temporary group through the Admin Groups UI, enables the Application editing permission, verifies the group appears in the Admin Groups list, verifies the group and persisted `editing_rights` through admin sequences, selects an existing user from the visible Users grid, opens the user Actions popover, adds that user through the Add user to group modal, verifies the member relation through `admin_users_get_by_group_v2`, verifies the rendered Admin Groups UI shows the member counter and selected user, opens the group Actions popover, edits the group through the edit group modal, enables `publication`, verifies persistence, then removes the added relation and temporary group. | Admin access, management surfaces, non-destructive group creation/cleanup, list refresh, permission assignment at creation, Add user to group modal, member relation, rendered counters, selected member rendering, direct edit-group modal rights update, persistence checks, and cleanup are covered. |
| `[x]` | X-001 | FR/EN/ES/IT multilingual smoke. | The selector page is opened after login, then reloaded with forced `fr`, `en`, `es`, and `it` Studio languages. | The selector page and blank application entry render in each language through i18n-neutral selectors. |
| `[x]` | X-002 | Chromium/Firefox/WebKit cross-browser smoke. | A short authoring + preview smoke is run on Chromium, Firefox, and WebKit. | Login, blank application creation, palette-based Text input creation, and Preview rendering work on all three browsers. |
| `[?]` | X-003 | Responsive editor + viewer smoke. | A blank application with a Text input is created through the UI and checked on desktop, tablet, and mobile viewports. A dedicated mobile Preview scenario remains drafted as `fixme`: current exploration at 390px confirms the Preview button is rendered and enabled, but the native button is outside the viewport, the toolbar cannot be horizontally scrolled into view, and the mobile overflow menu exposes application-management actions but no Preview action. | The editor keeps the Preview button rendered and the Text input visible on all three viewports; Preview is opened from desktop and the viewer Text input remains visible and editable on desktop, tablet, and mobile. A stable user-clickable mobile entry point for opening Preview is needed before this can be marked complete. |
| `[x]` | X-004 | Reload robustness while editing. | A Text input is added through the UI and its Technical ID is changed while the component configuration is open. | Reloading the editor returns to a usable toolbar, the Text input is still present, and reopening the configuration shows the edited Technical ID persisted. |

## Proposed Creation Order

1. `functional-authoring.spec.ts`: AUTH-001 to AUTH-006, APP-001 to APP-010,
   DASH-001 to DASH-002, EDT-001 to EDT-010.
2. `functional-components-common.spec.ts`: CMP-COM-001 to CMP-COM-010 on a first
   batch of simple components.
3. `functional-components-values.spec.ts`: defaults, viewer input, and submit
   for Text, Checkbox, Radio, Select, Slider, Date, Time.
4. `functional-components-media.spec.ts`: Import file, Camera, Barcode,
   Signature, Location, and other media/input components.
5. `functional-sources.spec.ts`: SRC-001 to SRC-010 with ensure-created Baserow
   fixtures.
6. `functional-visibility.spec.ts`: VIS-001 to VIS-006.
7. `functional-navigation.spec.ts`: NAV-001 to NAV-004.
8. `functional-workflows.spec.ts`: WF-001 to WF-010.
9. `functional-publication-sharing.spec.ts`: PUB-001 to PUB-009 and SHARE-001 to
   SHARE-009.
10. `functional-settings.spec.ts`: SET-001 to SET-003.
10. `functional-transverse.spec.ts`: X-001 to X-004 on a short but representative
   subset.
