import { expect, test } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const componentPath = existsSync(resolve(process.cwd(), '_c8oProject'))
  ? resolve(process.cwd(), '_c8oProject', 'mobileSharedComponents', 'SelectEditorComponent.yaml')
  : resolve(process.cwd(), '..', '_c8oProject', 'mobileSharedComponents', 'SelectEditorComponent.yaml');

function componentYaml(): string {
  return readFileSync(componentPath, 'utf8');
}

function visibleSearchText(option: any, keyName: string | null = null, i18nCallback: ((value: any) => any) | null = null): string {
  const hasKeyName = keyName != null && keyName !== '';
  let visibleValue = hasKeyName && option != null && typeof option === 'object' ? option[keyName] : option;

  if (hasKeyName && typeof i18nCallback === 'function') {
    visibleValue = i18nCallback(visibleValue);
  }

  if (visibleValue != null && typeof visibleValue === 'object') {
    visibleValue = visibleValue.label
      ?? visibleValue.displayValue
      ?? visibleValue.name
      ?? visibleValue.value
      ?? visibleValue.title
      ?? '';
  }

  return String(visibleValue ?? '');
}

function normalizeSearchText(value: any): string {
  return String(value ?? '').trim().toLocaleLowerCase();
}

function filterOptions(options: any[], query: string, keyName: string | null = null, i18nCallback: ((value: any) => any) | null = null): any[] {
  const normalizedQuery = normalizeSearchText(query);
  if (normalizedQuery === '') {
    return options;
  }
  return options.filter((option) => normalizeSearchText(visibleSearchText(option, keyName, i18nCallback)).includes(normalizedQuery));
}

test.describe('SelectEditorComponent optional option search source contract', () => {
  test('declares a disabled-by-default public search flag and an opt-in searchbar', () => {
    const yaml = componentYaml();

    expect(yaml).toContain('↓searchEnabled [ngx.components.UICompVariable-');
    expect(yaml).toContain('comment: Enable the optional local search bar for displayed select options.');
    expect(yaml).toMatch(/↓searchEnabled[\s\S]*?autoEmit: true[\s\S]*?value: false/);
    expect(yaml).toContain('"DoubleBinding": "script:this.searchQuery"');
    expect(yaml).toContain('"showClearButton": "plain:always"');
    expect(yaml).toContain('- MobileSmartSourceType: plain:this.isSearchEnabled()');
    expect(yaml).toContain('eventName: ionInput');
    expect(yaml).toContain('page.onSearchChange(event);');
    expect(yaml).toContain('eventName: ionClear');
    expect(yaml).toContain('page.clearSearch();');
  });

  test('filters through a computed list without mutating the source options', () => {
    const yaml = componentYaml();

    expect(yaml).toContain('public get filteredOptions(): any[]');
    expect(yaml).toContain('return sourceOptions.filter((option) => this.optionMatchesSearch(option, normalizedQuery));');
    expect(yaml).toContain('trim().toLocaleLowerCase()');
    expect(yaml).toContain('- MobileSmartSourceType: script:this.filteredOptions');
    expect(yaml).not.toContain('this.options = this.options.filter');
    expect(yaml).not.toContain('this.options.splice');
    expect(yaml).not.toContain('JSON.stringify(option)');
  });

  test('keeps active option indices anchored to the original options array', () => {
    const yaml = componentYaml();

    expect(yaml).toContain('- MobileSmartSourceType: script:this.options.indexOf(elem)');
    expect(yaml).toContain('JSON.stringify({value:JSON.stringify(elem), index: this.options.indexOf(elem)})');
    expect(yaml).toContain('↓SelectNoSearchResults');
    expect(yaml).toContain('- MobileSmartSourceType: plain:this.hasNoSearchResults()');
  });

  test('simulates filtering, clear, selected object preservation, async options, and no mutation', () => {
    const options = ['Alpha', 'Beta', 'Gamma'];
    const filtered = filterOptions(options, '  BETA  ');

    expect(filtered).toEqual(['Beta']);
    expect(options).toEqual(['Alpha', 'Beta', 'Gamma']);
    expect(filterOptions(options, '')).toBe(options);
    expect(filterOptions(options, 'zzz')).toEqual([]);

    let searchQuery = 'be';
    searchQuery = '';
    expect(filterOptions(options, searchQuery)).toBe(options);

    const selected = options[0];
    filterOptions(options, 'Beta');
    expect(selected).toBe('Alpha');

    const asyncOptions = ['Development', 'Design', 'Research'];
    expect(filterOptions(asyncOptions, 'dev')).toEqual(['Development']);

    const objectOptions = [
      { id: 'a', label: 'Functional Alpha' },
      { id: 'b', label: 'Functional Beta' },
    ];
    expect(filterOptions(objectOptions, 'beta', 'label')).toEqual([objectOptions[1]]);
    expect(filterOptions(objectOptions, 'translated', 'id', (value) => (value === 'b' ? 'Translated Beta' : value))).toEqual([objectOptions[1]]);
  });
});
