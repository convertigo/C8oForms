"""
Python wrapper around the Convertigo `YamlConverter` Java helper.

The goal is to make the YAML/XML conversion utilities of Convertigo usable from
standalone Python projects.  The wrapper bootstraps a JVM (via JPype) that loads
the Convertigo engine JAR and exposes a small, pythonic façade mirroring the
main entry points of `YamlConverter`:

* `read_yaml` / `read_yaml_document`
* `write_yaml`
* `to_yaml`

Typical usage
-------------

```python
from convertigo import ConvertigoYamlConverter

converter = ConvertigoYamlConverter().start()

xml_as_text = converter.read_yaml("c8oProject.yaml")
converter.write_yaml(xml_as_text, "out/c8oProject.yaml", subdir="out/_c8oProject")
```

Requirements
------------

* JPype (install with `pip install jpype1`)
* A Convertigo engine JAR (defaults to the latest JAR under
  `engine/build/libs/convertigo-engine-*.jar` in this repository)
"""

from __future__ import annotations

import os
import threading
from pathlib import Path
from typing import Iterable, Optional, Sequence, Union

PathLike = Union[str, os.PathLike[str]]

_MODULE_ROOT: Path
try:
    _MODULE_ROOT = Path(__file__).resolve().parents[2]
except IndexError:
    _MODULE_ROOT = Path(__file__).resolve().parent

_JVM_LOCK = threading.Lock()


def _latest_matching(directory: Path, pattern: str) -> Optional[Path]:
    if not directory.exists():
        return None
    matches = sorted(directory.glob(pattern))
    return matches[-1] if matches else None


def _resolve_path(candidate: Optional[PathLike]) -> Optional[Path]:
    if candidate is None:
        return None
    return Path(candidate).expanduser().resolve()


