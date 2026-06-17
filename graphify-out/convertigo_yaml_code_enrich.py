#!/usr/bin/env python3
"""Parse _c8oProject YAML as Convertigo code and enrich graphify-out/graph.json."""

from __future__ import annotations

import json
import re
import shutil
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

try:
    import yaml
except ImportError as exc:  # pragma: no cover - user-facing guard
    raise SystemExit(
        "PyYAML is required. Run: graphify-out/.venv-yaml-code/bin/python "
        "graphify-out/convertigo_yaml_code_enrich.py"
    ) from exc


ROOT = Path.cwd()
PROJECT = ROOT / "_c8oProject"
IONIC = ROOT / "_private" / "ionic" / "src" / "app"

GRAPH_PATH = ROOT / "graphify-out" / "graph.json"
BACKUP_PATH = ROOT / "graphify-out" / "graph.before-convertigo-yaml-code.json"
AST_PATH = ROOT / "graphify-out" / "convertigo-yaml-code-ast.jsonl"
SUMMARY_PATH = ROOT / "graphify-out" / "convertigo-yaml-code-summary.json"
REPORT_PATH = ROOT / "graphify-out" / "CONVERTIGO_YAML_CODE_REPORT.md"

OBJECT_KEY_RE = re.compile(r"^↓(.+?)\s+\[([^\]]+)\]$")
BEAN_ID_RE = re.compile(r"-(\d+)$")
APP_REF_RE = re.compile(r"C8Oforms\.MobileApplication\.Application\.([A-Za-z0-9_]+)")
REQUESTABLE_RE = re.compile(r"(?:plain|script)?:?([A-Za-z0-9_.-]+)")
CALL_JSON_RE = re.compile(r"callJsonObject\([\"']([^\"']+)[\"']")
SCRIPT_SECTION_RE = re.compile(r"/\*Begin_c8o_([A-Za-z0-9_]+)\*/(.*?)/\*End_c8o_\1\*/", re.DOTALL)

VARIABLE_BEANS = {
    "ngx.components.UICompVariable",
    "ngx.components.UIStackVariable",
    "variables.RequestableVariable",
    "variables.StepVariable",
    "variables.TestCaseVariable",
}

SELECTED_PROPS = {
    "beanData",
    "tagName",
    "sharedcomponent",
    "stack",
    "attrName",
    "eventName",
    "identifier",
    "isEnabled",
    "comment",
    "value",
}


