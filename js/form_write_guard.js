// Optional optimistic concurrency for full-document No Code assistant writes.
// Ordinary editor callers retain the existing merge policy.
var c8oFormWriteGuard = {
  prepare: function (meta, readDocument) {
    var enabled = Object.prototype.hasOwnProperty.call(meta, "_c8oExpectedRevision");
    var revision = meta._c8oExpectedRevision;
    delete meta._c8oExpectedRevision;
    if (!enabled) { return { enabled: false }; }
    var current = meta._id ? readDocument(meta._id) : null;
    if (typeof revision !== "string" || !revision.length || meta.template ||
        !current || current._deleted || current._rev !== revision) {
      return { enabled: true, error: { error: "conflict", reason: "The form changed or is unavailable. Read it again before editing." } };
    }
    // CouchDB must receive the revision that was read, never a newer one.
    meta._rev = revision;
    // MCP readback omits attachment bodies; retain the verified revision's stubs.
    if (current._attachments) { meta._attachments = JSON.parse(JSON.stringify(current._attachments)); }
    else { delete meta._attachments; }
    return { enabled: true, document: current };
  }
};
