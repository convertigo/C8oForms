#!/usr/bin/env python3
"""Add deterministic Convertigo front-end edges to graphify-out/graph.json."""

from __future__ import annotations

import json
import re
import shutil
from collections import Counter, defaultdict
from pathlib import Path


ROOT = Path.cwd()
GRAPH_PATH = ROOT / "graphify-out" / "graph.json"
BACKUP_PATH = ROOT / "graphify-out" / "graph.before-convertigo-frontend.json"
REPORT_PATH = ROOT / "graphify-out" / "convertigo-frontend-enrichment.json"

PROJECT = ROOT / "_c8oProject"
IONIC = ROOT / "_private" / "ionic" / "src" / "app"


def rel(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def norm(value: str) -> str:
    return re.sub(r"[^a-z0-9]", "", value.lower())


def line_for(text: str, pos: int) -> str:
    return f"L{text.count(chr(10), 0, pos) + 1}"


def node_id(prefix: str, value: str) -> str:
    return f"{prefix}_{norm(value)}"


def classify_yaml(path: Path) -> tuple[str, str] | None:
    try:
        parent = path.parent.name
        name = path.stem
    except Exception:
        return None
    mapping = {
        "mobileSharedComponents": "component",
        "mobileSharedActions": "shared_action",
        "mobilePages": "page",
        "mobileMenus": "menu",
        "sequences": "sequence",
        "connectors": "connector",
    }
    kind = mapping.get(parent)
    if kind:
        return kind, name
    return None


def ensure_node(nodes, node_by_id, *, id_, label, source_file, community, file_type, **extra):
    existing = node_by_id.get(id_)
    if existing:
        return existing
    node = {
        "id": id_,
        "label": label,
        "file_type": file_type,
        "source_file": source_file,
        "source_location": None,
        "_origin": "convertigo_frontend",
        "community": community,
        "norm_label": norm(label),
    }
    node.update(extra)
    nodes.append(node)
    node_by_id[id_] = node
    return node


def add_edge(edges, edge_keys, *, source, target, relation, source_file, source_location=None, **extra):
    if not source or not target or source == target:
        return False
    key = (source, target, relation, source_file, source_location or "")
    if key in edge_keys:
        return False
    edge = {
        "source": source,
        "target": target,
        "relation": relation,
        "confidence": "EXTRACTED",
        "confidence_score": 1.0,
        "weight": 1.0,
        "source_file": source_file,
        "source_location": source_location,
        "_origin": "convertigo_frontend",
    }
    edge.update(extra)
    edges.append(edge)
    edge_keys.add(key)
    return True


def main() -> None:
    if not GRAPH_PATH.exists():
        raise SystemExit(f"missing {GRAPH_PATH}")
    if not IONIC.exists():
        raise SystemExit(f"missing {IONIC}")

    if not BACKUP_PATH.exists():
        shutil.copy2(GRAPH_PATH, BACKUP_PATH)

    graph = json.loads(GRAPH_PATH.read_text(encoding="utf-8"))
    nodes = graph.get("nodes", [])
    edges = graph.get("links") or graph.get("edges") or []
    graph["links"] = edges

    node_by_id = {n["id"]: n for n in nodes}
    edge_keys = {
        (
            e.get("source"),
            e.get("target"),
            e.get("relation"),
            e.get("source_file"),
            e.get("source_location") or "",
        )
        for e in edges
    }

    # Existing graphify nodes by their YAML source file and Convertigo concept name.
    yaml_node_by_source: dict[str, dict] = {}
    concept_nodes: dict[str, dict[str, list[dict]]] = defaultdict(lambda: defaultdict(list))
    for node in nodes:
        source_file = node.get("source_file")
        if not source_file:
            continue
        path = ROOT / source_file
        if path.suffix != ".yaml":
            continue
        classified = classify_yaml(path)
        if not classified:
            continue
        kind, name = classified
        yaml_node_by_source.setdefault(source_file, node)
        concept_nodes[kind][norm(name)].append(node)

    def first_concept(kind: str, name: str) -> dict | None:
        candidates = concept_nodes.get(kind, {}).get(norm(name), [])
        return candidates[0] if candidates else None

    def yaml_node_for(path: Path, kind: str, name: str) -> dict:
        source_file = rel(path)
        existing = yaml_node_by_source.get(source_file)
        if existing:
            return existing
        community = None
        id_ = node_id(f"convertigo_{kind}", name)
        node = ensure_node(
            nodes,
            node_by_id,
            id_=id_,
            label=name,
            source_file=source_file,
            community=community,
            file_type="convertigo_yaml",
            convertigo_kind=kind,
        )
        yaml_node_by_source[source_file] = node
        concept_nodes[kind][norm(name)].append(node)
        return node

    def resolve_application_ref(name: str, preferred: tuple[str, ...]) -> tuple[str, dict] | None:
        for kind in preferred:
            node = first_concept(kind, name)
            if node:
                return kind, node
        for kind in ("component", "shared_action", "page", "menu"):
            node = first_concept(kind, name)
            if node:
                return kind, node
        return None

    def resolve_requestable(value: str) -> tuple[str, dict] | None:
        value = value.strip()
        value = re.sub(r"^(plain|script):", "", value)
        if value.startswith("C8Oforms."):
            name = value.split(".", 1)[1]
            for kind in ("sequence", "connector"):
                node = first_concept(kind, name)
                if node:
                    return kind, node
        return None

    counts = Counter()
    unmatched = Counter()

    yaml_dirs = [
        PROJECT / "mobileSharedComponents",
        PROJECT / "mobileSharedActions",
        PROJECT / "mobilePages",
        PROJECT / "mobileMenus",
    ]
    for directory in yaml_dirs:
        if not directory.exists():
            continue
        for path in sorted(directory.glob("*.yaml")):
            classified = classify_yaml(path)
            if not classified:
                continue
            kind, name = classified
            src_node = yaml_node_for(path, kind, name)
            text = path.read_text(encoding="utf-8", errors="ignore")
            source_file = rel(path)

            patterns = [
                (
                    "uses_shared_component",
                    re.compile(r"sharedcomponent:\s*C8Oforms\.MobileApplication\.Application\.([A-Za-z0-9_]+)"),
                    ("component",),
                ),
                (
                    "invokes_shared_action",
                    re.compile(r"stack:\s*C8Oforms\.MobileApplication\.Application\.([A-Za-z0-9_]+)"),
                    ("shared_action",),
                ),
                (
                    "navigates_to_page",
                    re.compile(r"[\"']?page[\"']?\s*:\s*[\"'](?:plain|script)?:C8Oforms\.MobileApplication\.Application\.([A-Za-z0-9_]+)"),
                    ("page",),
                ),
            ]
            for relation, pattern, preferred in patterns:
                for match in pattern.finditer(text):
                    ref = match.group(1)
                    resolved = resolve_application_ref(ref, preferred)
                    if not resolved:
                        unmatched[relation] += 1
                        continue
                    _, target = resolved
                    if add_edge(
                        edges,
                        edge_keys,
                        source=src_node["id"],
                        target=target["id"],
                        relation=relation,
                        source_file=source_file,
                        source_location=line_for(text, match.start()),
                        referenced_name=ref,
                    ):
                        counts[relation] += 1

            request_patterns = [
                re.compile(r"[\"']requestable[\"']\s*:\s*[\"']([^\"']+)"),
                re.compile(r"callJsonObject\([\"']([^\"']+)[\"']"),
            ]
            for pattern in request_patterns:
                for match in pattern.finditer(text):
                    resolved = resolve_requestable(match.group(1))
                    if not resolved:
                        unmatched["calls_requestable"] += 1
                        continue
                    request_kind, target = resolved
                    relation = "calls_sequence" if request_kind == "sequence" else "uses_connector"
                    if add_edge(
                        edges,
                        edge_keys,
                        source=src_node["id"],
                        target=target["id"],
                        relation=relation,
                        source_file=source_file,
                        source_location=line_for(text, match.start()),
                        requestable=match.group(1),
                    ):
                        counts[relation] += 1

    def generated_artifact(kind: str, generated_name: str, files: list[Path], source_node: dict | None) -> dict:
        community = source_node.get("community") if source_node else None
        source_file = rel(files[0]) if files else None
        return ensure_node(
            nodes,
            node_by_id,
            id_=node_id(f"generated_frontend_{kind}", generated_name),
            label=f"{generated_name} generated {kind}",
            source_file=source_file,
            community=community,
            file_type="generated_frontend",
            generated_kind=kind,
            generated_files=[rel(f) for f in files],
        )

    component_artifacts: dict[str, dict] = {}
    components_dir = IONIC / "components"
    if components_dir.exists():
        for directory in sorted(p for p in components_dir.iterdir() if p.is_dir()):
            generated_name = directory.name.split(".", 1)[1] if directory.name.startswith("c8oforms.") else directory.name
            key = norm(generated_name)
            files = sorted(
                p
                for p in directory.iterdir()
                if p.suffix.lower() in {".ts", ".html", ".scss", ".css"}
            )
            if not files:
                continue
            source_node = first_concept("component", generated_name)
            artifact = generated_artifact("component", generated_name, files, source_node)
            component_artifacts[key] = artifact
            if source_node and add_edge(
                edges,
                edge_keys,
                source=source_node["id"],
                target=artifact["id"],
                relation="generates_frontend",
                source_file=source_node.get("source_file"),
                generated_files=[rel(f) for f in files],
            ):
                counts["generates_frontend"] += 1
            elif not source_node:
                unmatched["generated_component_source"] += 1

    page_artifacts: dict[str, dict] = {}
    pages_dir = IONIC / "pages"
    if pages_dir.exists():
        for directory in sorted(p for p in pages_dir.iterdir() if p.is_dir()):
            generated_name = directory.name
            key = norm(generated_name)
            files = sorted(
                p
                for p in directory.iterdir()
                if p.suffix.lower() in {".ts", ".html", ".scss", ".css"}
            )
            if not files:
                continue
            source_node = first_concept("page", generated_name)
            artifact = generated_artifact("page", generated_name, files, source_node)
            page_artifacts[key] = artifact
            if source_node and add_edge(
                edges,
                edge_keys,
                source=source_node["id"],
                target=artifact["id"],
                relation="generates_frontend",
                source_file=source_node.get("source_file"),
                generated_files=[rel(f) for f in files],
            ):
                counts["generates_frontend"] += 1
            elif not source_node:
                unmatched["generated_page_source"] += 1

    import_re = re.compile(r"import\s+\{\s*C8Oforms_([A-Za-z0-9_]+)\s*\}\s+from\s+['\"][^'\"]*/components/c8oforms\.([^/'\"]+)")
    tag_re = re.compile(r"<\s*c8oforms-([a-z0-9_-]+)\b", re.IGNORECASE)
    route_re = re.compile(r"\{\s*path:\s*['\"]([^'\"]*)['\"].*?import\(['\"]\.\/pages\/([^/'\"]+)\/", re.DOTALL)

    def parse_generated_refs(artifact: dict, files: list[Path]) -> None:
        for path in files:
            if path.suffix.lower() not in {".ts", ".html"}:
                continue
            text = path.read_text(encoding="utf-8", errors="ignore")
            source_file = rel(path)
            for match in import_re.finditer(text):
                target = first_concept("component", match.group(2))
                if target and add_edge(
                    edges,
                    edge_keys,
                    source=artifact["id"],
                    target=target["id"],
                    relation="imports_component",
                    source_file=source_file,
                    source_location=line_for(text, match.start()),
                    referenced_name=match.group(1),
                ):
                    counts["imports_component"] += 1
            for match in tag_re.finditer(text):
                target = first_concept("component", match.group(1))
                if target and add_edge(
                    edges,
                    edge_keys,
                    source=artifact["id"],
                    target=target["id"],
                    relation="renders_component",
                    source_file=source_file,
                    source_location=line_for(text, match.start()),
                    html_tag=f"c8oforms-{match.group(1)}",
                ):
                    counts["renders_component"] += 1

    for directory in sorted(p for p in components_dir.iterdir() if p.is_dir()) if components_dir.exists() else []:
        generated_name = directory.name.split(".", 1)[1] if directory.name.startswith("c8oforms.") else directory.name
        artifact = component_artifacts.get(norm(generated_name))
        if artifact:
            parse_generated_refs(artifact, sorted(p for p in directory.iterdir() if p.suffix.lower() in {".ts", ".html"}))

    for directory in sorted(p for p in pages_dir.iterdir() if p.is_dir()) if pages_dir.exists() else []:
        artifact = page_artifacts.get(norm(directory.name))
        if artifact:
            parse_generated_refs(artifact, sorted(p for p in directory.iterdir() if p.suffix.lower() in {".ts", ".html"}))

    routes_path = IONIC / "app.routes.ts"
    if routes_path.exists():
        text = routes_path.read_text(encoding="utf-8", errors="ignore")
        routes_node = ensure_node(
            nodes,
            node_by_id,
            id_="generated_frontend_app_routes",
            label="Angular generated app routes",
            source_file=rel(routes_path),
            community=None,
            file_type="generated_frontend",
            generated_kind="routes",
        )
        for match in route_re.finditer(text):
            route_path, page_dir = match.groups()
            target = first_concept("page", page_dir)
            if target and add_edge(
                edges,
                edge_keys,
                source=routes_node["id"],
                target=target["id"],
                relation="routes_to_page",
                source_file=rel(routes_path),
                source_location=line_for(text, match.start()),
                route_path=route_path,
            ):
                counts["routes_to_page"] += 1

    frontend_relation_totals = Counter(
        edge.get("relation")
        for edge in edges
        if edge.get("_origin") == "convertigo_frontend"
    )
    frontend_node_total = sum(
        1 for node in nodes if node.get("_origin") == "convertigo_frontend"
    )

    graph["nodes"] = nodes
    graph["links"] = edges
    graph["convertigo_frontend_enrichment"] = {
        "frontend_nodes_total": frontend_node_total,
        "frontend_edges_total": sum(frontend_relation_totals.values()),
        "relations_added_this_run": dict(counts),
        "relations_current": dict(frontend_relation_totals),
    }
    GRAPH_PATH.write_text(json.dumps(graph, indent=2, ensure_ascii=False), encoding="utf-8")

    report = {
        "graph": rel(GRAPH_PATH),
        "backup": rel(BACKUP_PATH),
        "nodes": len(nodes),
        "edges": len(edges),
        "relations_added_this_run": dict(counts),
        "frontend_nodes_total": frontend_node_total,
        "frontend_edges_total": sum(frontend_relation_totals.values()),
        "relations_current": dict(frontend_relation_totals),
        "unmatched": dict(unmatched),
        "generated_components_seen": len(component_artifacts),
        "generated_pages_seen": len(page_artifacts),
    }
    REPORT_PATH.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    print(json.dumps(report, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
