import assert from 'node:assert/strict';
import test from 'node:test';
import {
  FORMS_DB,
  GROUPS_DB,
  MCP_TOKEN_MAX_AGE_MS,
  pruneStaleMcpTokens,
  removeOrphanHiddenPublicationGroups,
} from './test-account-cleanup.mjs';

// In-memory stand-in for the admin FullSync endpoints: _find with equality, $in
// and $or selectors, `limit` and a numeric bookmark; _bulk_docs and PUT with _rev
// checks.
function fakeFullSync(dbs) {
  const calls = { find: [], bulkDocs: [], put: [] };
  const matches = (doc, selector) =>
    Object.entries(selector).every(([key, cond]) => {
      if (key === '$or') return cond.some((sub) => matches(doc, sub));
      if (cond && typeof cond === 'object' && '$in' in cond) return cond.$in.includes(doc[key]);
      return doc[key] === cond;
    });
  const project = (doc, fields) => Object.fromEntries(fields.filter((f) => f in doc).map((f) => [f, doc[f]]));
  return {
    calls,
    dbs,
    async get(db, id) {
      const doc = dbs[db].find((d) => d._id === id);
      return doc ? structuredClone(doc) : null;
    },
    async find(db, { selector, fields, limit, bookmark }) {
      calls.find.push({ db, selector });
      const all = dbs[db].filter((d) => matches(d, selector));
      const start = bookmark ? Number(bookmark) : 0;
      return { docs: all.slice(start, start + limit).map((d) => project(d, fields)), bookmark: String(start + limit) };
    },
    async bulkDocs(db, docs) {
      calls.bulkDocs.push({ db, count: docs.length });
      return docs.map((doc) => {
        const index = dbs[db].findIndex((d) => d._id === doc._id);
        if (index < 0 || dbs[db][index]._rev !== doc._rev) return { id: doc._id, error: 'conflict' };
        if (doc._deleted) dbs[db].splice(index, 1);
        return { id: doc._id, ok: true };
      });
    },
    async put(db, doc) {
      calls.put.push({ db, id: doc._id });
      const index = dbs[db].findIndex((d) => d._id === doc._id);
      if (index < 0 || dbs[db][index]._rev !== doc._rev) throw new Error(`409 conflict on ${doc._id}`);
      dbs[db][index] = { ...doc, _rev: `${Number(doc._rev.split('-')[0]) + 1}-x` };
    },
  };
}

const membership = (user, group) => ({ _id: `${user}:${group}`, _rev: '1-a', type: 'c8oGrp', user, group });

test('removes, for all their members, the hidden publication groups whose published form is gone', async () => {
  const user = 'testuser2-convertigo@yopmail.com';
  const fullsync = fakeFullSync({
    [GROUPS_DB]: [
      membership(user, '_C8O_HIDDEN_published_1'),
      membership('anonymous-hash-1', '_C8O_HIDDEN_published_1'),
      membership(user, '_C8O_HIDDEN_published_2'),
      membership(user, '_C8O_HIDDEN_testuser2-convertigo_yopmail-com'),
      membership(user, `C8Oreserved_${user}`),
      membership(user, 'sales'),
      membership('someone@else.com', '_C8O_HIDDEN_published_3'),
    ],
    [FORMS_DB]: [{ _id: 'published_2', _rev: '1-a' }],
  });

  assert.deepEqual(await removeOrphanHiddenPublicationGroups(fullsync, user), { groups: 1, memberships: 2 });
  assert.deepEqual(
    fullsync.dbs[GROUPS_DB].map((m) => m._id),
    [
      `${user}:_C8O_HIDDEN_published_2`,
      `${user}:_C8O_HIDDEN_testuser2-convertigo_yopmail-com`,
      `${user}:C8Oreserved_${user}`,
      `${user}:sales`,
      'someone@else.com:_C8O_HIDDEN_published_3',
    ],
  );
});

test('pages through a large backlog of orphan groups', async () => {
  const user = 'testuser2-convertigo@yopmail.com';
  const orphans = Array.from({ length: 1318 }, (_, i) => membership(user, `_C8O_HIDDEN_published_${i}`));
  const fullsync = fakeFullSync({ [GROUPS_DB]: [...orphans, membership(user, 'sales')], [FORMS_DB]: [] });

  assert.deepEqual(await removeOrphanHiddenPublicationGroups(fullsync, user), { groups: 1318, memberships: 1318 });
  assert.deepEqual(fullsync.dbs[GROUPS_DB].map((m) => m.group), ['sales']);
  assert.ok(fullsync.calls.bulkDocs.every((call) => call.count <= 500), 'bulk deletes stay in batches of 500');
  for (const { selector } of fullsync.calls.find) {
    const values = selector._id?.$in ?? selector.group?.$in ?? [];
    assert.ok(values.length <= 200, '$in selectors stay in batches of 200');
  }
});

