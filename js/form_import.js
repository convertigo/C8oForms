// Cleanup of a form definition coming from an exported .c8oforms file.
// Shared by the application import (APIV2_updateFormulaireDocument) and the
// import of a file as a version of an existing application (application history).
var c8oFormImport = (function () {
	var getRefId = function (ref) {
		if (ref != null && typeof ref == "object") {
			return ref.id;
		}
		return ref;
	};
	var collectIds = function (elements, ids) {
		if (!(elements instanceof Array)) {
			return;
		}
		for (var i = 0; i < elements.length; i++) {
			var current = elements[i];
			if (current == null) {
				continue;
			}
			if (current.id != null) {
				ids["" + current.id] = true;
			}
			if (current.children instanceof Array) {
				collectIds(current.children, ids);
			}
		}
	};
	var collectInvalidPageIds = function (elements, validPages, idsToRemove) {
		if (!(elements instanceof Array)) {
			return;
		}
		for (var i = 0; i < elements.length; i++) {
			var current = elements[i];
			if (current == null) {
				continue;
			}
			var hasPage = current.config != null && Object.prototype.hasOwnProperty.call(current.config, "page");
			var invalidPage = hasPage && current.config.page != null && !validPages["" + current.config.page];
			if (invalidPage && current.id != null) {
				idsToRemove["" + current.id] = true;
			}
			if (current.children instanceof Array) {
				collectInvalidPageIds(current.children, validPages, idsToRemove);
			}
		}
	};
	var collectDescendantIds = function (elements, idsToRemove) {
		if (!(elements instanceof Array)) {
			return;
		}
		var refKeys = ["childrenRefs", "childrenRefsElse"];
		var changed = true;
		while (changed) {
			changed = false;
			for (var i = 0; i < elements.length; i++) {
				var current = elements[i];
				if (current == null || current.id == null) {
					continue;
				}
				var currentId = "" + current.id;
				if (idsToRemove[currentId]) {
					for (var r = 0; r < refKeys.length; r++) {
						var refs = current[refKeys[r]];
						if (refs instanceof Array) {
							for (var j = 0; j < refs.length; j++) {
								var refId = getRefId(refs[j]);
								if (refId != null && !idsToRemove["" + refId]) {
									idsToRemove["" + refId] = true;
									changed = true;
								}
							}
						}
					}
					if (current.children instanceof Array) {
						collectIds(current.children, idsToRemove);
					}
				}
				else if (current.parentRef != null && idsToRemove["" + current.parentRef]) {
					idsToRemove[currentId] = true;
					changed = true;
				}
			}
		}
	};
	var filterRemovedElements = function (elements, idsToRemove) {
		var cleaned = [];
		if (!(elements instanceof Array)) {
			return cleaned;
		}
		for (var i = 0; i < elements.length; i++) {
			var current = elements[i];
			if (current == null) {
				continue;
			}
			if (current.id != null && idsToRemove["" + current.id]) {
				continue;
			}
			if (current.children instanceof Array) {
				current.children = filterRemovedElements(current.children, idsToRemove);
			}
			cleaned.push(current);
		}
		return cleaned;
	};
	var cleanupRefs = function (elements, remainingIds) {
		if (!(elements instanceof Array)) {
			return;
		}
		var refKeys = ["childrenRefs", "childrenRefsElse"];
		for (var i = 0; i < elements.length; i++) {
			var current = elements[i];
			if (current == null) {
				continue;
			}
			for (var r = 0; r < refKeys.length; r++) {
				var refs = current[refKeys[r]];
				if (refs instanceof Array) {
					current[refKeys[r]] = refs.filter(function (ref) {
						var refId = getRefId(ref);
						return refId == null || remainingIds["" + refId] === true;
					});
				}
			}
			if (current.children instanceof Array) {
				cleanupRefs(current.children, remainingIds);
			}
		}
	};
	return {
		// Drops the components placed on pages the file does not define, with their descendants and dangling references.
		sanitizeStructure: function (importedMeta) {
			if (importedMeta == null || !(importedMeta.pages instanceof Array) || !(importedMeta.formulaire instanceof Array)) {
				return;
			}
			var validPages = {};
			var hasValidPage = false;
			for (var p = 0; p < importedMeta.pages.length; p++) {
				var pageDef = importedMeta.pages[p];
				if (pageDef != null && pageDef.pageTechName != null && pageDef.pageTechName !== "") {
					validPages["" + pageDef.pageTechName] = true;
					hasValidPage = true;
				}
			}
			if (!hasValidPage) {
				return;
			}
			var idsToRemove = {};
			collectInvalidPageIds(importedMeta.formulaire, validPages, idsToRemove);
			collectDescendantIds(importedMeta.formulaire, idsToRemove);
			importedMeta.formulaire = filterRemovedElements(importedMeta.formulaire, idsToRemove);
			var remainingIds = {};
			collectIds(importedMeta.formulaire, remainingIds);
			for (var i = 0; i < importedMeta.formulaire.length; i++) {
				var item = importedMeta.formulaire[i];
				if (item != null && item.parentRef != null && !remainingIds["" + item.parentRef] && item.id != null) {
					idsToRemove["" + item.id] = true;
				}
			}
			collectDescendantIds(importedMeta.formulaire, idsToRemove);
			importedMeta.formulaire = filterRemovedElements(importedMeta.formulaire, idsToRemove);
			remainingIds = {};
			collectIds(importedMeta.formulaire, remainingIds);
			cleanupRefs(importedMeta.formulaire, remainingIds);
		},
		// Points every source or action configured on sourceId (the exported application) at targetId.
		// References to other applications are left untouched.
		retargetSelfReferences: function (value, sourceId, targetId) {
			if (sourceId == null || sourceId === "" || ("" + sourceId) === ("" + targetId)) {
				return;
			}
			var visit = function (current) {
				if (current == null || typeof current != "object") {
					return;
				}
				if (current instanceof Array) {
					for (var i = 0; i < current.length; i++) {
						visit(current[i]);
					}
					return;
				}
				var formsConfig = current.vars != null ? current.vars.forms_config : null;
				if (formsConfig != null && typeof formsConfig.str == "string") {
					try {
						var config = JSON.parse(formsConfig.str);
						if (config != null && ("" + config.form_id) === ("" + sourceId)) {
							config.form_id = "" + targetId;
							formsConfig.str = JSON.stringify(config);
						}
					}
					catch (e) {
						log.warn("form import: unreadable forms_config ignored: " + e);
					}
				}
				for (var key in current) {
					visit(current[key]);
				}
			};
			visit(value);
		}
	};
})();