class ConvertigoYamlConverter:
    """
    Lightweight façade over `com.twinsoft.convertigo.engine.util.YamlConverter`.

    Parameters
    ----------
    engine_jar:
        Path to `convertigo-engine-*.jar`. Defaults to the latest JAR shipped
        with this repository or pointed to by `CONVERTIGO_ENGINE_JAR`.
    dependencies_jar:
        Optional `dependencies-*.jar` companion. Defaults to the latest JAR or
        the value of `CONVERTIGO_DEPENDENCIES_JAR`.
    extra_jars:
        Additional classpath entries (strings or `Path` instances).
    jvm_path:
        Optional path to the JVM shared library; JPype will auto-detect when
        omitted.
    jvm_args:
        Extra JVM arguments. `-Dfile.encoding=UTF-8` is appended automatically
        when not already provided.
    auto_start:
        Start the JVM immediately. Call `start()` manually when set to `False`.
    """

    def __init__(
        self,
        *,
        engine_jar: Optional[PathLike] = None,
        dependencies_jar: Optional[PathLike] = None,
        extra_jars: Optional[Sequence[PathLike]] = None,
        jvm_path: Optional[PathLike] = None,
        jvm_args: Optional[Sequence[str]] = None,
        auto_start: bool = True,
    ) -> None:
        self._jpype = self._load_jpype()
        self._engine_jar = self._auto_engine_jar(engine_jar)
        self._dependencies_jar = self._auto_dependencies_jar(dependencies_jar)
        self._extra_jars = tuple(
            _resolve_path(candidate) for candidate in (extra_jars or [])
        )
        self._jvm_path = _resolve_path(jvm_path)
        self._jvm_args = tuple(jvm_args or ())
        self._classpath = self._build_classpath()
        self._prepared = False

        if auto_start:
            self.start()

    # --------------------------------------------------------------------- #
    # Public API
    # --------------------------------------------------------------------- #

    def start(self) -> "ConvertigoYamlConverter":
        """Start the JVM (if needed) and resolve Java class handles."""
        self._ensure_jvm()
        self._prepare_classes()
        return self

    def shutdown(self) -> None:
        """Shutdown the JVM. Subsequent calls to `start()` are not allowed."""
        if self._jpype.isJVMStarted():
            self._jpype.shutdownJVM()
        self._prepared = False

    def read_yaml_document(
        self, yaml_path: PathLike, *, only_root: bool = False
    ):
        """
        Read a Convertigo YAML file and return the underlying DOM `Document`.
        """
        self._ensure_ready()
        yaml_file = self._JFile(str(Path(yaml_path)))
        return self._YamlConverter.readYaml(yaml_file, bool(only_root))

    def read_yaml(self, yaml_path: PathLike, *, only_root: bool = False) -> str:
        """
        Read a Convertigo YAML file and return the XML representation as text.
        """
        document = self.read_yaml_document(yaml_path, only_root=only_root)
        return self._document_to_string(document)

    def write_yaml(
        self,
        xml_source: Union[PathLike, str],
        yaml_path: PathLike,
        *,
        subdir: Optional[PathLike] = None,
    ) -> None:
        """
        Convert an XML project representation into Convertigo YAML files.

        Parameters
        ----------
        xml_source:
            XML content as a file path or string. The document must contain the
            `<convertigo>` root element expected by `YamlConverter`.
        yaml_path:
            Destination `c8oProject.yaml` path.
        subdir:
            Optional `_c8oProject` directory where supplementary files are
            written.
        """
        self._ensure_ready()
        document = self._ensure_document(xml_source)
        yaml_file = Path(yaml_path)
        yaml_file.parent.mkdir(parents=True, exist_ok=True)

        if subdir is None:
            self._YamlConverter.writeYaml(document, self._JFile(str(yaml_file)))
        else:
            subdir_path = Path(subdir)
            subdir_path.mkdir(parents=True, exist_ok=True)
            self._YamlConverter.writeYaml(
                document,
                self._JFile(str(yaml_file)),
                self._JFile(str(subdir_path)),
            )

    def to_yaml(
        self,
        xml_source: Union[PathLike, str],
        *,
        existing_files: Optional[Iterable[PathLike]] = None,
    ) -> str:
        """
        Convert a single XML bean into the YAML notation returned by
        `YamlConverter.toYaml`.
        """
        self._ensure_ready()
        document = self._ensure_document(xml_source)
        element = document.getDocumentElement()
        if element is None:
            raise ValueError("XML source does not contain a document element.")

        if existing_files is None:
            return self._YamlConverter.toYaml(element)

        java_set = self._build_java_file_set(existing_files)
        return self._YamlConverter.toYaml(element, java_set)

    # --------------------------------------------------------------------- #
    # Internal helpers
    # --------------------------------------------------------------------- #

    @staticmethod
    def _load_jpype():
        try:
            import jpype  # type: ignore
            import jpype.imports  # noqa: F401
        except ImportError as exc:  # pragma: no cover - import guard
            raise RuntimeError(
                "JPype is required. Install it with 'pip install jpype1'."
            ) from exc
        return jpype

    def _auto_engine_jar(self, override: Optional[PathLike]) -> Path:
        candidate = _resolve_path(override) or _resolve_path(
            os.environ.get("CONVERTIGO_ENGINE_JAR")
        )
        if candidate is None:
            candidate = _latest_matching(
                _MODULE_ROOT / "engine" / "build" / "libs",
                "convertigo-engine-*.jar",
            )
        if candidate is None:
            raise FileNotFoundError(
                "Unable to locate convertigo-engine JAR. Provide 'engine_jar' or "
                "export CONVERTIGO_ENGINE_JAR."
            )
        if not candidate.exists():
            raise FileNotFoundError(f"convertigo-engine JAR not found: {candidate}")
        return candidate

    def _auto_dependencies_jar(self, override: Optional[PathLike]) -> Optional[Path]:
        candidate = _resolve_path(override) or _resolve_path(
            os.environ.get("CONVERTIGO_DEPENDENCIES_JAR")
        )
        if candidate is None:
            candidate = _latest_matching(
                _MODULE_ROOT / "engine" / "build" / "libs",
                "dependencies-*.jar",
            )
        if candidate is None:
            return None
        if not candidate.exists():
            raise FileNotFoundError(f"dependencies JAR not found: {candidate}")
        return candidate

    def _build_classpath(self) -> Sequence[str]:
        entries = [str(self._engine_jar)]
        if self._dependencies_jar is not None:
            entries.append(str(self._dependencies_jar))
        for jar in self._extra_jars:
            if jar is not None:
                entries.append(str(jar))
        # Preserve order while removing duplicates.
        unique_entries = list(dict.fromkeys(entries))
        return tuple(unique_entries)

    def _ensure_jvm(self) -> None:
        if self._jpype.isJVMStarted():
            return
        with _JVM_LOCK:
            if self._jpype.isJVMStarted():
                return
            args = list(self._jvm_args)
            if not any(arg.startswith("-Dfile.encoding=") for arg in args):
                args.append("-Dfile.encoding=UTF-8")
            start_kwargs = {"classpath": os.pathsep.join(self._classpath)}
            if self._jvm_path is None:
                self._jpype.startJVM(*args, **start_kwargs)
            else:
                self._jpype.startJVM(str(self._jvm_path), *args, **start_kwargs)

    def _prepare_classes(self) -> None:
        if self._prepared:
            return
        self._YamlConverter = self._jpype.JClass(
            "com.twinsoft.convertigo.engine.util.YamlConverter"
        )
        self._DocumentBuilderFactory = self._jpype.JClass(
            "javax.xml.parsers.DocumentBuilderFactory"
        )
        self._TransformerFactory = self._jpype.JClass(
            "javax.xml.transform.TransformerFactory"
        )
        self._DOMSource = self._jpype.JClass("javax.xml.transform.dom.DOMSource")
        self._StreamResult = self._jpype.JClass(
            "javax.xml.transform.stream.StreamResult"
        )
        self._StringWriter = self._jpype.JClass("java.io.StringWriter")
        self._ByteArrayInputStream = self._jpype.JClass("java.io.ByteArrayInputStream")
        self._JFile = self._jpype.JClass("java.io.File")
        self._HashSet = self._jpype.JClass("java.util.HashSet")
        self._OutputKeys = self._jpype.JClass("javax.xml.transform.OutputKeys")
        self._prepared = True

    def _ensure_ready(self) -> None:
        if not self._prepared or not self._jpype.isJVMStarted():
            self.start()

    def _new_document_builder(self):
        builder_factory = self._DocumentBuilderFactory.newInstance()
        builder_factory.setNamespaceAware(True)
        try:
            # Harden against XXE attacks; ignore failures on older JVMs.
            builder_factory.setFeature(
                "http://apache.org/xml/features/disallow-doctype-decl", True
            )
        except Exception:  # pragma: no cover - optional hardening
            pass
        return builder_factory.newDocumentBuilder()

    def _ensure_document(self, source: Union[PathLike, str]):
        # Accept Java Document objects directly.
        if hasattr(source, "getDocumentElement") and callable(
            getattr(source, "getDocumentElement")
        ):
            return source

        builder = self._new_document_builder()
        if isinstance(source, (str, os.PathLike)):
            candidate = Path(source)
            if candidate.exists():
                return builder.parse(self._JFile(str(candidate)))
            xml_text = str(source)
            stream = self._ByteArrayInputStream(xml_text.encode("utf-8"))
            try:
                return builder.parse(stream)
            finally:
                stream.close()

        raise TypeError(
            "Unsupported XML source type. Provide a path, XML string, or DOM Document."
        )

    def _document_to_string(self, document) -> str:
        transformer = self._TransformerFactory.newInstance().newTransformer()
        transformer.setOutputProperty(self._OutputKeys.INDENT, "yes")
        transformer.setOutputProperty(self._OutputKeys.OMIT_XML_DECLARATION, "no")
        writer = self._StringWriter()
        result = self._StreamResult(writer)
        transformer.transform(self._DOMSource(document), result)
        return writer.toString()

    def _build_java_file_set(self, paths: Iterable[PathLike]):
        java_set = self._HashSet()
        for candidate in paths:
            if candidate is None:
                continue
            java_set.add(self._JFile(str(Path(candidate))))
        return java_set


__all__ = ["ConvertigoYamlConverter"]