def rel(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def norm(value: str) -> str:
    return re.sub(r"[^a-z0-9]", "", value.lower())


def graph_id(prefix: str, value: str) -> str:
    normalized = re.sub(r"[^a-z0-9]+", "_", value.lower()).strip("_")
    return f"{prefix}_{normalized}" if normalized else prefix


def line_for(text: str, pos: int) -> str:
    return f"L{text.count(chr(10), 0, pos) + 1}"


def bean_type(raw: str) -> str:
    return BEAN_ID_RE.sub("", raw)


def bean_object_id(raw: str) -> str | None:
    match = BEAN_ID_RE.search(raw)
    return match.group(1) if match else None


def classify_yaml(path: Path) -> tuple[str, str] | None:
    mapping = {
        "mobileApplication.yaml": ("application", "MobileApplication"),
        "urlMapper.yaml": ("url_mapper", "urlMapper"),
    }
    if path.name in mapping:
        return mapping[path.name]

    parent = path.parent.name
    kind_by_dir = {
        "mobileSharedComponents": "component",
        "mobileSharedActions": "shared_action",
        "mobilePages": "page",
        "mobileMenus": "menu",
        "sequences": "sequence",
        "connectors": "connector",
        "references": "reference",
        "urlMapper": "url_mapping",
    }
    kind = kind_by_dir.get(parent)
    return (kind, path.stem) if kind else None


def canonical_id(kind: str, name: str, source_file: str | None = None) -> str:
    if kind in {"component", "shared_action", "page", "menu", "sequence", "connector"}:
        return graph_id(f"convertigo_yaml_{kind}", name)
    if source_file:
        return graph_id("convertigo_yaml_source", source_file)
    return graph_id(f"convertigo_yaml_{kind}", name)


def ensure_node(nodes: list[dict], node_by_id: dict[str, dict], **node: Any) -> dict:
    existing = node_by_id.get(node["id"])
    if existing:
        for key, value in node.items():
            if key not in existing or existing[key] in (None, ""):
                existing[key] = value
        return existing
    nodes.append(node)
    node_by_id[node["id"]] = node
    return node


def add_edge(edges: list[dict], edge_keys: set[tuple], **edge: Any) -> bool:
    if not edge.get("source") or not edge.get("target") or edge["source"] == edge["target"]:
        return False
    key = (
        edge["source"],
        edge["target"],
        edge.get("relation"),
        edge.get("source_file"),
        edge.get("source_location") or "",
        edge.get("target_detail") or "",
    )
    if key in edge_keys:
        return False
    edge.setdefault("confidence", "EXTRACTED")
    edge.setdefault("confidence_score", 1.0)
    edge.setdefault("weight", 1.0)
    edge.setdefault("_origin", "convertigo_yaml_code")
    edges.append(edge)
    edge_keys.add(key)
    return True


def scalar_value(node: yaml.Node) -> str | None:
    return node.value if isinstance(node, yaml.ScalarNode) else None


def compact_value(value: str, limit: int = 300) -> str:
    value = value.strip()
    return value if len(value) <= limit else value[: limit - 3] + "..."


def immediate_props(value_node: yaml.Node) -> dict[str, str]:
    props: dict[str, str] = {}
    if not isinstance(value_node, yaml.MappingNode):
        return props
    for key_node, child_node in value_node.value:
        key = scalar_value(key_node)
        if not key or key.startswith("↓") or key.startswith("↑"):
            continue
        if key not in SELECTED_PROPS:
            continue
        value = scalar_value(child_node)
        if value is not None:
            props[key] = compact_value(value)
    return props


def line_based_objects(path: Path, text: str, error: Exception | None = None) -> list[dict]:
    """Fallback parser for Convertigo YAML files that are not strict YAML."""
    source = rel(path)
    records: list[dict] = []
    stack: list[tuple[int, dict]] = []
    lines = text.splitlines()

    for index, line in enumerate(lines, start=1):
        match = re.match(r"^(\s*)↓(.+?)\s+\[([^\]]+)\]:\s*$", line)
        if not match:
            continue
        indent, name, raw_bean = match.groups()
        level = len(indent)
        while stack and stack[-1][0] >= level:
            stack.pop()
        btype = bean_type(raw_bean)
        record = {
            "id": graph_id("yaml_ast", f"{source}:{index}:{name}:{raw_bean}"),
            "file": source,
            "line": index,
            "name": name,
            "bean": raw_bean,
            "bean_type": btype,
            "bean_object_id": bean_object_id(raw_bean),
            "parent_id": stack[-1][1]["id"] if stack else None,
            "path": [item["name"] for _, item in stack] + [name],
            "properties": {},
            "parser": "line_indent_fallback",
        }
        if error is not None and not records:
            record["parse_warning"] = compact_value(str(error), 500)
        records.append(record)
        stack.append((level, record))

    return records


def iter_yaml_objects(path: Path, text: str) -> tuple[list[dict], dict | None]:
    try:
        root = yaml.compose(text)
    except yaml.YAMLError as exc:
        return line_based_objects(path, text, exc), {
            "file": rel(path),
            "error": compact_value(str(exc), 500),
            "fallback": "line_indent_fallback",
        }

    records: list[dict] = []

    def visit(node: yaml.Node, stack: list[dict]) -> None:
        if isinstance(node, yaml.MappingNode):
            for key_node, value_node in node.value:
                key = scalar_value(key_node)
                match = OBJECT_KEY_RE.match(key or "")
                if match:
                    name, raw_bean = match.groups()
                    btype = bean_type(raw_bean)
                    source = rel(path)
                    record = {
                        "id": graph_id(
                            "yaml_ast",
                            f"{source}:{key_node.start_mark.line + 1}:{name}:{raw_bean}",
                        ),
                        "file": source,
                        "line": key_node.start_mark.line + 1,
                        "name": name,
                        "bean": raw_bean,
                        "bean_type": btype,
                        "bean_object_id": bean_object_id(raw_bean),
                        "parent_id": stack[-1]["id"] if stack else None,
                        "path": [item["name"] for item in stack] + [name],
                        "properties": immediate_props(value_node),
                    }
                    records.append(record)
                    visit(value_node, stack + [record])
                else:
                    visit(value_node, stack)
        elif isinstance(node, yaml.SequenceNode):
            for child in node.value:
                visit(child, stack)

    if root is not None:
        visit(root, [])
    for record in records:
        record["parser"] = "pyyaml_compose"
    return records, None


def primary_existing_node(nodes: list[dict], source_file: str, expected_name: str) -> dict | None:
    candidates = [
        n
        for n in nodes
        if n.get("source_file") == source_file
        and n.get("_origin") not in {"convertigo_yaml_code"}
    ]
    if not candidates:
        return None
    expected = norm(expected_name)
    for node in candidates:
        if norm(str(node.get("label", ""))) == expected:
            return node
    for node in candidates:
        if expected in norm(str(node.get("label", ""))):
            return node
    return candidates[0]


def script_sections(text: str) -> list[dict]:
    sections = []
    for match in SCRIPT_SECTION_RE.finditer(text):
        body = match.group(2)
        non_empty = [line for line in body.splitlines() if line.strip()]
        if not non_empty:
            continue
        sections.append(
            {
                "section": match.group(1),
                "line": line_for(text, match.start()),
                "lines": len(non_empty),
            }
        )
    return sections


def main() -> None:
    if not GRAPH_PATH.exists():
        raise SystemExit(f"Missing {GRAPH_PATH}")
    if not PROJECT.exists():
        raise SystemExit(f"Missing {PROJECT}")

    if not BACKUP_PATH.exists():
        shutil.copy2(GRAPH_PATH, BACKUP_PATH)

    graph = json.loads(GRAPH_PATH.read_text(encoding="utf-8"))
    nodes: list[dict] = [
        node
        for node in graph.get("nodes", [])
        if node.get("_origin") != "convertigo_yaml_code"
    ]
    edges: list[dict] = [
        edge
        for edge in (graph.get("links") or graph.get("edges") or [])
        if edge.get("_origin") != "convertigo_yaml_code"
    ]
    graph["links"] = edges

    node_by_id = {node["id"]: node for node in nodes}
    edge_keys = {
        (
            edge.get("source"),
            edge.get("target"),
            edge.get("relation"),
            edge.get("source_file"),
            edge.get("source_location") or "",
            edge.get("target_detail") or "",
        )
        for edge in edges
    }

    yaml_files = sorted(PROJECT.rglob("*.yaml"))
    source_nodes: dict[str, dict] = {}
    canonical_by_kind_name: dict[str, dict[str, dict]] = defaultdict(dict)
    ast_records: list[dict] = []
    per_file_records: dict[str, list[dict]] = {}
    per_file_text: dict[str, str] = {}
    parse_warnings: list[dict] = []
    counts = Counter()

    for path in yaml_files:
        classified = classify_yaml(path)
        if not classified:
            continue
        kind, name = classified
        source_file = rel(path)
        text = path.read_text(encoding="utf-8", errors="ignore")
        per_file_text[source_file] = text

        existing = primary_existing_node(nodes, source_file, name)
        community = existing.get("community") if existing else None
        source_node = ensure_node(
            nodes,
            node_by_id,
            id=canonical_id(kind, name, source_file),
            label=f"{name} YAML",
            file_type="convertigo_yaml_code",
            source_file=source_file,
            source_location="L1",
            _origin="convertigo_yaml_code",
            community=community,
            norm_label=norm(name),
            convertigo_kind=kind,
        )
        source_nodes[source_file] = source_node
        canonical_by_kind_name[kind][norm(name)] = source_node

        if existing:
            add_edge(
                edges,
                edge_keys,
                source=source_node["id"],
                target=existing["id"],
                relation="corresponds_to_graphify_node",
                source_file=source_file,
                source_location="L1",
            )
            counts["corresponds_to_graphify_node"] += 1

        records, warning = iter_yaml_objects(path, text)
        per_file_records[source_file] = records
        ast_records.extend(records)
        if warning:
            parse_warnings.append(warning)
        source_node["yaml_object_count"] = len(records)

    def resolve_app_ref(name: str, preferred: tuple[str, ...]) -> dict | None:
        key = norm(name)
        for kind in preferred:
            node = canonical_by_kind_name.get(kind, {}).get(key)
            if node:
                return node
        for kind in ("component", "shared_action", "page", "menu"):
            node = canonical_by_kind_name.get(kind, {}).get(key)
            if node:
                return node
        return None

    def resolve_requestable(raw: str) -> tuple[str, dict] | None:
        raw = raw.strip().strip("\"'")
        match = REQUESTABLE_RE.match(raw)
        requestable = match.group(1) if match else raw
        if requestable.startswith("C8Oforms."):
            name = requestable.split(".", 1)[1]
            for kind in ("sequence", "connector"):
                node = canonical_by_kind_name.get(kind, {}).get(norm(name))
                if node:
                    return kind, node
        return None

    bean_class_nodes: dict[str, dict] = {}
    section_nodes: dict[str, dict] = {}

    for source_file, records in per_file_records.items():
        source_node = source_nodes.get(source_file)
        if not source_node:
            continue

        by_class = Counter(record["bean_type"] for record in records)
        for btype, count in by_class.items():
            class_node = bean_class_nodes.get(btype)
            if not class_node:
                class_node = ensure_node(
                    nodes,
                    node_by_id,
                    id=graph_id("convertigo_bean_type", btype),
                    label=btype,
                    file_type="convertigo_bean_type",
                    source_file=None,
                    source_location=None,
                    _origin="convertigo_yaml_code",
                    community=source_node.get("community"),
                    norm_label=norm(btype),
                )
                bean_class_nodes[btype] = class_node
            if add_edge(
                edges,
                edge_keys,
                source=source_node["id"],
                target=class_node["id"],
                relation="contains_bean_type",
                source_file=source_file,
                source_location=None,
                target_detail=btype,
                count=count,
            ):
                counts["contains_bean_type"] += 1

        for record in records:
            if record["bean_type"] not in VARIABLE_BEANS:
                continue
            variable_node = ensure_node(
                nodes,
                node_by_id,
                id=graph_id(
                    "convertigo_yaml_variable",
                    f"{source_file}:{record['name']}:{record['bean_type']}:{record['line']}",
                ),
                label=f"{record['name']} ({record['bean_type'].split('.')[-1]})",
                file_type="convertigo_yaml_variable",
                source_file=source_file,
                source_location=f"L{record['line']}",
                _origin="convertigo_yaml_code",
                community=source_node.get("community"),
                norm_label=norm(record["name"]),
                variable_name=record["name"],
                variable_bean_type=record["bean_type"],
                yaml_path=record["path"],
            )
            if add_edge(
                edges,
                edge_keys,
                source=source_node["id"],
                target=variable_node["id"],
                relation="declares_variable",
                source_file=source_file,
                source_location=f"L{record['line']}",
                target_detail=record["name"],
            ):
                counts["declares_variable"] += 1

        text = per_file_text[source_file]
        for section in script_sections(text):
            section_node = section_nodes.get(section["section"])
            if not section_node:
                section_node = ensure_node(
                    nodes,
                    node_by_id,
                    id=graph_id("convertigo_script_section", section["section"]),
                    label=f"c8o script section {section['section']}",
                    file_type="convertigo_script_section",
                    source_file=None,
                    source_location=None,
                    _origin="convertigo_yaml_code",
                    community=source_node.get("community"),
                    norm_label=norm(section["section"]),
                )
                section_nodes[section["section"]] = section_node
            if add_edge(
                edges,
                edge_keys,
                source=source_node["id"],
                target=section_node["id"],
                relation="contains_script_section",
                source_file=source_file,
                source_location=section["line"],
                target_detail=section["section"],
                code_lines=section["lines"],
            ):
                counts["contains_script_section"] += 1

        # Deterministic code-like dependency extraction from the YAML text.
        for match in re.finditer(r"sharedcomponent:\s*C8Oforms\.MobileApplication\.Application\.([A-Za-z0-9_]+)", text):
            target = resolve_app_ref(match.group(1), ("component",))
            if target and add_edge(
                edges,
                edge_keys,
                source=source_node["id"],
                target=target["id"],
                relation="yaml_uses_shared_component",
                source_file=source_file,
                source_location=line_for(text, match.start()),
                target_detail=match.group(1),
            ):
                counts["yaml_uses_shared_component"] += 1

        for match in re.finditer(r"stack:\s*C8Oforms\.MobileApplication\.Application\.([A-Za-z0-9_]+)", text):
            target = resolve_app_ref(match.group(1), ("shared_action",))
            if target and add_edge(
                edges,
                edge_keys,
                source=source_node["id"],
                target=target["id"],
                relation="yaml_invokes_shared_action",
                source_file=source_file,
                source_location=line_for(text, match.start()),
                target_detail=match.group(1),
            ):
                counts["yaml_invokes_shared_action"] += 1

        for match in re.finditer(r"[\"']?page[\"']?\s*:\s*[\"'](?:plain|script)?:C8Oforms\.MobileApplication\.Application\.([A-Za-z0-9_]+)", text):
            target = resolve_app_ref(match.group(1), ("page",))
            if target and add_edge(
                edges,
                edge_keys,
                source=source_node["id"],
                target=target["id"],
                relation="yaml_navigates_to_page",
                source_file=source_file,
                source_location=line_for(text, match.start()),
                target_detail=match.group(1),
            ):
                counts["yaml_navigates_to_page"] += 1

        request_patterns = [
            re.compile(r"[\"']requestable[\"']\s*:\s*[\"']([^\"']+)"),
            CALL_JSON_RE,
        ]
        for pattern in request_patterns:
            for match in pattern.finditer(text):
                resolved = resolve_requestable(match.group(1))
                if not resolved:
                    continue
                request_kind, target = resolved
                relation = "yaml_calls_sequence" if request_kind == "sequence" else "yaml_uses_connector"
                if add_edge(
                    edges,
                    edge_keys,
                    source=source_node["id"],
                    target=target["id"],
                    relation=relation,
                    source_file=source_file,
                    source_location=line_for(text, match.start()),
                    target_detail=match.group(1),
                ):
                    counts[relation] += 1

    # Directly connect canonical YAML nodes to generated Angular artifacts when present.
    for source_file, source_node in source_nodes.items():
        kind = source_node.get("convertigo_kind")
        name = Path(source_file).stem
        generated_id = None
        if kind == "component":
            generated_id = graph_id("generated_frontend_component", name)
        elif kind == "page":
            generated_id = graph_id("generated_frontend_page", name)
        if generated_id and generated_id in node_by_id:
            if add_edge(
                edges,
                edge_keys,
                source=source_node["id"],
                target=generated_id,
                relation="yaml_generates_frontend",
                source_file=source_file,
                source_location="L1",
            ):
                counts["yaml_generates_frontend"] += 1

    with AST_PATH.open("w", encoding="utf-8") as handle:
        for record in ast_records:
            handle.write(json.dumps(record, ensure_ascii=False) + "\n")

    class_counts = Counter(record["bean_type"] for record in ast_records)
    file_object_counts = Counter(record["file"] for record in ast_records)
    yaml_code_edges = [
        edge for edge in edges if edge.get("_origin") == "convertigo_yaml_code"
    ]
    yaml_code_nodes = [
        node for node in nodes if node.get("_origin") == "convertigo_yaml_code"
    ]

    summary = {
        "graph": rel(GRAPH_PATH),
        "backup": rel(BACKUP_PATH),
        "ast_index": rel(AST_PATH),
        "yaml_files": len(source_nodes),
        "yaml_objects": len(ast_records),
        "parse_warnings": parse_warnings,
        "nodes": len(nodes),
        "edges": len(edges),
        "yaml_code_nodes_total": len(yaml_code_nodes),
        "yaml_code_edges_total": len(yaml_code_edges),
        "relations_added_this_run": dict(counts),
        "top_bean_types": class_counts.most_common(25),
        "top_yaml_files_by_object_count": file_object_counts.most_common(20),
    }
    SUMMARY_PATH.write_text(json.dumps(summary, indent=2, ensure_ascii=False), encoding="utf-8")

    graph["nodes"] = nodes
    graph["links"] = edges
    graph["convertigo_yaml_code_enrichment"] = {
        "yaml_files": len(source_nodes),
        "yaml_objects": len(ast_records),
        "yaml_code_nodes_total": len(yaml_code_nodes),
        "yaml_code_edges_total": len(yaml_code_edges),
        "relations_added_this_run": dict(counts),
        "ast_index": rel(AST_PATH),
    }
    GRAPH_PATH.write_text(json.dumps(graph, indent=2, ensure_ascii=False), encoding="utf-8")

    relation_lines = "\n".join(
        f"- `{name}`: {count}" for name, count in counts.most_common()
    )
    bean_lines = "\n".join(
        f"- `{name}`: {count}" for name, count in class_counts.most_common(15)
    )
    file_lines = "\n".join(
        f"- `{path}`: {count}" for path, count in file_object_counts.most_common(12)
    )
    REPORT_PATH.write_text(
        "\n".join(
            [
                "# Convertigo YAML Code Analysis",
                "",
                "This pass parses `_c8oProject/**/*.yaml` as structured Convertigo code.",
                "The full object AST is written to JSONL, while the Graphify graph receives",
                "canonical YAML source nodes, bean-type summaries, variable declarations,",
                "script-section summaries, and deterministic dependency edges.",
                "",
                "## Outputs",
                "",
                f"- Graph: `{rel(GRAPH_PATH)}`",
                f"- Backup before YAML-code enrichment: `{rel(BACKUP_PATH)}`",
                f"- Full AST index: `{rel(AST_PATH)}`",
                f"- Machine summary: `{rel(SUMMARY_PATH)}`",
                "",
                "## Counts",
                "",
                f"- YAML files parsed: {len(source_nodes)}",
                f"- YAML AST objects indexed: {len(ast_records)}",
                f"- Graph nodes after enrichment: {len(nodes)}",
                f"- Graph edges after enrichment: {len(edges)}",
                f"- YAML-code graph nodes: {len(yaml_code_nodes)}",
                f"- YAML-code graph edges: {len(yaml_code_edges)}",
                "",
                "## Relations Added",
                "",
                relation_lines or "- None",
                "",
                "## Top Bean Types",
                "",
                bean_lines or "- None",
                "",
                "## Largest YAML Files By AST Object Count",
                "",
                file_lines or "- None",
                "",
                "## Parse Warnings",
                "",
                "- None" if not parse_warnings else "\n".join(f"- `{e['file']}`: {e['error']} (fallback: {e['fallback']})" for e in parse_warnings),
            ]
        )
        + "\n",
        encoding="utf-8",
    )

    print(json.dumps(summary, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
