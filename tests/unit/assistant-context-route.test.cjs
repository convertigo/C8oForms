const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../..');
const ts = require(path.join(root, '_private/ionic/node_modules/typescript'));
const source = ts.createSourceFile('app.ts', fs.readFileSync(path.join(root, '_private/ionic/src/app/app.component.ts'), 'utf8'), ts.ScriptTarget.Latest, true);
let method;
function visit(n) { if (ts.isMethodDeclaration(n) && n.name.getText(source) === 'getAgentAssistantCurrentFormId') method = n.getText(source); ts.forEachChild(n, visit); }
visit(source); assert.ok(method);
const ctx = { window: { location: {} }, URLSearchParams };
vm.runInNewContext(ts.transpileModule('class Probe { ' + method + ' } this.Probe = Probe;', { compilerOptions: { target: ts.ScriptTarget.ES2020 } }).outputText, ctx);
test('assistant recognizes editor and viewer routes without mistaking selector or placeholders for an app', () => {
  const p = new ctx.Probe();
  for (const [pathname, expected] of [['/editor/123', '123'], ['/viewer/456/:edit/:i', '456'], ['/viewer/:formId/:edit/:i', ''], ['/selector/:published', ''], ['/editor/name%20encoded', 'name encoded']]) {
    ctx.window.location = { pathname, search: '', hash: '' };
    assert.equal(p.getAgentAssistantCurrentFormId(), expected, pathname);
  }
  ctx.window.location = { pathname: '/other', search: '?formId=789', hash: '' };
  assert.equal(p.getAgentAssistantCurrentFormId(), '789');
});
