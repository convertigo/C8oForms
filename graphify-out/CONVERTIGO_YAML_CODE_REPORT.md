# Convertigo YAML Code Analysis

This pass parses `_c8oProject/**/*.yaml` as structured Convertigo code.
The full object AST is written to JSONL, while the Graphify graph receives
canonical YAML source nodes, bean-type summaries, variable declarations,
script-section summaries, and deterministic dependency edges.

## Outputs

- Graph: `graphify-out/graph.json`
- Backup before YAML-code enrichment: `graphify-out/graph.before-convertigo-yaml-code.json`
- Full AST index: `graphify-out/convertigo-yaml-code-ast.jsonl`
- Machine summary: `graphify-out/convertigo-yaml-code-summary.json`

## Counts

- YAML files parsed: 451
- YAML AST objects indexed: 55040
- Graph nodes after enrichment: 4679
- Graph edges after enrichment: 15588
- YAML-code graph nodes: 2760
- YAML-code graph edges: 9606

## Relations Added

- `contains_bean_type`: 4010
- `declares_variable`: 2171
- `yaml_invokes_shared_action`: 995
- `yaml_uses_shared_component`: 846
- `corresponds_to_graphify_node`: 451
- `contains_script_section`: 396
- `yaml_navigates_to_page`: 235
- `yaml_generates_frontend`: 220
- `yaml_calls_sequence`: 214
- `yaml_uses_connector`: 68

## Top Bean Types

- `ngx.components.UIDynamicElement`: 12629
- `ngx.components.UIStyle`: 7996
- `ngx.components.UIAttribute`: 7908
- `ngx.components.UIUseVariable`: 4445
- `ngx.components.UIText`: 3752
- `ngx.components.UIControlEvent`: 2476
- `ngx.components.UIControlDirective`: 1878
- `ngx.components.UIControlVariable`: 1729
- `ngx.components.UICustomAction`: 1375
- `ngx.components.UIDynamicAction`: 1232
- `ngx.components.UICustomAsyncAction`: 1048
- `ngx.components.UIDynamicInvoke`: 1007
- `ngx.components.UIUseShared`: 918
- `ngx.components.UIElement`: 840
- `ngx.components.UICompVariable`: 778

## Largest YAML Files By AST Object Count

- `_c8oProject/mobilePages/editorPage.yaml`: 6190
- `_c8oProject/mobilePages/adminDashboardUsersWithinGroups.yaml`: 2221
- `_c8oProject/mobileSharedComponents/dataSourceEditor.yaml`: 2187
- `_c8oProject/mobilePages/ManageAccessRights.yaml`: 1989
- `_c8oProject/mobilePages/modalConfigure.yaml`: 1784
- `_c8oProject/mobilePages/selectorPage.yaml`: 1761
- `_c8oProject/mobilePages/adminDashboardHome.yaml`: 1719
- `_c8oProject/mobilePages/dataPage.yaml`: 1279
- `_c8oProject/mobileMenus/MenuSelector.yaml`: 1091
- `_c8oProject/mobilePages/adminDashboardUsers.yaml`: 1074
- `_c8oProject/mobileSharedComponents/adminHelpCenter.yaml`: 947
- `_c8oProject/mobilePages/exportCsvPage.yaml`: 936

## Parse Warnings

- `_c8oProject/mobilePages/ManageAccessRights.yaml`: mapping values are not allowed here
  in "<unicode string>", line 12374, column 61:
     ...   - MobileSmartSourceType: plain:
                                         ^ (fallback: line_indent_fallback)
- `_c8oProject/mobilePages/editorPage.yaml`: while scanning for the next token
found character '\t' that cannot start any token
  in "<unicode string>", line 26790, column 59:
     ...                                 		resolve();
                                         ^ (fallback: line_indent_fallback)
- `_c8oProject/mobilePages/loginPage.yaml`: mapping values are not allowed here
  in "<unicode string>", line 334, column 43:
     ...   - MobileSmartSourceType: plain:
                                         ^ (fallback: line_indent_fallback)
- `_c8oProject/mobilePages/loginPage2_1_1.yaml`: mapping values are not allowed here
  in "<unicode string>", line 107, column 43:
     ...   - MobileSmartSourceType: plain:
                                         ^ (fallback: line_indent_fallback)
- `_c8oProject/mobilePages/loginPage2_1_14.yaml`: mapping values are not allowed here
  in "<unicode string>", line 107, column 43:
     ...   - MobileSmartSourceType: plain:
                                         ^ (fallback: line_indent_fallback)
- `_c8oProject/mobilePages/modalVideo.yaml`: mapping values are not allowed here
  in "<unicode string>", line 157, column 41:
     ...   - MobileSmartSourceType: plain:
                                         ^ (fallback: line_indent_fallback)
- `_c8oProject/mobileSharedActions/sharedTapOnActionSubmit.yaml`: mapping values are not allowed here
  in "<unicode string>", line 85, column 41:
     ...   - MobileSmartSourceType: plain:
                                         ^ (fallback: line_indent_fallback)
- `_c8oProject/mobileSharedComponents/ToggleSwitch.yaml`: mapping values are not allowed here
  in "<unicode string>", line 337, column 45:
     ...   - MobileSmartSourceType: plain:
                                         ^ (fallback: line_indent_fallback)
- `_c8oProject/mobileSharedComponents/itemCondsNavigation.yaml`: mapping values are not allowed here
  in "<unicode string>", line 1692, column 49:
     ...   - MobileSmartSourceType: plain:
                                         ^ (fallback: line_indent_fallback)
- `_c8oProject/mobileSharedComponents/itemGridEditor.yaml`: while scanning for the next token
found character '\t' that cannot start any token
  in "<unicode string>", line 1884, column 137:
     ... ed === 'navigation_tab_selector'	
                                         ^ (fallback: line_indent_fallback)
- `_c8oProject/mobileSharedComponents/itemTextViewer.yaml`: while scanning for the next token
found character '\t' that cannot start any token
  in "<unicode string>", line 381, column 21:
                        		    }
                        ^ (fallback: line_indent_fallback)
- `_c8oProject/sequences/BaserowAccount.yaml`: while scanning a simple key
  in "<unicode string>", line 177, column 11:
              'com.twinsoft.convertigo.engine. ... 
              ^
could not find expected ':'
  in "<unicode string>", line 179, column 13:
              )'
                ^ (fallback: line_indent_fallback)
- `_c8oProject/sequences/data_integrity_accessRights_check_between_edition_published_pwa_doc_anonymous.yaml`: mapping values are not allowed here
  in "<unicode string>", line 132, column 97:
     ... owing edited and published forms:
                                         ^ (fallback: line_indent_fallback)
- `_c8oProject/sequences/data_integrity_collabsResponse_check_between_edition_published.yaml`: mapping values are not allowed here
  in "<unicode string>", line 132, column 97:
     ... owing edited and published forms:
                                         ^ (fallback: line_indent_fallback)
