// Application version history (#1359). Requires js/common.js, and js/form_import.js for importFile.
//
// A version is a snapshot of the restorable part of a draft application, kept in the
// c8oforms_history_fs database as three kinds of documents:
// - entry:   one per version (origin, date, author, label), pointing to a content by hash;
// - content: the restorable fields, shared by every entry with the same hash;
// - blob:    one attachment body, shared by every content with the same digest.
// Restoring rewrites the draft document itself, so the application keeps its id, URL,
// access rights and publication.
var c8oHistory = (function () {
	var DB = "c8oforms_history_fs";
	var FORMS_DB = "c8oforms_fs";
	var DDOC = "history";
	// Owned by no user: FullSync replication never hands these documents to a client.
	// A document a client pushes gets its user as ~c8oAcl, which the design document
	// validation refuses: only the history sequences write this database.
	var ACL = "_C8O_HISTORY_";
	var FIELDS = [
		"name", "descform", "descformPosition", "namePosition", "formulaire", "pages", "flows", "actions",
		"config", "navigation", "globalNavigationEnabled", "wallpaper", "thumbnail", "loopToForm",
		"progressIndicator", "respNameRequired", "technicalVersion"
	];
	// Most recent entries kept around restores. Automatic versions thin out with age (AUTO_TIERS); the other
	// origins (manual, publish, import) are kept until the application is deleted.
	var RETENTION = { pre_restore: 10, restore: 20 };
	var HOUR = 60 * 60 * 1000;
	// Every automatic version of the last hour, then the newest of each hour for a day, the newest of each day
	// for a week, none older.
	var AUTO_TIERS = [
		{ upTo: HOUR, bucket: 0 },
		{ upTo: 24 * HOUR, bucket: HOUR },
		{ upTo: 7 * 24 * HOUR, bucket: 24 * HOUR }
	];
	// At most one automatic version per minute of edition.
	var CHECKPOINT_DELAY = 60 * 1000;
	// A content or blob just stored may not be referenced by its entry yet: only older ones are collected.
	var GARBAGE_GRACE = 60 * 60 * 1000;
	var MAX_LABEL_LENGTH = 120;
	var MAX_PAGE_SIZE = 50;

	var clone = function (value) {
		return value == null ? value : JSON.parse(JSON.stringify(value));
	};

	var stableStringify = function (value) {
		if (value === null || typeof value != "object") {
			return JSON.stringify(value === undefined ? null : value);
		}
		if (value instanceof Array) {
			var items = [];
			for (var i = 0; i < value.length; i++) {
				items.push(stableStringify(value[i]));
			}
			return "[" + items.join(",") + "]";
		}
		var keys = Object.keys(value).sort();
		var parts = [];
		for (var k = 0; k < keys.length; k++) {
			if (value[keys[k]] !== undefined) {
				parts.push(JSON.stringify(keys[k]) + ":" + stableStringify(value[keys[k]]));
			}
		}
		return "{" + parts.join(",") + "}";
	};

	var toHex = function (bytes) {
		var hex = [];
		for (var i = 0; i < bytes.length; i++) {
			var b = bytes[i] & 0xff;
			hex.push((b < 16 ? "0" : "") + b.toString(16));
		}
		return hex.join("");
	};

	var sha256Hex = function (text) {
		var md = java.security.MessageDigest.getInstance("SHA-256");
		return toHex(md.digest(new java.lang.String(text).getBytes(java.nio.charset.StandardCharsets.UTF_8)));
	};

	// Same format as the digest CouchDB gives to an attachment, so imported files and draft attachments share blobs.
	var couchDigest = function (bytes) {
		var md = java.security.MessageDigest.getInstance("MD5");
		return "md5-" + java.util.Base64.getEncoder().encodeToString(md.digest(bytes));
	};

	// Ids are opaque: any authenticated FullSync client can list the ids of this database.
	var blobId = function (applicationId, digest) {
		return "blob_" + sha256Hex(applicationId + "\n" + digest);
	};

	var contentId = function (applicationId, hash) {
		return "content_" + sha256Hex(applicationId + "\n" + hash);
	};

	var readDoc = function (db, id) {
		try {
			var doc = toJSON(fsclient.getDocument(db, "" + id, new HashMap()));
			if (doc == null || doc.error || doc._deleted || (db == DB && doc["~c8oAcl"] !== ACL)) {
				return null;
			}
			return doc;
		}
		catch (e) {
			return null;
		}
	};

	// Deletions carry the ACL too, the design document validation refuses the others.
	var removeDocs = function (docs) {
		if (!docs.length) {
			return;
		}
		postBulkDocs(DB, toJettison(docs.map(function (doc) {
			return { _id: doc.id, _rev: doc.rev, _deleted: true, "~c8oAcl": ACL };
		})), false, true, enums.CouchPostDocumentPolicy.none, new HashMap(), false);
	};

	var postNew = function (doc) {
		return toJSON(fsclient.postDocument(DB, toJettison(doc), new HashMap(), enums.CouchPostDocumentPolicy.none, new HashMap(), false));
	};

	var viewRows = function (view, query) {
		var params = new HashMap();
		for (var key in query) {
			params.put(key, "" + query[key]);
		}
		var response = toJSON(fsclient.getView(DB, DDOC, view, params));
		return response != null && response.rows instanceof Array ? response.rows : [];
	};

	var now = function () {
		return new Date().getTime();
	};

	var isDraft = function (doc) {
		return doc != null && !doc.error && !doc._deleted && doc.c8o_view_type_drafts_form === true;
	};

	var pickFields = function (doc) {
		var fields = {};
		for (var i = 0; i < FIELDS.length; i++) {
			if (Object.prototype.hasOwnProperty.call(doc, FIELDS[i]) && doc[FIELDS[i]] !== undefined) {
				fields[FIELDS[i]] = clone(doc[FIELDS[i]]);
			}
		}
		// Transient editor payloads are never part of a version.
		if (fields.wallpaper != null && typeof fields.wallpaper == "object") {
			delete fields.wallpaper.b64;
		}
		if (fields.thumbnail != null && typeof fields.thumbnail == "object") {
			delete fields.thumbnail.b64;
		}
		return fields;
	};

	var attachmentDigests = function (doc) {
		var digests = {};
		if (doc._attachments != null) {
			for (var name in doc._attachments) {
				digests[name] = "" + doc._attachments[name].digest;
			}
		}
		return digests;
	};

	var hashOf = function (fields, digests) {
		return sha256Hex(stableStringify({ fields: fields, attachments: digests }));
	};

	var currentHash = function (draft) {
		return hashOf(pickFields(draft), attachmentDigests(draft));
	};

	var summary = function (entry) {
		return {
			id: entry._id,
			createdAt: entry.createdAt,
			origin: entry.origin,
			author: entry.author || null,
			label: entry.label || null,
			name: entry.name || null,
			contentHash: entry.contentHash,
			technicalVersion: entry.technicalVersion || null,
			publicationVersion: entry.publicationVersion || null,
			restoredFrom: entry.restoredFrom || null
		};
	};

	var cleanLabel = function (label) {
		if (label == null) {
			return null;
		}
		var value = ("" + label).replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
		if (!value.length) {
			return null;
		}
		return value.length > MAX_LABEL_LENGTH ? value.substring(0, MAX_LABEL_LENGTH) : value;
	};

	var tempFile = function () {
		return java.io.File.createTempFile("c8oforms_history_", ".bin");
	};

	// A blob without its data would break every restore using it: drop it when the upload fails.
	var putBlobData = function (id, rev, upload) {
		try {
			upload();
		}
		catch (e) {
			try {
				removeDocs([{ id: id, rev: rev }]);
			}
			catch (e2) {
				log.warn("application history: unable to drop the incomplete blob " + id + ": " + e2);
			}
			throw e;
		}
	};

	// A blob document is posted first, then its data: it only counts once the data is there.
	var blobStored = function (id) {
		var blob = readDoc(DB, id);
		return blob != null && blob._attachments != null && blob._attachments.data != null;
	};

	// Copies an attachment of the draft into a blob, unless a blob with that digest exists already.
	var storeDraftAttachment = function (draft, name, owner) {
		var attachment = draft._attachments[name];
		var id = blobId(draft._id, attachment.digest);
		if (blobStored(id)) {
			return id;
		}
		var file = tempFile();
		try {
			var query = new HashMap();
			query.put("rev", "" + draft._rev);
			fsclient.getDocumentAttachment(FORMS_DB, "" + draft._id, name, query, file);
			var posted = postNew({ _id: id, type: "blob", applicationId: "" + draft._id, digest: "" + attachment.digest, contentType: "" + attachment.content_type, creator: owner, "~c8oAcl": ACL, createdAt: now() });
			if (posted.error && posted.error != "conflict") {
				throw "unable to store the blob " + id + ": " + posted.error;
			}
			if (!posted.error) {
				putBlobData(id, posted.rev, function () {
					fsclient.putDocumentAttachment(DB, id, "data", new HashMap(), file, "" + attachment.content_type);
				});
			}
			else if (!blobStored(id)) {
				// left without data by an interrupted upload
				fsclient.putDocumentAttachment(DB, id, "data", new HashMap(), file, "" + attachment.content_type);
			}
		}
		finally {
			file["delete"]();
		}
		return id;
	};

	var storeBytes = function (applicationId, bytes, contentType, owner) {
		var digest = couchDigest(bytes);
		var id = blobId(applicationId, digest);
		if (!blobStored(id)) {
			var posted = postNew({ _id: id, type: "blob", applicationId: "" + applicationId, digest: digest, contentType: contentType, creator: owner, "~c8oAcl": ACL, createdAt: now() });
			if (posted.error && posted.error != "conflict") {
				throw "unable to store the blob " + id + ": " + posted.error;
			}
			if (!posted.error) {
				putBlobData(id, posted.rev, function () {
					fsclient.putDocumentAttachment(DB, id, "data", new HashMap(), bytes, contentType);
				});
			}
			else if (!blobStored(id)) {
				// left without data by an interrupted upload
				fsclient.putDocumentAttachment(DB, id, "data", new HashMap(), bytes, contentType);
			}
		}
		return { digest: digest, blob: id, contentType: contentType };
	};

	// Stores fields + attachments once per hash; attachments is name -> {digest, contentType, blob} (blob may be null).
	var storeContent = function (applicationId, fields, attachments, owner, draft) {
		var digests = {};
		for (var name in attachments) {
			digests[name] = attachments[name].digest;
		}
		var hash = hashOf(fields, digests);
		var id = contentId(applicationId, hash);
		if (readDoc(DB, id) == null) {
			for (var attName in attachments) {
				if (attachments[attName].blob == null) {
					attachments[attName].blob = storeDraftAttachment(draft, attName, owner);
				}
			}
			var posted = postNew({ _id: id, type: "content", applicationId: "" + applicationId, hash: hash, fields: fields, attachments: attachments, creator: owner, "~c8oAcl": ACL, createdAt: now() });
			if (posted.error && posted.error != "conflict") {
				throw "unable to store the content " + id + ": " + posted.error;
			}
		}
		return hash;
	};

	var latestEntry = function (applicationId) {
		var rows = viewRows("entries", {
			descending: true,
			limit: 1,
			startkey: JSON.stringify(["" + applicationId, {}]),
			endkey: JSON.stringify(["" + applicationId])
		});
		return rows.length ? rows[0].value : null;
	};

	var addEntry = function (applicationId, hash, origin, options, draftName, technicalVersion, owner) {
		var createdAt = now();
		var entry = {
			_id: "entry_" + ("" + java.util.UUID.randomUUID()).replace(/-/g, ""),
			type: "entry",
			applicationId: "" + applicationId,
			createdAt: createdAt,
			origin: origin,
			author: options.author != null ? "" + options.author : null,
			label: cleanLabel(options.label),
			name: draftName != null ? "" + draftName : null,
			contentHash: hash,
			technicalVersion: technicalVersion != null ? "" + technicalVersion : null,
			publicationVersion: options.publicationVersion != null ? "" + options.publicationVersion : null,
			restoredFrom: options.restoredFrom || null,
			creator: owner,
			"~c8oAcl": ACL
		};
		var posted = postNew(entry);
		if (posted.error) {
			throw "unable to store the history entry: " + posted.error;
		}
		entry._rev = posted.rev;
		return entry;
	};

	// entries: [{id, rev, createdAt}] of one application; returns the automatic entries AUTO_TIERS drops at `at`.
	var autoEntriesToDrop = function (entries, at) {
		var kept = {};
		return entries.slice().sort(function (a, b) {
			return Number(b.createdAt) - Number(a.createdAt);
		}).filter(function (entry) {
			var age = at - Number(entry.createdAt);
			for (var t = 0; t < AUTO_TIERS.length; t++) {
				if (age < AUTO_TIERS[t].upTo) {
					if (!AUTO_TIERS[t].bucket) {
						return false;
					}
					var bucket = t + ":" + Math.floor(Number(entry.createdAt) / AUTO_TIERS[t].bucket);
					if (kept[bucket]) {
						return true;
					}
					kept[bucket] = true;
					return false;
				}
			}
			return true;
		});
	};

	// Deletes the entries of `origin` beyond its retention, then the contents and blobs no entry uses any more.
	var prune = function (applicationId, origin) {
		if (origin != "auto" && RETENTION[origin] == null) {
			return;
		}
		var query = {
			descending: true,
			startkey: JSON.stringify(["" + applicationId, origin, {}]),
			endkey: JSON.stringify(["" + applicationId, origin])
		};
		if (origin != "auto") {
			query.skip = RETENTION[origin];
		}
		var rows = viewRows("entries_by_origin", query).map(function (row) {
			return { id: row.id, rev: row.value, createdAt: row.key[2] };
		});
		var dropped = origin == "auto" ? autoEntriesToDrop(rows, now()) : rows;
		if (!dropped.length) {
			return;
		}
		removeDocs(dropped);
		collectGarbage(applicationId);
	};

	var collectGarbage = function (applicationId) {
		var rows = viewRows("documents", { key: JSON.stringify("" + applicationId) });
		var usedHashes = {};
		var usedBlobs = {};
		var contents = [];
		var blobs = [];
		rows.forEach(function (row) {
			if (row.value.type == "entry") {
				usedHashes[row.value.contentHash] = true;
			}
			else if (row.value.type == "content") {
				contents.push(row);
			}
			else if (row.value.type == "blob") {
				blobs.push(row);
			}
		});
		var deletions = [];
		var collectable = function (row) {
			return row.value.createdAt == null || now() - Number(row.value.createdAt) > GARBAGE_GRACE;
		};
		contents.forEach(function (row) {
			if (usedHashes[row.value.contentHash] || !collectable(row)) {
				(row.value.blobs || []).forEach(function (id) {
					usedBlobs[id] = true;
				});
			}
			else {
				deletions.push({ id: row.id, rev: row.value.rev });
			}
		});
		blobs.forEach(function (row) {
			if (!usedBlobs[row.id] && collectable(row)) {
				deletions.push({ id: row.id, rev: row.value.rev });
			}
		});
		removeDocs(deletions);
	};

	var snapshot = function (draft, origin, options) {
		options = options || {};
		var applicationId = "" + draft._id;
		var owner = draft.creator != null ? "" + draft.creator : null;
		var fields = pickFields(draft);
		var attachments = {};
		var digests = attachmentDigests(draft);
		for (var name in digests) {
			attachments[name] = { digest: digests[name], contentType: "" + draft._attachments[name].content_type, blob: null };
		}
		var hash = storeContent(applicationId, fields, attachments, owner, draft);
		if (options.skipIfUnchanged) {
			var latest = latestEntry(applicationId);
			if (latest != null && latest.contentHash == hash) {
				return null;
			}
		}
		var entry = addEntry(applicationId, hash, origin, options, draft.name, draft.technicalVersion, owner);
		if (options.prune !== false) {
			try {
				prune(applicationId, origin);
			}
			catch (e) {
				log.warn("application history: pruning failed for " + applicationId + ": " + e);
			}
		}
		return entry;
	};

	var readEntry = function (applicationId, entryId) {
		var entry = readDoc(DB, entryId);
		return entry != null && entry.type == "entry" && ("" + entry.applicationId) === ("" + applicationId) ? entry : null;
	};

	var readContent = function (applicationId, hash) {
		return readDoc(DB, contentId(applicationId, hash));
	};

	var readBlobBytes = function (blob) {
		var file = tempFile();
		try {
			fsclient.getDocumentAttachment(DB, "" + blob, "data", new HashMap(), file);
			return java.nio.file.Files.readAllBytes(file.toPath());
		}
		finally {
			file["delete"]();
		}
	};

	return {
		DB: DB,
		isDraft: isDraft,
		summary: summary,
		snapshot: snapshot,
		readEntry: readEntry,

		cleanLabel: cleanLabel,

		// True when the next save of this draft should first record its current state as an automatic version.
		checkpointDue: function (draft) {
			return isDraft(draft) && (draft.historyCheckpointAt == null || now() - Number(draft.historyCheckpointAt) >= CHECKPOINT_DELAY);
		},

		// Hash of the draft as it is now, to spot the entries holding the same state.
		currentHash: currentHash,

		autoEntriesToDrop: autoEntriesToDrop,

		// withAutomatic false leaves the automatic versions out.
		list: function (applicationId, limit, before, withAutomatic) {
			var size = Math.min(Math.max(parseInt(limit, 10) || 20, 1), MAX_PAGE_SIZE);
			var startkey = ["" + applicationId, {}];
			if (before instanceof Array && before.length == 2) {
				startkey = ["" + applicationId, Number(before[0]), "" + before[1]];
			}
			var rows = viewRows(withAutomatic === false ? "entries_without_auto" : "entries", {
				descending: true,
				limit: size + 1,
				startkey: JSON.stringify(startkey),
				endkey: JSON.stringify(["" + applicationId])
			});
			var next = null;
			if (rows.length > size) {
				var last = rows.pop();
				next = [last.key[1], last.key[2]];
			}
			return { entries: rows.map(function (row) { return row.value; }), next: next };
		},

		// Replaces the restorable part of the draft (fields and attachments) by the content of the entry.
		// The draft must still be at expectedRev; the state it holds is first kept as a pre_restore entry.
		restore: function (draft, entry, expectedRev, author) {
			var applicationId = "" + draft._id;
			if (expectedRev != null && ("" + expectedRev) !== ("" + draft._rev)) {
				return { error: "conflict" };
			}
			var content = readContent(applicationId, entry.contentHash);
			if (content == null) {
				return { error: "not_found" };
			}
			if (currentHash(draft) == content.hash) {
				return { ok: true, unchanged: true, rev: "" + draft._rev };
			}
			// Not pruned yet: the version being restored may be the oldest pre_restore one.
			var backup = snapshot(draft, "pre_restore", { author: author, prune: false });
			var restored = clone(draft);
			for (var i = 0; i < FIELDS.length; i++) {
				if (Object.prototype.hasOwnProperty.call(content.fields, FIELDS[i])) {
					restored[FIELDS[i]] = clone(content.fields[FIELDS[i]]);
				}
				else {
					delete restored[FIELDS[i]];
				}
			}
			// The restored state is already an entry: the next save must not record it again.
			restored.historyCheckpointAt = now();
			restored.lastMofification = "" + now();
			var toUpload = [];
			var kept = {};
			var targets = content.attachments || {};
			for (var name in targets) {
				var current = draft._attachments != null ? draft._attachments[name] : null;
				if (current != null && ("" + current.digest) === ("" + targets[name].digest)) {
					kept[name] = draft._attachments[name];
				}
				else {
					toUpload.push(name);
				}
			}
			restored._attachments = kept;
			if (!Object.keys(kept).length) {
				delete restored._attachments;
			}
			var written = toJSON(fsclient.postDocument(FORMS_DB, toJettison(restored), new HashMap(), enums.CouchPostDocumentPolicy.none, new HashMap(), false));
			if (written.error) {
				// Nothing was restored: drop the backup, it duplicates the state the draft still holds.
				try {
					removeDocs([{ id: backup._id, rev: backup._rev }]);
				}
				catch (e) {
					log.warn("application history: unable to drop the backup " + backup._id + ": " + e);
				}
				return { error: written.error == "conflict" ? "conflict" : "restore_failed" };
			}
			var failures = [];
			for (var u = 0; u < toUpload.length; u++) {
				var target = targets[toUpload[u]];
				try {
					fsclient.putDocumentAttachment(FORMS_DB, applicationId, toUpload[u], new HashMap(), readBlobBytes(target.blob), "" + target.contentType);
				}
				catch (e) {
					failures.push(toUpload[u]);
					log.warn("application history: unable to restore the attachment " + toUpload[u] + " of " + applicationId + ": " + e);
				}
			}
			var head = readDoc(FORMS_DB, applicationId);
			var restoreEntry = addEntry(applicationId, content.hash, "restore", { author: author, restoredFrom: "" + entry._id, label: entry.label }, content.fields.name, content.fields.technicalVersion, draft.creator != null ? "" + draft.creator : null);
			try {
				prune(applicationId, "restore");
				prune(applicationId, "pre_restore");
			}
			catch (e) {
				log.warn("application history: pruning failed for " + applicationId + ": " + e);
			}
			var result = { ok: true, rev: head != null ? "" + head._rev : null, entry: summary(restoreEntry), backupEntryId: backup._id };
			if (failures.length) {
				result.missingAttachments = failures;
			}
			return result;
		},

		// Stores an exported .c8oforms file as an "import" entry of the application; it is restored like any other version.
		importFile: function (draft, file, label, author) {
			var applicationId = "" + draft._id;
			var owner = draft.creator != null ? "" + draft.creator : null;
			if (file == null || typeof file != "object" || !(file.formulaire instanceof Array) || !(file.pages instanceof Array) || !file.pages.length) {
				return { error: "invalid_file" };
			}
			var fields = pickFields(file);
			// A dataURL is only kept for the attachments the file actually carries.
			var dataUrls = {};
			var takeDataUrl = function (name, value) {
				if (typeof value == "string" && value.indexOf("data:") === 0 && value.indexOf(";base64,") > 0) {
					dataUrls[name] = value;
				}
			};
			if (file.wallpaper != null && typeof file.wallpaper == "object") {
				takeDataUrl("wallpaper", file.wallpaper.b64);
			}
			if (file.thumbnail != null && typeof file.thumbnail == "object") {
				takeDataUrl("thumbnail", file.thumbnail.b64);
			}
			if (file.__importAttachments != null && typeof file.__importAttachments == "object") {
				for (var extra in file.__importAttachments) {
					takeDataUrl(extra, file.__importAttachments[extra]);
				}
			}
			["wallpaper", "thumbnail"].forEach(function (name) {
				var media = fields[name];
				if (media != null && typeof media == "object" && media.enabled == true && media.type && media.type != "color" && dataUrls[name] == null) {
					media.enabled = false;
				}
			});
			c8oFormImport.sanitizeStructure(fields);
			c8oFormImport.retargetSelfReferences(fields, file._id, applicationId);
			var attachments = {};
			for (var name in dataUrls) {
				var comma = dataUrls[name].indexOf(",");
				var contentType = dataUrls[name].substring(5, dataUrls[name].indexOf(";"));
				var bytes = java.util.Base64.getDecoder().decode(new java.lang.String(dataUrls[name].substring(comma + 1)));
				attachments[name] = storeBytes(applicationId, bytes, contentType, owner);
			}
			var hash = storeContent(applicationId, fields, attachments, owner, null);
			var entry = addEntry(applicationId, hash, "import", { author: author, label: label }, fields.name, fields.technicalVersion, owner);
			return { ok: true, entry: summary(entry) };
		},

		// Builds a .c8oforms file of the entry, in the format produced by the application export.
		exportFile: function (applicationId, entry) {
			var content = readContent(applicationId, entry.contentHash);
			if (content == null) {
				return null;
			}
			var file = clone(content.fields);
			file._id = "" + applicationId;
			file.c8o_view_type_drafts_form = true;
			file.__importAttachments = {};
			var attachments = content.attachments || {};
			for (var name in attachments) {
				var dataUrl = "data:" + attachments[name].contentType + ";base64," + java.util.Base64.getEncoder().encodeToString(readBlobBytes(attachments[name].blob));
				if (file[name] != null && typeof file[name] == "object") {
					file[name].b64 = dataUrl;
				}
				else {
					file.__importAttachments[name] = dataUrl;
				}
			}
			file.__c8oformsExport = { format: "c8oforms-application", formatVersion: 1, exportedAt: now(), applicationId: "" + applicationId, historyEntryId: "" + entry._id };
			return file;
		},

		// Deletes every history document of an application.
		purge: function (applicationId) {
			var rows = viewRows("documents", { key: JSON.stringify("" + applicationId) });
			removeDocs(rows.map(function (row) {
				return { id: row.id, rev: row.value.rev };
			}));
			return rows.length;
		}
	};
})();