test('does nothing when the user has no hidden publication group', async () => {
  const user = 'testuser3-convertigo@yopmail.com';
  const fullsync = fakeFullSync({ [GROUPS_DB]: [membership(user, 'sales')], [FORMS_DB]: [] });

  assert.deepEqual(await removeOrphanHiddenPublicationGroups(fullsync, user), { groups: 0, memberships: 0 });
  assert.equal(fullsync.calls.bulkDocs.length, 0);
});

const NOW = Date.parse('2026-09-23T12:00:00Z');
const hoursAgo = (hours) => new Date(NOW - hours * 3600_000).toISOString().replace(/\.\d{3}Z$/, 'Z');

test('drops the MCP tokens older than the maximum age and keeps the rest of the settings', async () => {
  const user = 'testuser-convertigo@yopmail.com';
  const settings = {
    _id: `C8Oreserved_${user}`,
    _rev: '7-a',
    '~c8oAcl': user,
    language: 'fr',
    mcp: {
      signature: 'secret',
      tokens: [
        { id: 'old', createdAt: hoursAgo(13) },
        { id: 'revoked-old', createdAt: hoursAgo(20), revokedAt: hoursAgo(19) },
        { id: 'running-shard', createdAt: hoursAgo(1) },
        { id: 'no-date', createdAt: '' },
      ],
    },
  };
  const fullsync = fakeFullSync({ [FORMS_DB]: [settings] });

  assert.equal(await pruneStaleMcpTokens(fullsync, user, NOW), 2);
  const saved = fullsync.dbs[FORMS_DB][0];
  assert.deepEqual(saved.mcp.tokens.map((t) => t.id), ['running-shard', 'no-date']);
  assert.equal(saved.mcp.signature, 'secret');
  assert.equal(saved.language, 'fr');
  assert.equal(saved['~c8oAcl'], user);
  assert.ok(MCP_TOKEN_MAX_AGE_MS >= 12 * 3600_000, 'tokens of a run still in progress are kept');
});

test('leaves the settings untouched when no token is stale', async () => {
  const user = 'testuser-convertigo@yopmail.com';
  const fullsync = fakeFullSync({
    [FORMS_DB]: [{ _id: `C8Oreserved_${user}`, _rev: '1-a', mcp: { tokens: { id: 'single', createdAt: hoursAgo(2) } } }],
  });

  assert.equal(await pruneStaleMcpTokens(fullsync, user, NOW), 0);
  assert.equal(fullsync.calls.put.length, 0);
  assert.equal(await pruneStaleMcpTokens(fakeFullSync({ [FORMS_DB]: [] }), 'nobody@example.com', NOW), 0);
});

test('reports a settings update that lost a race', async () => {
  const user = 'testuser-convertigo@yopmail.com';
  const fullsync = fakeFullSync({
    [FORMS_DB]: [
      { _id: `C8Oreserved_${user}`, _rev: '1-a', '~c8oAcl': user, mcp: { tokens: [{ id: 'old', createdAt: hoursAgo(30) }] } },
    ],
  });
  // A shard mints its token between our read and our write.
  const get = fullsync.get;
  fullsync.get = async (db, id) => {
    const doc = await get(db, id);
    fullsync.dbs[FORMS_DB][0]._rev = '2-b';
    return doc;
  };

  await assert.rejects(pruneStaleMcpTokens(fullsync, user, NOW), /409 conflict/);
});

test('never writes back a settings document read without its owner', async () => {
  const user = 'testuser-convertigo@yopmail.com';
  const fullsync = fakeFullSync({
    [FORMS_DB]: [{ _id: `C8Oreserved_${user}`, _rev: '1-a', mcp: { tokens: [{ id: 'old', createdAt: hoursAgo(30) }] } }],
  });

  await assert.rejects(pruneStaleMcpTokens(fullsync, user, NOW), /without its ~c8oAcl owner/);
  assert.equal(fullsync.calls.put.length, 0);
});
