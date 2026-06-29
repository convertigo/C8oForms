# Backlog des tests de non-regression

Derniere mise a jour: 2026-06-29

Source: issues GitHub `convertigo/C8oForms`, etat ouvert ou ferme, limitees au milestone `2.2.0` (milestone 2.2).

Criteres inclus: labels `bug`, `type bug`, `enhancement`, `proposal`, `task`, `critical`, `major`, `minor`, `trivial`, `Testing`. Le repo ne contient pas de label `feature`; les demandes de fonctionnalite sont couvertes par `enhancement` et `proposal`.

Exclusions automatiques: `documentation`, `duplicate`, `invalid`, `question`, `wontfix`, `dependencies`, `Can't reproduce`, et tickets identifies comme doublons hors label.

Colonne Test: `[x]` signifie que le ticket est reference dans `tests/e2e/regression-manifest.json`, dans un `alsoCovers`, dans un spec local `tests/e2e/issue-*.spec.ts`, ou porte le label GitHub `Auto QA Test`.

Resume: 232 tickets dans le milestone `2.2.0`; 224 tickets candidats; 53 deja couverts; 171 a couvrir (24 ouverts, 147 fermes); 8 exclus par label, absence de label candidat, ou exclusion explicite.

| Test | Ticket | Etat | Labels | Titre | Preuve |
| --- | --- | --- | --- | --- | --- |
| [ ] | [#1411](https://github.com/convertigo/C8oForms/issues/1411) | open | enhancement | Allow per-component border, margin, and padding customization |  |
| [ ] | [#1409](https://github.com/convertigo/C8oForms/issues/1409) | open | enhancement | Use configured column names and column width mode in grid editor preview |  |
| [ ] | [#1393](https://github.com/convertigo/C8oForms/issues/1393) | open | enhancement | Add more tooltips in configuration labels to improve clarity of settings and component options |  |
| [ ] | [#1390](https://github.com/convertigo/C8oForms/issues/1390) | open | enhancement | Tabs buttons configuration should support Wrap/Scroll in Header/Footer and allow vertical placement (Left/Right) |  |
| [ ] | [#1386](https://github.com/convertigo/C8oForms/issues/1386) | open | enhancement | Buttons configuration can only be set per Page; no option to configure buttons globally for the whole application |  |
| [ ] | [#1362](https://github.com/convertigo/C8oForms/issues/1362) | open | enhancement | Flow list chooser not accurate with new layout and not usable with long lists |  |
| [ ] | [#1359](https://github.com/convertigo/C8oForms/issues/1359) | open | enhancement | Version history with restore capability needed for applications |  |
| [ ] | [#1350](https://github.com/convertigo/C8oForms/issues/1350) | open | enhancement | Search app by user should allow filtering only applications where I am a collaborator |  |
| [ ] | [#1245](https://github.com/convertigo/C8oForms/issues/1245) | open | enhancement | Redesign the “Create Empty App” button for better clarity and visual appeal |  |
| [ ] | [#1184](https://github.com/convertigo/C8oForms/issues/1184) | open | enhancement | Disable Warning on Mode Switch Aa to JS |  |
| [ ] | [#1168](https://github.com/convertigo/C8oForms/issues/1168) | open | enhancement | Not filled aA variables of a custom data source sends empty string |  |
| [ ] | [#1165](https://github.com/convertigo/C8oForms/issues/1165) | open | enhancement | Add one or more users to one or more groups from Groups Management |  |
| [ ] | [#1160](https://github.com/convertigo/C8oForms/issues/1160) | open | enhancement | Avoid Red error Toast when DnD a component to a JS Editor |  |
| [ ] | [#1153](https://github.com/convertigo/C8oForms/issues/1153) | open | enhancement | Support multiple selection in Select component |  |
| [ ] | [#1149](https://github.com/convertigo/C8oForms/issues/1149) | open | enhancement | Message in mail not translated from generic task "Send an email" |  |
| [ ] | [#1130](https://github.com/convertigo/C8oForms/issues/1130) | open | enhancement | Chart component does not have the 'Radio' chart type |  |
| [ ] | [#1113](https://github.com/convertigo/C8oForms/issues/1113) | open | enhancement | Camera component: Default sourceable value |  |
| [ ] | [#1108](https://github.com/convertigo/C8oForms/issues/1108) | open | enhancement | RadioGroup component : Sourceable rows, columns and default values |  |
| [ ] | [#1106](https://github.com/convertigo/C8oForms/issues/1106) | open | enhancement | Forms Query Lacks Pagination in Edit Apps and Published Apps (APIV2_ExecuteView) |  |
| [ ] | [#1079](https://github.com/convertigo/C8oForms/issues/1079) | open | enhancement | Add Better Support for OpenID Login (Support Groups and Dynamic Scopes) |  |
| [ ] | [#1054](https://github.com/convertigo/C8oForms/issues/1054) | open | enhancement | Issue showing BR File type in Grid bean |  |
| [ ] | [#1043](https://github.com/convertigo/C8oForms/issues/1043) | open | enhancement | Possibilty to download the PDF attachment file in an application |  |
| [ ] | [#606](https://github.com/convertigo/C8oForms/issues/606) | open | enhancement | Capability to decide what attachment is sent in the Send Mail action |  |
| [ ] | [#75](https://github.com/convertigo/C8oForms/issues/75) | open | major, task | Gestion du multilangue |  |
| [x] | [#1434](https://github.com/convertigo/C8oForms/issues/1434) | closed | bug, QC-Passed, Auto QA Test | Import file component displays an empty Navigation category | Auto QA Test<br>e2e/issue-1434.spec.ts |
| [ ] | [#1432](https://github.com/convertigo/C8oForms/issues/1432) | closed | enhancement, QC-Passed | Allow selecting category and value fields when configuring chart data sources |  |
| [ ] | [#1431](https://github.com/convertigo/C8oForms/issues/1431) | closed | enhancement, QC-Passed | Add a TinyMCE editing mode for the Button component |  |
| [x] | [#1430](https://github.com/convertigo/C8oForms/issues/1430) | closed | bug, QC-Passed, Auto QA Test | Baserow source fails when sorting by a hidden field | Auto QA Test<br>e2e/issue-1430.spec.ts |
| [x] | [#1429](https://github.com/convertigo/C8oForms/issues/1429) | closed | bug, QC-Passed, Auto QA Test | Import File component opens an oversized modal with incorrect .c8oforms project import wording | Auto QA Test<br>e2e/issue-1429.spec.ts |
| [ ] | [#1428](https://github.com/convertigo/C8oForms/issues/1428) | closed | enhancement, QC-Passed | The condition action (If) does not use the modernized interface for condition modes (Fields, Aa, JS) |  |
| [x] | [#1426](https://github.com/convertigo/C8oForms/issues/1426) | closed | bug, QC-Passed, Auto QA Test | Setting server symbol **C8Oforms.customHeaderLogo** causes oversized logo after submitting a response | Auto QA Test<br>e2e/issue-1426.spec.ts |
| [x] | [#1425](https://github.com/convertigo/C8oForms/issues/1425) | closed | bug, QC-Passed, Auto QA Test | Palette button is half hidden in Flow actions configuration | Auto QA Test<br>e2e/issue-1425.spec.ts |
| [x] | [#1424](https://github.com/convertigo/C8oForms/issues/1424) | closed | bug, Auto QA Test | Baserow datetime values shifted by one hour in the data grid (default timezone Europe/Paris instead of UTC) | Auto QA Test<br>e2e/issue-1416.spec.ts |
| [x] | [#1423](https://github.com/convertigo/C8oForms/issues/1423) | closed | bug, Auto QA Test | Baserow column picker resolves the wrong user's table (project-scoped table_id cache keyed by name only) | Auto QA Test<br>e2e/issue-1423.spec.ts |
| [x] | [#1422](https://github.com/convertigo/C8oForms/issues/1422) | closed | bug, Auto QA Test | Default value in Text mode shows “Unexpected token '??'” after dragging a Palette source | Auto QA Test<br>e2e/issue-1109.spec.ts |
| [x] | [#1421](https://github.com/convertigo/C8oForms/issues/1421) | closed | bug, Auto QA Test | Port anonymous form loading error handling improvements to 2.2.0 | Auto QA Test<br>e2e/issue-1421.spec.ts |
| [x] | [#1419](https://github.com/convertigo/C8oForms/issues/1419) | closed | bug, Auto QA Test | Visibility: single checkbox equality value is edited as chips and lost after reopening | Auto QA Test<br>e2e/issue-1419.spec.ts |
| [ ] | [#1418](https://github.com/convertigo/C8oForms/issues/1418) | closed | enhancement, Testing | End-to-end regression testing framework (ticket-driven, version-verified) |  |
| [ ] | [#1417](https://github.com/convertigo/C8oForms/issues/1417) | closed | bug | BaseRow config validation should use the current form document instead of the editor form |  |
| [x] | [#1416](https://github.com/convertigo/C8oForms/issues/1416) | closed | bug, QC-Passed, Auto QA Test | Baserow data source does not return dates in the correct format | Auto QA Test<br>e2e/issue-1416.spec.ts |
| [ ] | [#1415](https://github.com/convertigo/C8oForms/issues/1415) | closed | enhancement, QC-Passed | Reload button and menu button in a published app do not use the theme |  |
| [ ] | [#1414](https://github.com/convertigo/C8oForms/issues/1414) | closed | enhancement, QC-Passed | No-Code Database date columns set to European format are displayed as `yyyy/mm/dd` in the Grid component |  |
| [x] | [#1413](https://github.com/convertigo/C8oForms/issues/1413) | closed | bug, QC-Passed, Auto QA Test | Description component breaks when using a Grid Palette value whose column name contains a single quote | Auto QA Test<br>e2e/issue-1413.spec.ts |
| [x] | [#1412](https://github.com/convertigo/C8oForms/issues/1412) | closed | bug, QC-Passed, Auto QA Test | Map height breaks after opening Data & Interactions | Auto QA Test<br>e2e/issue-1412.spec.ts<br>e2e/issue-1412-reopened.spec.ts |
| [x] | [#1410](https://github.com/convertigo/C8oForms/issues/1410) | closed | enhancement, QC-Passed, Auto QA Test | Add grid footer and pagination display settings | Auto QA Test<br>e2e/issue-1410.spec.ts |
| [ ] | [#1408](https://github.com/convertigo/C8oForms/issues/1408) | closed | enhancement, QC-Passed | Allow selecting latitude and longitude fields when configuring map data sources |  |
| [x] | [#1407](https://github.com/convertigo/C8oForms/issues/1407) | closed | bug, QC-Passed, Auto QA Test | Cannot switch PWA access from anonymous back to authenticated | Auto QA Test<br>e2e/issue-1407.spec.ts |
| [ ] | [#1406](https://github.com/convertigo/C8oForms/issues/1406) | closed | bug | Fix response viewer action label according to user permissions |  |
| [x] | [#1405](https://github.com/convertigo/C8oForms/issues/1405) | closed | bug, QC-Passed, Auto QA Test | Grid columns are incorrectly sized when the grid becomes visible after being hidden | Auto QA Test<br>e2e/issue-1405.spec.ts |
| [x] | [#1404](https://github.com/convertigo/C8oForms/issues/1404) | closed | enhancement, Auto QA Test | Add user-managed MCP tokens in settings | Auto QA Test<br>e2e/issue-1404.spec.ts |
| [ ] | [#1403](https://github.com/convertigo/C8oForms/issues/1403) | closed | bug | Viewer computeVariable should preserve empty string expressions while resolving runtime scopes |  |
| [x] | [#1402](https://github.com/convertigo/C8oForms/issues/1402) | closed | bug, QC-Passed, Auto QA Test | Select component from a data source shows a large empty zone at the end of the data list | Auto QA Test<br>e2e/issue-1402.spec.ts |
| [x] | [#1401](https://github.com/convertigo/C8oForms/issues/1401) | closed | bug, QC-Passed, Auto QA Test | Database Connector configuration shows 404 icons, and Select data source always re‑selects two columns instead of one | Auto QA Test<br>e2e/issue-1401.spec.ts |
| [ ] | [#1400](https://github.com/convertigo/C8oForms/issues/1400) | closed | enhancement, QC-Passed | Add a dedicated Gallery component for data-driven visual item selection |  |
| [x] | [#1399](https://github.com/convertigo/C8oForms/issues/1399) | closed | bug, QC-Passed, Auto QA Test | Viewer expressions using api.* no longer resolve correctly | Auto QA Test<br>e2e/issue-1399.spec.ts |
| [ ] | [#1398](https://github.com/convertigo/C8oForms/issues/1398) | closed | enhancement, QC-Passed | Select data sources cannot filter on columns different from display/value columns |  |
| [ ] | [#1397](https://github.com/convertigo/C8oForms/issues/1397) | closed | bug | performSubmitAction can duplicate datasource-backed option children for checkbox, select, and radio fields |  |
| [x] | [#1396](https://github.com/convertigo/C8oForms/issues/1396) | closed | bug, QC-Passed, Auto QA Test | Checkbox component values are not applied to a Baserow multiple‑selection column | Auto QA Test<br>e2e/issue-1396.spec.ts |
| [x] | [#1395](https://github.com/convertigo/C8oForms/issues/1395) | closed | bug, QC-Passed, Auto QA Test | Using `fields[my_var]` instead of `fields["grid1"]` is replaced by `null` inside the Monaco Editor | Auto QA Test<br>e2e/issue-1395.spec.ts |
| [x] | [#1394](https://github.com/convertigo/C8oForms/issues/1394) | closed | enhancement, QC-Passed, Auto QA Test | Source palette should offer a collapse all option | Auto QA Test<br>e2e/issue-1394.spec.ts |
| [x] | [#1392](https://github.com/convertigo/C8oForms/issues/1392) | closed | bug, QC-Passed, Auto QA Test | Clicking the Page buttons configuration redirects to “General” instead of “Navigation” | Auto QA Test<br>e2e/issue-1392.spec.ts |
| [ ] | [#1391](https://github.com/convertigo/C8oForms/issues/1391) | closed | enhancement, QC-Passed | Login page allows customizing images via Server Symbols, but the text cannot be customized |  |
| [x] | [#1389](https://github.com/convertigo/C8oForms/issues/1389) | closed | bug, QC-Passed, Auto QA Test | Long page names hide the delete button in the Pages panel | Auto QA Test<br>e2e/issue-1389.spec.ts |
| [ ] | [#1388](https://github.com/convertigo/C8oForms/issues/1388) | closed | bug, QC-Passed | Copy to page alert is not migrated to the new design |  |
| [ ] | [#1387](https://github.com/convertigo/C8oForms/issues/1387) | closed | bug, QC-Passed | Side button labels are too short and unclear |  |
| [ ] | [#1385](https://github.com/convertigo/C8oForms/issues/1385) | closed | bug, QC-Passed | ‘+’ button to add a new Page is not visible enough and hard to find |  |
| [x] | [#1384](https://github.com/convertigo/C8oForms/issues/1384) | closed | bug, QC-Passed, Auto QA Test | Add collaborators modal proposes CSV import but no button is available | Auto QA Test<br>e2e/issue-1384.spec.ts |
| [x] | [#1383](https://github.com/convertigo/C8oForms/issues/1383) | closed | bug, QC-Passed, Auto QA Test | Page renaming shows “Page name already exists” when the field is empty | Auto QA Test<br>e2e/issue-1383.spec.ts |
| [x] | [#1382](https://github.com/convertigo/C8oForms/issues/1382) | closed | bug, QC-Passed, Auto QA Test | Chart component height field does not allow entering “auto” although the UI suggests it | Auto QA Test<br>e2e/issue-1382.spec.ts |
| [x] | [#1381](https://github.com/convertigo/C8oForms/issues/1381) | closed | bug, QC-Passed, Auto QA Test | Visibility condition value picker does not save selected grid fields | Auto QA Test<br>e2e/issue-1381.spec.ts |
| [x] | [#1380](https://github.com/convertigo/C8oForms/issues/1380) | closed | bug, QC-Passed, Auto QA Test | Vertical bar buttons do not reset to their default section when switching between Workflows, Pages, and Palette | Auto QA Test<br>e2e/issue-1380.spec.ts |
| [ ] | [#1379](https://github.com/convertigo/C8oForms/issues/1379) | closed | enhancement, QC-Passed | Dragging components inside Group or Horizontal Layout shows no indication of the target component type |  |
| [ ] | [#1378](https://github.com/convertigo/C8oForms/issues/1378) | closed | enhancement | Add a flow action to reset fields by scope while preserving default values and computed values |  |
| [ ] | [#1377](https://github.com/convertigo/C8oForms/issues/1377) | closed | bug, QC-Passed | Chips preview display differs from chips configuration in Text mode |  |
| [ ] | [#1376](https://github.com/convertigo/C8oForms/issues/1376) | closed | bug | [Engine] Fix regression in AD login assigning all users to a shared group |  |
| [x] | [#1375](https://github.com/convertigo/C8oForms/issues/1375) | closed | enhancement, QC-Passed, Auto QA Test | Opening the Application settings hides the side bar buttons, preventing quick navigation to other sections | Auto QA Test<br>e2e/issue-1375.spec.ts |
| [x] | [#1374](https://github.com/convertigo/C8oForms/issues/1374) | closed | bug, QC-Passed, Auto QA Test | Application configuration cannot be opened from Workflows | Auto QA Test<br>e2e/issue-1374.spec.ts |
| [ ] | [#1373](https://github.com/convertigo/C8oForms/issues/1373) | closed | enhancement, QC-Passed | Headers for Flows must show hover feedback when editable |  |
| [ ] | [#1372](https://github.com/convertigo/C8oForms/issues/1372) | closed | enhancement, QC-Passed | Add a “pen” (edit) icon in Flows, similar to the one available in Pages configuration |  |
| [ ] | [#1371](https://github.com/convertigo/C8oForms/issues/1371) | closed | enhancement, QC-Passed | Harmonize validation, delete, and copy buttons across all pages |  |
| [x] | [#1370](https://github.com/convertigo/C8oForms/issues/1370) | closed | bug, QC-Passed, Auto QA Test | Message configuration of a Toast component writes **“true”** instead of inserting the component chip in text mode | Auto QA Test<br>e2e/issue-1370.spec.ts |
| [x] | [#1368](https://github.com/convertigo/C8oForms/issues/1368) | closed | bug, QC-Passed, Auto QA Test | Application name formatting is altered in search results | Auto QA Test<br>e2e/issue-1368.spec.ts |
| [ ] | [#1367](https://github.com/convertigo/C8oForms/issues/1367) | closed | enhancement, QC-Passed | Background color too close to Studio primary color makes drop zones invisible |  |
| [x] | [#1366](https://github.com/convertigo/C8oForms/issues/1366) | closed | bug, QC-Passed, Auto QA Test | Searching for applications and adding a collaborator breaks the search results | Auto QA Test<br>e2e/issue-1366.spec.ts |
| [x] | [#1365](https://github.com/convertigo/C8oForms/issues/1365) | closed | bug, QC-Passed, Auto QA Test | The default icon **“bulb-outline”** for the Button component cannot be found in the icons list | Auto QA Test<br>e2e/issue-1365.spec.ts |
| [x] | [#1364](https://github.com/convertigo/C8oForms/issues/1364) | closed | bug, QC-Passed, Auto QA Test | Cannot reorder child components inside an Horizontal layout component | Auto QA Test<br>e2e/issue-1364.spec.ts |
| [x] | [#1363](https://github.com/convertigo/C8oForms/issues/1363) | closed | bug, QC-Passed, Auto QA Test | Deleting a component inside an Horizontal layout also deletes the Horizontal layout itself and all its content | Auto QA Test<br>e2e/issue-1363.spec.ts |
| [ ] | [#1361](https://github.com/convertigo/C8oForms/issues/1361) | closed | bug, QC-Passed | The Workflows list does not correctly display the last flow name when it is at the bottom of a scroll |  |
| [ ] | [#1360](https://github.com/convertigo/C8oForms/issues/1360) | closed | enhancement, QC-Passed | Duplicate an entire page inside an application to save time |  |
| [ ] | [#1358](https://github.com/convertigo/C8oForms/issues/1358) | closed | enhancement, QC-Passed | Long application names are truncated instead of wrapping inside the card |  |
| [x] | [#1357](https://github.com/convertigo/C8oForms/issues/1357) | closed | enhancement, QC-Passed, Auto QA Test | Elements list in Visibility condition is not sorted, has no search bar, and gives no scroll indication | Auto QA Test<br>e2e/issue-1357.spec.ts |
| [x] | [#1356](https://github.com/convertigo/C8oForms/issues/1356) | closed | bug, QC-Passed, Auto QA Test | Icon selection in Button component cannot be cleared (no way to remove the icon) | Auto QA Test<br>e2e/issue-1356.spec.ts |
| [x] | [#1355](https://github.com/convertigo/C8oForms/issues/1355) | closed | bug, QC-Passed, Auto QA Test | "Style du bouton" and "Icone du bouton" sections are not translated in other languages than French | Auto QA Test<br>e2e/issue-1355.spec.ts |
| [x] | [#1354](https://github.com/convertigo/C8oForms/issues/1354) | closed | bug, QC-Passed, Auto QA Test | Remove the “Question” section from Button components (misleading, CSS is configured in “Style”) | Auto QA Test<br>e2e/issue-1354.spec.ts |
| [x] | [#1353](https://github.com/convertigo/C8oForms/issues/1353) | closed | bug, QC-Passed, Auto QA Test | “Sort” filter shows infinite progress bar when Data source is not configured | Auto QA Test<br>e2e/issue-1353.spec.ts |
| [ ] | [#1352](https://github.com/convertigo/C8oForms/issues/1352) | closed | bug, QC-Passed | Hidden folders filter only applies after changing view |  |
| [ ] | [#1351](https://github.com/convertigo/C8oForms/issues/1351) | closed | bug, QC-Passed | Limit Baserow table data scan to 1000 rows by default |  |
| [ ] | [#1349](https://github.com/convertigo/C8oForms/issues/1349) | closed | bug, QC-Passed | User search bar shows “undefined” when a user has no display name |  |
| [ ] | [#1348](https://github.com/convertigo/C8oForms/issues/1348) | closed | bug, QC-Passed | "My applications" filter does not work and becomes persistent after reload |  |
| [ ] | [#1347](https://github.com/convertigo/C8oForms/issues/1347) | closed | bug, QC-Passed | Share and collaboration icons are not positioned correctly |  |
| [ ] | [#1346](https://github.com/convertigo/C8oForms/issues/1346) | closed | bug, QC-Passed | Missing padding under QR code labels on selector page |  |
| [ ] | [#1345](https://github.com/convertigo/C8oForms/issues/1345) | closed | bug, QC-Passed | Flow continues executing after leaving Preview mode and even on the Studio home page |  |
| [ ] | [#1344](https://github.com/convertigo/C8oForms/issues/1344) | closed | bug, QC-Passed | User search filter should only be visible to administrators |  |
| [ ] | [#1343](https://github.com/convertigo/C8oForms/issues/1343) | closed | bug, QC-Passed | Add‑row action: added columns cannot be deleted (no delete button) |  |
| [x] | [#1342](https://github.com/convertigo/C8oForms/issues/1342) | closed | bug, QC-Passed, Auto QA Test | Map component: “From a data source” button does not open the source selection panel | Auto QA Test<br>e2e/issue-1342.spec.ts |
| [ ] | [#1341](https://github.com/convertigo/C8oForms/issues/1341) | closed | bug, QC-Passed | i18n translations missing for the “Chart” component |  |
| [x] | [#1340](https://github.com/convertigo/C8oForms/issues/1340) | closed | bug, QC-Passed, Auto QA Test | Search bar is accent‑case‑sensitive in both directions (uppercase ↔ lowercase), causing applications not to be found | Auto QA Test<br>e2e/issue-1340.spec.ts |
| [ ] | [#1339](https://github.com/convertigo/C8oForms/issues/1339) | closed | bug, QC-Passed | Visibility tab: condition is deleted when switching options or cancelling dialog |  |
| [ ] | [#1338](https://github.com/convertigo/C8oForms/issues/1338) | closed | bug, QC-Passed | Search by username does not work on the selector page |  |
| [x] | [#1337](https://github.com/convertigo/C8oForms/issues/1337) | closed | bug, QC-Passed, Auto QA Test | Create Folder button still looks disabled after entering a folder name | Auto QA Test<br>e2e/issue-1337.spec.ts |
| [ ] | [#1336](https://github.com/convertigo/C8oForms/issues/1336) | closed | bug, QC-Passed | Fix QR button tooltip and toggle label on selector page |  |
| [x] | [#1335](https://github.com/convertigo/C8oForms/issues/1335) | closed | bug, QC-Passed, Auto QA Test | Then/Else sections are empty and cannot be configured in “If” condition action | Auto QA Test<br>e2e/issue-1335.spec.ts |
| [x] | [#1334](https://github.com/convertigo/C8oForms/issues/1334) | closed | bug, QC-Passed, Auto QA Test | Fields in “If condition” action show no operator (empty box) | Auto QA Test<br>e2e/issue-1334.spec.ts |
| [ ] | [#1332](https://github.com/convertigo/C8oForms/issues/1332) | closed | enhancement, QC-Passed | Page loads twice on first execution of a published app, with brief “insufficient permissions” message |  |
| [ ] | [#1331](https://github.com/convertigo/C8oForms/issues/1331) | closed | bug, QC-Passed | Add/update row action: all columns share the same configuration |  |
| [ ] | [#1330](https://github.com/convertigo/C8oForms/issues/1330) | closed | bug, QC-Passed | TechnicalID field cannot be selected with the mouse in Firefox (drag action triggered) |  |
| [x] | [#1329](https://github.com/convertigo/C8oForms/issues/1329) | closed | bug, QC-Passed, Auto QA Test | Loop action sections “Loop” and “Actions” are empty and cannot be configured | Auto QA Test<br>e2e/issue-1329.spec.ts |
| [ ] | [#1328](https://github.com/convertigo/C8oForms/issues/1328) | closed | enhancement, QC-Passed | Rework UI of “Add or update a row in a no‑code database” actions |  |
| [x] | [#1327](https://github.com/convertigo/C8oForms/issues/1327) | closed | bug, QC-Passed, Auto QA Test | Can’t switch between Aa and JS modes in Condition (if) action | Auto QA Test<br>e2e/issue-1327.spec.ts |
| [ ] | [#1326](https://github.com/convertigo/C8oForms/issues/1326) | closed | bug, QC-Passed | Updating an existing PWA republishes a new application version |  |
| [ ] | [#1325](https://github.com/convertigo/C8oForms/issues/1325) | closed | enhancement, QC-Passed | Improve PWA configuration modal UX and simplify publication flow |  |
| [x] | [#1324](https://github.com/convertigo/C8oForms/issues/1324) | closed | bug, QC-Passed, Auto QA Test | Chart component shows “undefined” on hover for default values | Auto QA Test<br>e2e/issue-1324.spec.ts |
| [ ] | [#1323](https://github.com/convertigo/C8oForms/issues/1323) | closed | bug, QC-Passed | Warn before replacing configured action or data source values |  |
| [ ] | [#1322](https://github.com/convertigo/C8oForms/issues/1322) | closed | bug, QC-Passed | Editor palette sometimes misses available background task actions until reload |  |
| [ ] | [#1321](https://github.com/convertigo/C8oForms/issues/1321) | closed | bug, QC-Passed | Page settings icon is clickable without function, and “Disabled” label is not capitalized |  |
| [ ] | [#1320](https://github.com/convertigo/C8oForms/issues/1320) | closed | bug, QC-Passed | Buttons navigation look differs between Edition and Preview when “Following the application” is enabled |  |
| [ ] | [#1319](https://github.com/convertigo/C8oForms/issues/1319) | closed | bug, QC-Passed | RGPD symbol not applied for languages other than FR due to new admin RGPD feature |  |
| [ ] | [#1318](https://github.com/convertigo/C8oForms/issues/1318) | closed | bug, QC-Passed | Share the application modal no longer offers to send an email notification to users or groups |  |
| [ ] | [#1317](https://github.com/convertigo/C8oForms/issues/1317) | closed | bug, QC-Passed | Send mail action: “form summary” checkbox becomes checked after returning from action selection |  |
| [ ] | [#1316](https://github.com/convertigo/C8oForms/issues/1316) | closed | bug, QC-Passed | Sub-PWA layout and branding regressions |  |
| [ ] | [#1315](https://github.com/convertigo/C8oForms/issues/1315) | closed | bug, QC-Passed | Page navigation filter text field is not saved and chip mode is unclear |  |
| [ ] | [#1314](https://github.com/convertigo/C8oForms/issues/1314) | closed | bug, QC-Passed | PWA builds can miss env.json, making generated PWAs inaccessible |  |
| [ ] | [#1313](https://github.com/convertigo/C8oForms/issues/1313) | closed | bug, QC-Passed | Improve action configuration editors layout and usability |  |
| [ ] | [#1312](https://github.com/convertigo/C8oForms/issues/1312) | closed | bug, QC-Passed | Icons Aa, JS and trash are too small and misaligned (Grid Filters, Sort, Formula, etc.) |  |
| [ ] | [#1311](https://github.com/convertigo/C8oForms/issues/1311) | closed | bug, QC-Passed | Users dashboard: missing column title for “provider” and manually created users shown as “Unknown user |  |
| [ ] | [#1310](https://github.com/convertigo/C8oForms/issues/1310) | closed | bug, QC-Passed | Checkboxes invisible when unchecked during group creation |  |
| [ ] | [#1309](https://github.com/convertigo/C8oForms/issues/1309) | closed | bug, QC-Passed | Email notification action can fail when sending a response email |  |
| [ ] | [#1308](https://github.com/convertigo/C8oForms/issues/1308) | closed | bug, QC-Passed | Page reordering: no visual indicator and pages can only be dragged upward (not downward) |  |
| [ ] | [#1307](https://github.com/convertigo/C8oForms/issues/1307) | closed | bug, QC-Passed | Form publishing: icon selection step shows image overlapping its cards and page layout |  |
| [ ] | [#1306](https://github.com/convertigo/C8oForms/issues/1306) | closed | bug | Persist and rebuild PWA when authentication mode changes from Manage Access Rights |  |
| [ ] | [#1305](https://github.com/convertigo/C8oForms/issues/1305) | closed | bug, QC-Passed | Fix QR code label for unauthenticated share links |  |
| [ ] | [#1304](https://github.com/convertigo/C8oForms/issues/1304) | closed | bug, QC-Passed | Hidden Baserow columns lose hidden flag when cell value is null |  |
| [ ] | [#1303](https://github.com/convertigo/C8oForms/issues/1303) | closed | bug, QC-Passed | Firefox: text selection impossible in JS Monaco editor |  |
| [ ] | [#1302](https://github.com/convertigo/C8oForms/issues/1302) | closed | bug, QC-Passed | Double-encoded characters when resubmitting a non-looping form |  |
| [ ] | [#1300](https://github.com/convertigo/C8oForms/issues/1300) | closed | bug, QC-Passed | Typo in French translation for only one response in App |  |
| [ ] | [#1299](https://github.com/convertigo/C8oForms/issues/1299) | closed | enhancement, QC-Passed | Lazy load icons in the icon picker modal |  |
| [ ] | [#1298](https://github.com/convertigo/C8oForms/issues/1298) | closed | enhancement, QC-Passed | Duplicate button gives no visual feedback that the component was duplicated |  |
| [ ] | [#1297](https://github.com/convertigo/C8oForms/issues/1297) | closed | bug, QC-Passed | Multiple icon picker modals can open when clicking rapidly on page icon fields |  |
| [ ] | [#1296](https://github.com/convertigo/C8oForms/issues/1296) | closed | bug, QC-Passed | Visibility condition placeholder incorrectly shows “Column” instead of a generic term |  |
| [ ] | [#1295](https://github.com/convertigo/C8oForms/issues/1295) | closed | bug, QC-Passed | Display page title” setting is not applied in Preview or Published mode |  |
| [ ] | [#1294](https://github.com/convertigo/C8oForms/issues/1294) | closed | bug, QC-Passed | Visibility condition “is_filled” is not applied for text inputs, radio buttons, or checkboxes |  |
| [ ] | [#1293](https://github.com/convertigo/C8oForms/issues/1293) | closed | bug, QC-Passed | Page reordering breaks component visibility configuration |  |
| [ ] | [#1292](https://github.com/convertigo/C8oForms/issues/1292) | closed | bug, QC-Passed | Slider component configuration: “Min Label” and “Max Label” fields are missing in Data & Interactions |  |
| [ ] | [#1291](https://github.com/convertigo/C8oForms/issues/1291) | closed | bug, QC-Passed | Editor page is missing bottom padding under some components |  |
| [ ] | [#1290](https://github.com/convertigo/C8oForms/issues/1290) | closed | bug, QC-Passed | In Firefox Navigation buttons have no hover decoration and do not indicate clickability |  |
| [ ] | [#1289](https://github.com/convertigo/C8oForms/issues/1289) | closed | bug, QC-Passed | Select component preview is broken: empty blue button on the right and options list partially hidden |  |
| [ ] | [#1288](https://github.com/convertigo/C8oForms/issues/1288) | closed | enhancement, QC-Passed | Grid source configuration: columns search bar requires ENTER instead of live search |  |
| [ ] | [#1287](https://github.com/convertigo/C8oForms/issues/1287) | closed | bug, QC-Passed | Checkbox grid configuration allows multiple row/column selections in single-selection mode |  |
| [ ] | [#1286](https://github.com/convertigo/C8oForms/issues/1286) | closed | bug, QC-Passed | Slider component: Min and Max fields are not numeric inputs |  |
| [ ] | [#1285](https://github.com/convertigo/C8oForms/issues/1285) | closed | enhancement, QC-Passed | Add Line/Column buttons are not visible enough |  |
| [ ] | [#1283](https://github.com/convertigo/C8oForms/issues/1283) | closed | QC-Passed, task | Page and app configuration UI is not migrated to the new design |  |
| [ ] | [#1282](https://github.com/convertigo/C8oForms/issues/1282) | closed | bug, QC-Passed | Page buttons are displayed at the top of the form in editor mode |  |
| [ ] | [#1281](https://github.com/convertigo/C8oForms/issues/1281) | closed | bug, QC-Passed | Viewer tabs no longer work as in 2.1.x |  |
| [ ] | [#1280](https://github.com/convertigo/C8oForms/issues/1280) | closed | bug, QC-Passed | Unexpected icons displayed in page list |  |
| [ ] | [#1279](https://github.com/convertigo/C8oForms/issues/1279) | closed | bug, QC-Passed | Dropped variables do not work in data source filter Monaco editors |  |
| [ ] | [#1278](https://github.com/convertigo/C8oForms/issues/1278) | closed | bug, QC-Passed | Palette search placeholders should be left-aligned |  |
| [ ] | [#1277](https://github.com/convertigo/C8oForms/issues/1277) | closed | bug, QC-Passed | Long table names overflow in modalConfigure data source table selection |  |
| [ ] | [#1276](https://github.com/convertigo/C8oForms/issues/1276) | closed | task | Investigate ghost components after copying components between pages |  |
| [ ] | [#1275](https://github.com/convertigo/C8oForms/issues/1275) | closed | bug, QC-Passed | Table multi-row selection checkboxes are displayed incorrectly |  |
| [ ] | [#1274](https://github.com/convertigo/C8oForms/issues/1274) | closed | bug, QC-Passed | Radio group alignment issue between columns and rows |  |
| [ ] | [#1273](https://github.com/convertigo/C8oForms/issues/1273) | closed | bug, QC-Passed | Button label cannot be renamed |  |
| [ ] | [#1272](https://github.com/convertigo/C8oForms/issues/1272) | closed | bug, QC-Passed | Slider element options are not displayed in most browsers |  |
| [ ] | [#1271](https://github.com/convertigo/C8oForms/issues/1271) | closed | bug, QC-Passed | Missing tooltips on sidebar buttons |  |
| [ ] | [#1270](https://github.com/convertigo/C8oForms/issues/1270) | closed | bug, QC-Passed | Grid source configuration: column summary counts become inconsistent when “Include” is unchecked |  |
| [ ] | [#1269](https://github.com/convertigo/C8oForms/issues/1269) | closed | bug, QC-Passed | Grid source configuration: individual column visibility toggles no longer work |  |
| [ ] | [#1268](https://github.com/convertigo/C8oForms/issues/1268) | closed | bug, QC-Passed | Grid URLs field type is displayed as “Unknown type” in columns configuration |  |
| [ ] | [#1267](https://github.com/convertigo/C8oForms/issues/1267) | closed | enhancement, QC-Passed | Grid source configuration: column titles are not aligned with row values |  |
| [ ] | [#1266](https://github.com/convertigo/C8oForms/issues/1266) | closed | task | Port datasource context isolation and viewer lazy loading to NGX |  |
| [ ] | [#1265](https://github.com/convertigo/C8oForms/issues/1265) | closed | QC-Passed, task | [Grid - Source configuration] Search bar placeholder still shows “carriage return” icon although search is now live |  |
| [ ] | [#1264](https://github.com/convertigo/C8oForms/issues/1264) | closed | bug, QC-Passed | Grid source configuration: filtered items require two separate clicks to select |  |
| [ ] | [#1263](https://github.com/convertigo/C8oForms/issues/1263) | closed | bug, QC-Passed | TinyMCE is displayed in all Configuration menus |  |
| [ ] | [#1262](https://github.com/convertigo/C8oForms/issues/1262) | closed | task | Align No-Code Database 8.4.x with functional updates from 8.4.x legacy |  |
| [ ] | [#1261](https://github.com/convertigo/C8oForms/issues/1261) | closed | enhancement, QC-Passed | Make URL fields clickable in No-Code Database tables |  |
| [ ] | [#1260](https://github.com/convertigo/C8oForms/issues/1260) | closed | bug | Fix modalConfigure crash when a workspace contains a dashboard |  |
| [ ] | [#1259](https://github.com/convertigo/C8oForms/issues/1259) | closed | enhancement, QC-Passed | C8Oforms.IdentifierValue symbol should also have a sibling for placeholder value |  |
| [ ] | [#1257](https://github.com/convertigo/C8oForms/issues/1257) | closed | bug, QC-Passed | Checkboxes component “From a data source” displays no items |  |
| [ ] | [#1256](https://github.com/convertigo/C8oForms/issues/1256) | closed | bug, QC-Passed | Brevo button overlaps the AI‑Assistant button |  |
| [ ] | [#1255](https://github.com/convertigo/C8oForms/issues/1255) | closed | bug, QC-Passed | Grid inside Group breaks Source selection & configuration |  |
| [ ] | [#1254](https://github.com/convertigo/C8oForms/issues/1254) | closed | bug, QC-Passed | Search bar in Grid source selection prevents accessing sub‑elements after selecting a filtered item |  |
| [ ] | [#1253](https://github.com/convertigo/C8oForms/issues/1253) | closed | bug, QC-Passed | No scrollbars when Workspaces, Databases or Tables lists exceed window height in Grid source selection |  |
| [ ] | [#1252](https://github.com/convertigo/C8oForms/issues/1252) | closed | bug, QC-Passed | Horizontal layout does not reflect configuration unless switching to Preview mode |  |
| [ ] | [#1251](https://github.com/convertigo/C8oForms/issues/1251) | closed | bug, QC-Passed | Using search input in Components Palette triggers constant 404 errors when hovering filtered components |  |
| [ ] | [#1250](https://github.com/convertigo/C8oForms/issues/1250) | closed | bug, QC-Passed | Grid component: JS Filter does not work |  |
| [ ] | [#1249](https://github.com/convertigo/C8oForms/issues/1249) | closed | bug, QC-Passed | Dragging formulas inside JS formula editor no longer copies the JS value |  |
| [ ] | [#1248](https://github.com/convertigo/C8oForms/issues/1248) | closed | bug, QC-Passed | Anonymous published app cannot be opened — user is told they have insufficient permissions |  |
| [ ] | [#1247](https://github.com/convertigo/C8oForms/issues/1247) | closed | bug, QC-Passed | TinyMCE editor no longer appears in components such as Description, Input Text, etc. |  |
| [ ] | [#1246](https://github.com/convertigo/C8oForms/issues/1246) | closed | bug, QC-Passed | Cannot drag & drop components to reorder them inside an app (regression) |  |
| [ ] | [#1244](https://github.com/convertigo/C8oForms/issues/1244) | closed | QC-Passed, task | Login Page: All links inside the Card point to the same URL |  |
| [ ] | [#1239](https://github.com/convertigo/C8oForms/issues/1239) | closed | enhancement | Optimize admin users grid backend pagination, filtering, and sorting with AG Grid Community-compatible server-side paths |  |
| [ ] | [#1238](https://github.com/convertigo/C8oForms/issues/1238) | closed | bug, QC-Passed | Fix admin users grid rendering and provider/source normalization |  |
| [ ] | [#1234](https://github.com/convertigo/C8oForms/issues/1234) | closed | bug, QC-Passed | TinyMCE Does Not Allow Margin Customization Through UI |  |
| [ ] | [#1210](https://github.com/convertigo/C8oForms/issues/1210) | closed | task | Update Template to 8.4.0 standalone |  |
| [ ] | [#1209](https://github.com/convertigo/C8oForms/issues/1209) | closed | bug | Dark Theme Still Applies on Devices in Dark Mode After Toggle Removal |  |
| [ ] | [#1188](https://github.com/convertigo/C8oForms/issues/1188) | closed | bug, QC-Passed | Missing Columns After Token Renewal in No Code Database Table |  |
| [ ] | [#1123](https://github.com/convertigo/C8oForms/issues/1123) | closed | enhancement, QC-Passed | Make table data scrolled next to database |  |
| [ ] | [#1121](https://github.com/convertigo/C8oForms/issues/1121) | closed | enhancement, QC-Passed | Separate databases name from baserow projects/workspaces |  |
| [ ] | [#1120](https://github.com/convertigo/C8oForms/issues/1120) | closed | bug, QC-Passed | Wrong Users in Group count |  |
| [ ] | [#1119](https://github.com/convertigo/C8oForms/issues/1119) | closed | bug, QC-Passed | Fail to add a new group |  |
| [x] | [#1109](https://github.com/convertigo/C8oForms/issues/1109) | closed | enhancement, Auto QA Test | Select / radio / checkbox component : Make default value sourceable | Auto QA Test<br>e2e/issue-1109.spec.ts |
| [ ] | [#1107](https://github.com/convertigo/C8oForms/issues/1107) | closed | enhancement, QC-Passed | Application Search Should Be Debounced |  |
| [ ] | [#1104](https://github.com/convertigo/C8oForms/issues/1104) | closed | enhancement, QC-Passed | Enlarge component drop zone |  |
| [ ] | [#1088](https://github.com/convertigo/C8oForms/issues/1088) | closed | enhancement, QC-Passed | Page Settings tab as default instead of Application tab |  |
| [x] | [#1086](https://github.com/convertigo/C8oForms/issues/1086) | closed | enhancement, Auto QA Test | Have a default value for Radio Group and Check Group | Auto QA Test<br>e2e/issue-1086.spec.ts |
| [ ] | [#1083](https://github.com/convertigo/C8oForms/issues/1083) | closed | enhancement, QC-Passed | Add Support for No-Code Database Group By |  |
| [ ] | [#1082](https://github.com/convertigo/C8oForms/issues/1082) | closed | enhancement, QC-Passed | Add Support for No-Code Database Sort |  |
| [ ] | [#1077](https://github.com/convertigo/C8oForms/issues/1077) | closed | enhancement, QC-Passed | [New Design] Admin - Home page |  |
| [ ] | [#1076](https://github.com/convertigo/C8oForms/issues/1076) | closed | enhancement, QC-Passed | [New Design] Side panel menu |  |
| [ ] | [#1073](https://github.com/convertigo/C8oForms/issues/1073) | closed | enhancement, QC-Passed | [New Design] Login page |  |
| [ ] | [#1064](https://github.com/convertigo/C8oForms/issues/1064) | closed | enhancement | UI-UX update |  |
| [ ] | [#1063](https://github.com/convertigo/C8oForms/issues/1063) | closed | enhancement, QC-Passed | Add the ability to build nested filter queries from the form editor |  |
| [x] | [#1058](https://github.com/convertigo/C8oForms/issues/1058) | closed | enhancement, QC-Passed, Auto QA Test | Baserow duration format not supported in Grid bean | Auto QA Test<br>e2e/issue-1058.spec.ts |
| [ ] | [#1032](https://github.com/convertigo/C8oForms/issues/1032) | closed | enhancement | Improvements for #1020 |  |
| [ ] | [#884](https://github.com/convertigo/C8oForms/issues/884) | closed | enhancement | Restrict Sequences According to User Rights |  |
| [ ] | [#505](https://github.com/convertigo/C8oForms/issues/505) | closed | enhancement | Improve conditional page authorisation / navigation |  |
