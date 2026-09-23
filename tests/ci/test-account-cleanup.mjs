// Housekeeping of the disposable e2e accounts, run by ensure-test-users.mjs as the
// engine admin before each CI run (E2E_RESET_USER_DATA). Every function takes a
// `fullsync` adapter so the tests can stand in for the server:
//   get(db, id)        -> document, or null when it does not exist
//   find(db, body)     -> JSON answer of POST /fullsync/<db>/_find
//   bulkDocs(db, docs) -> JSON answer of POST /fullsync/<db>/_bulk_docs
//   put(db, doc)       -> PUT /fullsync/<db>/<id>, throws when it is refused

export const FORMS_DB = 'c8oforms_fs';
export const GROUPS_DB = 'c8ofullsyncgrp';
export const HISTORY_DB = 'c8oforms_history_fs';
export const HIDDEN_PUBLICATION_GROUP_PREFIX = '_C8O_HIDDEN_published_';
// A CI run lasts about two hours (Chromium then Firefox on the nightly): tokens
// minted by a run still in progress are younger than this and are kept.
export const MCP_TOKEN_MAX_AGE_MS = 12 * 60 * 60 * 1000;

const FIND_PAGE_SIZE = 500;
const IN_CHUNK_SIZE = 200;

export async function findAll(fullsync, db, selector, fields) {
  const found = [];
  let bookmark = null;
  for (let page = 0; page < 1000; page++) {
    const body = { selector, fields, limit: FIND_PAGE_SIZE };
    if (bookmark) body.bookmark = bookmark;
    const json = await fullsync.find(db, body);
    const docs = json?.docs || [];
    found.push(...docs);
    bookmark = json?.bookmark;
    if (docs.length < FIND_PAGE_SIZE) break;
  }
  return found;
}

export async function deleteDocs(fullsync, db, docs) {
  let deleted = 0;
  for (const chunk of chunks(docs, FIND_PAGE_SIZE)) {
    const results = await fullsync.bulkDocs(
      db,
      chunk.map((d) => ({ _id: d._id, _rev: d._rev, _deleted: true })),
    );
    deleted += (Array.isArray(results) ? results : []).filter((r) => r?.ok).length;
  }
  return deleted;
}

/**
 * APIV2_Publish puts the creator of a published application, and the generated
 * user of an anonymous PWA, in _C8O_HIDDEN_published_<id>. The document purge
 * deletes the published documents without that group (#1557), so the account
 * piles up groups that every getCurrentUserSettings and ACL-filtered
 * APIV2_ExecuteView resolves. Remove, for all their members, the hidden
 * publication groups of `user` whose published document no longer exists.
 */
export async function removeOrphanHiddenPublicationGroups(fullsync, user) {
  const memberships = await findAll(fullsync, GROUPS_DB, { type: 'c8oGrp', user }, ['group']);
  const groups = [
    ...new Set(
      memberships.map((m) => m?.group).filter((g) => typeof g === 'string' && g.startsWith(HIDDEN_PUBLICATION_GROUP_PREFIX)),
    ),
  ];
  const publishedId = (group) => group.slice('_C8O_HIDDEN_'.length);

  const existing = new Set();
  for (const chunk of chunks(groups, IN_CHUNK_SIZE)) {
    const docs = await findAll(fullsync, FORMS_DB, { _id: { $in: chunk.map(publishedId) } }, ['_id']);
    for (const doc of docs) existing.add(doc._id);
  }
  const orphans = groups.filter((group) => !existing.has(publishedId(group)));

  const members = [];
  for (const chunk of chunks(orphans, IN_CHUNK_SIZE)) {
    members.push(...(await findAll(fullsync, GROUPS_DB, { type: 'c8oGrp', group: { $in: chunk } }, ['_id', '_rev'])));
  }
  const removed = await deleteDocs(fullsync, GROUPS_DB, members);
  return { groups: orphans.length, memberships: removed };
}

/**
 * The version history of the applications (#1359) lives in its own database, and
 * each of its documents carries the creator of its application. The document
 * purge deletes the applications, not their versions: delete the versions of
 * `user` too. Releases older than the history have no such database, which is
 * not an error.
 */
export async function purgeApplicationVersions(fullsync, user) {
  let docs;
  try {
    docs = await findAll(fullsync, HISTORY_DB, { creator: user }, ['_id', '_rev']);
  } catch (error) {
    if (/ failed: 404 /.test(String(error?.message ?? error))) {
      return 0;
    }
    throw error;
  }
  return deleteDocs(fullsync, HISTORY_DB, docs);
}

/**
 * Each shard mints an MCP token for its account on every run and never revokes
 * it; revoking would not help anyway, a revoked token stays in the list. The
 * list lives in the C8Oreserved_<user> settings document, which
 * getCurrentUserSettings returns on every page load. Drop the tokens created
 * more than MCP_TOKEN_MAX_AGE_MS ago; keep the ones without a readable date.
 * The document is written back whole, as the #1421 fixture seed does, so its
 * ~c8oAcl owner must come back with it.
 */
export async function pruneStaleMcpTokens(fullsync, user, now = Date.now()) {
  const settings = await fullsync.get(FORMS_DB, `C8Oreserved_${user}`);
  const tokens = settings?.mcp?.tokens == null ? [] : [].concat(settings.mcp.tokens);
  const kept = tokens.filter((token) => {
    const createdAt = Date.parse(token?.createdAt ?? '');
    return Number.isNaN(createdAt) || now - createdAt <= MCP_TOKEN_MAX_AGE_MS;
  });
  if (kept.length === tokens.length) {
    return 0;
  }

  if (!settings['~c8oAcl']) {
    throw new Error(`C8Oreserved_${user} was read without its ~c8oAcl owner, left untouched`);
  }
  await fullsync.put(FORMS_DB, { ...settings, mcp: { ...settings.mcp, tokens: kept } });
  return tokens.length - kept.length;
}

function chunks(items, size) {
  const out = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}
