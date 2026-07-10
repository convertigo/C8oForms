import { expect, test, type Locator, type Page } from '@playwright/test';
import { SEL, c8oCall, login } from './studio';

const ADMIN_SEL = {
  homePage: 'page-admindashboardhome',
  usersPage: 'page-admindashboardusers',
  groupsPage: 'page-admindashboarduserswithingroups',
  gridSurface: '.ag-root:visible, lib-extendedcomponents-ui-ngx-aggrid:visible',
  addUserButton: 'page-admindashboardusers ion-button:visible',
  addGroupButton: 'page-admindashboarduserswithingroups ion-button:visible',
  addGroupModal: 'ion-modal.show-modal c8oforms-addgroupform, ion-modal:visible c8oforms-addgroupform',
  addUserToGroupModal:
    'ion-modal.show-modal c8oforms-addusertogroupform, ion-modal:visible c8oforms-addusertogroupform',
  addUserToGroupToolbarButton: [
    'ion-button.class1759754212388',
    'ion-button:has-text("Add")',
    'ion-button:has-text("Move")',
    'ion-button:has-text("Ajouter")',
    'ion-button:has-text("Déplacer")',
  ].join(', '),
  userActionsButton: 'page-admindashboarduserswithingroups ion-button:has-text("Actions")',
  userActionsPopover: 'ion-popover:not(.overlay-hidden), ion-popover:visible',
  groupActionsEditButton: [
    'ion-button.class1759496757748',
    'ion-button:has-text("Edit")',
    'ion-button:has-text("Update")',
    'ion-button:has-text("Modifier")',
  ].join(', '),
  addUserToGroupSubmitButton:
    'ion-button.class1759506947271, ion-button:has-text("Add"), ion-button:has-text("Ajouter"), ion-button:has-text("Agregar"), ion-button:has-text("Aggiungi")',
  editGroupModal: 'ion-modal.show-modal c8oforms-addgroupform, ion-modal:visible c8oforms-addgroupform',
  editGroupPublicationCheckbox: 'ion-checkbox.class1759764039312',
  editGroupSubmitButton:
    'ion-button.class1759764039348, ion-button.send-button--linear, ion-button:has-text("Save"), ion-button:has-text("Enregistrer"), ion-button:has-text("Sauvegarder")',
  addGroupInput: 'ion-input input, input',
} as const;

export async function loginAsAdminWithUsernamePassword(page: Page): Promise<void> {
  await test.step('Log in with the configured admin-capable Studio user', async () => {
    await login(page);
  });
}

export async function verifyAdminGroupCanBeCreatedAndCleanedThroughUi(page: Page): Promise<void> {
  const groupName = `functional_admin_group_${Date.now()}`;
  let currentUserAcl = '';
  let addedUserAcl = '';
  let addedUserLabel = '';
  let expectedMemberCount = 1;
  try {
    await test.step('Open the Admin Groups management page', async () => {
      await page.goto('./admin/dashboard-groups', { waitUntil: 'domcontentloaded', timeout: 60_000 });
      await expect(page.locator(ADMIN_SEL.groupsPage).first(), 'Admin Groups page should be visible').toBeVisible({
        timeout: 60_000,
      });
      await expect(page.locator(ADMIN_SEL.groupsPage).locator(ADMIN_SEL.gridSurface).first(), 'Admin Groups grid should render').toBeVisible({
        timeout: 60_000,
      });
    });

    await test.step('Create a temporary group through the Admin UI', async () => {
      const addGroupButton = page
        .getByRole('button', {
          name: /Create a group|Add group|Cr[ée]er.*groupe|Ajouter.*groupe|Crear.*grupo|Aggiungi.*gruppo|admingroup_button_addgroup/i,
        })
        .first();
      await expect(addGroupButton, 'Admin Groups page should expose the Add group action').toBeVisible({
        timeout: 30_000,
      });
      await addGroupButton.click({ timeout: 10_000 }).catch(async () => addGroupButton.dispatchEvent('click'));

      const modal = page.locator(ADMIN_SEL.addGroupModal).last();
      await expect(modal, 'Add group modal should open').toBeVisible({ timeout: 30_000 });
      const input = modal.locator(ADMIN_SEL.addGroupInput).first();
      await expect(input, 'Add group modal should expose a group name input').toBeVisible({ timeout: 15_000 });
      await input.fill(groupName);
      await input.dispatchEvent('input');
      await input.dispatchEvent('change');

      const editingRights = modal
        .getByRole('checkbox', {
          name: /Application editing|Editing rights|editing_rights/i,
        })
        .first();
      await expect(editingRights, 'Add group modal should expose the Application editing permission').toBeVisible({
        timeout: 15_000,
      });
      if (!(await editingRights.isChecked().catch(() => false))) {
        await editingRights.click({ timeout: 10_000 }).catch(async () => editingRights.dispatchEvent('click'));
      }
      await expect(editingRights, 'Application editing permission should be checked before creating the group').toBeChecked({
        timeout: 10_000,
      });

      const submit = modal
        .getByRole('button', {
          name: /Create a group|Add|Cr[ée]er.*groupe|Ajouter|Agregar|Aggiungi|admingroup_button_addgroup/i,
        })
        .last();
      await expect(submit, 'Add group modal should expose a submit button').toBeVisible({ timeout: 15_000 });
      await submit.click({ timeout: 10_000 }).catch(async () => submit.dispatchEvent('click'));
      await expect(modal, 'Add group modal should close after creation').toBeHidden({ timeout: 60_000 });
    });

    await test.step('Verify the temporary group is visible to the Admin group listing', async () => {
      await expect
        .poll(() => visibleAdminGroupNameInPage(page, groupName), {
          message: `temporary admin group ${groupName} should be visible in the Admin Groups UI`,
          timeout: 60_000,
        })
        .toBe(true);
      await expect
        .poll(() => adminGroupExists(page, groupName), {
          message: `temporary admin group ${groupName} should exist after UI creation`,
          timeout: 60_000,
        })
        .toBe(true);
      await expect
        .poll(() => adminGroupRightEnabled(page, groupName, 'editing_rights'), {
          message: `temporary admin group ${groupName} should persist editing_rights=true`,
          timeout: 60_000,
        })
        .toBe(true);
    });

    await test.step('Add the current user to the temporary group through the Add user to group modal', async () => {
      const currentUser = await currentAdminUser(page);
      currentUserAcl = currentUser.acl;
      expect(currentUserAcl, 'current admin user should expose a FullSync ACL id').not.toBe('');
      const user = await firstAdminUserOutsideGroup(page, groupName, currentUserAcl);
      addedUserAcl = user.acl;
      addedUserLabel = user.label;
      const initialMemberCount = await adminGroupMemberCount(page, groupName);

      await addUserToAdminGroupThroughModal(page, groupName, addedUserLabel);
      expectedMemberCount = initialMemberCount + 1;
      await expect
        .poll(() => adminGroupMemberCount(page, groupName), {
          message: `temporary admin group ${groupName} should count the added member`,
          timeout: 60_000,
        })
        .toBe(expectedMemberCount);
      await expect
        .poll(() => adminGroupContainsUser(page, groupName, addedUserAcl), {
          message: `temporary admin group ${groupName} should contain the user added through the modal`,
          timeout: 60_000,
        })
        .toBe(true);
    });

    await test.step('Verify the Admin Groups UI reflects the member counter', async () => {
      await page.goto('./admin/dashboard-groups', { waitUntil: 'domcontentloaded', timeout: 60_000 });
      await expect(page.locator(ADMIN_SEL.groupsPage).first(), 'Admin Groups page should be visible after membership update').toBeVisible({
        timeout: 60_000,
      });
      await expect
        .poll(() => visibleAdminGroupNameWithMemberCount(page, groupName, expectedMemberCount), {
          message: `temporary admin group ${groupName} should show the expected member counter in the Admin Groups UI`,
          timeout: 60_000,
        })
        .toBe(true);
      if (addedUserLabel) {
        await expect
          .poll(() => adminGroupContainsVisibleUserAfterSelection(page, groupName, addedUserLabel), {
            message: `temporary admin group ${groupName} should show the user added through the modal after group selection`,
            timeout: 60_000,
          })
          .toBe(true);
      }
    });

    await test.step('Update an existing group right through the edit group modal and verify persistence', async () => {
      await updateAdminGroupPublicationRightThroughModal(page, groupName);
      await expect
        .poll(() => adminGroupRightEnabled(page, groupName, 'publication'), {
          message: `temporary admin group ${groupName} should persist publication=true after UI edit`,
          timeout: 60_000,
        })
        .toBe(true);
    });
  } finally {
    const usersToRemove = [...new Set([currentUserAcl, addedUserAcl].filter((user) => user !== ''))];
    if (usersToRemove.length > 0) {
      await removeUsersFromAdminGroups(page, [groupName], usersToRemove).catch(() => undefined);
    }
    await deleteTemporaryAdminGroup(page, groupName).catch(() => undefined);
  }
}

async function currentAdminUser(page: Page): Promise<{ acl: string; label: string }> {
  const response = await c8oCall(page, 'getCurrentUserSettings', {});
  const settings = settingsResult(response);
  const label =
    stringValue(settings.displayName) ||
    `${stringValue(settings.name)} ${stringValue(settings.surname)}`.trim() ||
    stringValue(settings.mail) ||
    stringValue(settings.email) ||
    stringValue(settings.user);
  return {
    acl: stringValue(settings['~c8oAcl']),
    label,
  };
}

async function firstAdminUserOutsideGroup(page: Page, groupName: string, currentUserAcl: string): Promise<{ acl: string; label: string }> {
  const allUsers = await adminGroupChildren(page, 'all_users');
  const currentMembers = new Set((await adminGroupChildren(page, groupName)).map((entry) => stringValue(entry['~c8oAcl'])));
  const candidate = allUsers
    .map((entry) => ({ acl: stringValue(entry['~c8oAcl']), label: adminUserLabel(entry) }))
    .find((entry) => entry.acl && entry.acl !== currentUserAcl && !currentMembers.has(entry.acl) && entry.label);

  expect(candidate, `Admin Groups test needs at least one visible user outside ${groupName} to exercise the Add user modal`).toBeTruthy();
  return candidate!;
}

async function adminGroupChildren(page: Page, groupName: string): Promise<Record<string, unknown>[]> {
  const entry = await adminGroupListEntry(page, groupName, groupName !== 'all_users');
  const children = Array.isArray(entry?.children) ? entry.children : [];
  return children.filter((child): child is Record<string, unknown> => Boolean(child) && typeof child === 'object');
}

function adminUserLabel(user: Record<string, unknown>): string {
  return (
    stringValue(user.displayName) ||
    `${stringValue(user.name)} ${stringValue(user.surname)}`.trim() ||
    stringValue(user.mail) ||
    stringValue(user.email) ||
    stringValue(user.user) ||
    stringValue(user['~c8oAcl'])
  );
}

async function removeUsersFromAdminGroups(page: Page, groups: string[], users: string[]): Promise<void> {
  await c8oCall(page, 'admin_users_remove_from_groups', {
    groups: JSON.stringify(groups),
    users: JSON.stringify(users),
  });
}

async function addUserToAdminGroupThroughModal(page: Page, groupName: string, userLabel: string): Promise<void> {
  await selectVisibleAdminUser(page, userLabel);

  const actionsButton = page.locator(ADMIN_SEL.userActionsButton).filter({ visible: true }).last();
  await expect(actionsButton, 'Admin Groups page should expose user actions after user selection').toBeVisible({
    timeout: 30_000,
  });
  await actionsButton.click({ timeout: 10_000 }).catch(async () => actionsButton.dispatchEvent('click'));

  const popover = page.locator(ADMIN_SEL.userActionsPopover).last();
  await expect(popover, 'Admin Groups user actions popover should open').toBeVisible({ timeout: 15_000 });
  const openButton = popover.locator(ADMIN_SEL.addUserToGroupToolbarButton).filter({ visible: true }).first();
  await expect(openButton, 'Admin Groups user actions should expose the Add user to group action').toBeVisible({
    timeout: 30_000,
  });
  await openButton.click({ timeout: 10_000 }).catch(async () => openButton.dispatchEvent('click'));

  const modal = page.locator(ADMIN_SEL.addUserToGroupModal).last();
  await expect(modal, 'Add user to group modal should be visible').toBeVisible({ timeout: 30_000 });
  await expect(modal.getByText(groupName, { exact: false }).first(), 'Add user to group modal should list the temporary group').toBeVisible({
    timeout: 60_000,
  });

  await selectGroupInAddUserToGroupModal(modal, groupName);

  const submit = modal.locator(ADMIN_SEL.addUserToGroupSubmitButton).last();
  await expect(submit, 'Add user to group modal should expose a submit button').toBeVisible({ timeout: 15_000 });
  await expect(submit, 'Add user to group submit button should be enabled after group selection').toBeEnabled({ timeout: 10_000 });
  await submit.click({ timeout: 10_000 }).catch(async () => submit.dispatchEvent('click'));
  await expect(modal, 'Add user to group modal should close after submit').toBeHidden({ timeout: 60_000 });
}

async function updateAdminGroupPublicationRightThroughModal(page: Page, groupName: string): Promise<void> {
  await selectVisibleAdminGroup(page, groupName);
  const actionsButton = page.locator(ADMIN_SEL.userActionsButton).filter({ visible: true }).first();
  await expect(actionsButton, 'Admin Groups page should expose group actions after group selection').toBeVisible({
    timeout: 30_000,
  });
  await actionsButton.click({ timeout: 10_000 }).catch(async () => actionsButton.dispatchEvent('click'));

  const popover = page.locator(ADMIN_SEL.userActionsPopover).last();
  await expect(popover, 'Admin Groups group actions popover should open').toBeVisible({ timeout: 15_000 });
  const editButton = popover.locator(ADMIN_SEL.groupActionsEditButton).filter({ visible: true }).first();
  await expect(editButton, 'Admin Groups group actions should expose the edit group action').toBeVisible({
    timeout: 30_000,
  });
  await editButton.click({ timeout: 10_000 }).catch(async () => editButton.dispatchEvent('click'));

  const modal = page.locator(ADMIN_SEL.editGroupModal).last();
  await expect(modal, 'Edit group modal should be visible').toBeVisible({ timeout: 30_000 });
  const groupNameInput = modal.locator(ADMIN_SEL.addGroupInput).first();
  await expect(groupNameInput, 'Edit group modal should expose the group name input').toBeVisible({ timeout: 30_000 });
  await expect(page.locator(ADMIN_SEL.groupsPage).getByText(groupName, { exact: false }).first(), 'Admin Groups page should still have the temporary group selected behind the edit modal').toBeVisible({
    timeout: 10_000,
  });
  if ((await groupNameInput.inputValue().catch(() => '')) !== groupName) {
    await groupNameInput.fill(groupName);
    await groupNameInput.dispatchEvent('input');
    await groupNameInput.dispatchEvent('change');
  }
  await expect(groupNameInput, 'Edit group modal should keep the temporary group name before saving').toHaveValue(groupName, {
    timeout: 10_000,
  });

  const publication = modal
    .getByRole('checkbox', {
      name: /Application publishing|Publication|publication_perm|Publisher|Publier/i,
    })
    .first()
    .or(modal.locator(ADMIN_SEL.editGroupPublicationCheckbox).last());
  await expect(publication, 'Edit group modal should expose the publication permission').toBeVisible({ timeout: 30_000 });
  await setIonCheckboxChecked(publication, true);

  const submit = modal.locator(ADMIN_SEL.editGroupSubmitButton).filter({ visible: true }).last();
  await expect(submit, 'Edit group modal should expose a save button').toBeVisible({ timeout: 15_000 });
  await submit.click({ timeout: 10_000 }).catch(async () => submit.dispatchEvent('click'));
  await expect(modal, 'Edit group modal should close after save').toBeHidden({ timeout: 60_000 });
}

async function setIonCheckboxChecked(locator: ReturnType<Page['locator']>, expected: boolean): Promise<void> {
  const checked = await ionCheckboxChecked(locator);
  if (checked !== expected) {
    await locator.click({ timeout: 10_000 }).catch(async () => locator.dispatchEvent('click'));
  }
  await expect
    .poll(() => ionCheckboxChecked(locator), {
      message: `ion-checkbox should be ${expected ? 'checked' : 'unchecked'}`,
      timeout: 10_000,
    })
    .toBe(expected);
}

async function ionCheckboxChecked(locator: ReturnType<Page['locator']>): Promise<boolean> {
  return locator.evaluate((element) => {
    const checkbox = element as HTMLElement & { checked?: boolean };
    return checkbox.checked === true || checkbox.classList.contains('checkbox-checked') || checkbox.getAttribute('aria-checked') === 'true';
  });
}

async function selectVisibleAdminUser(page: Page, userLabel: string): Promise<void> {
  const row = page
    .locator(`${ADMIN_SEL.groupsPage} [role="row"]`)
    .filter({ hasText: userLabel })
    .last();
  await expect(row, `Admin user row ${userLabel} should be visible`).toBeVisible({ timeout: 30_000 });
  const checkbox = row.getByRole('checkbox').first();
  await expect(checkbox, `Admin user row ${userLabel} should expose a selection checkbox`).toBeVisible({ timeout: 15_000 });
  await checkbox.click({ timeout: 10_000 }).catch(async () => checkbox.dispatchEvent('click'));
  await expect(checkbox, `Admin user row ${userLabel} should be selected`).toBeChecked({ timeout: 10_000 });
}

async function selectVisibleAdminGroup(page: Page, groupName: string): Promise<void> {
  const row = page
    .locator(`${ADMIN_SEL.groupsPage} [role="row"]`)
    .filter({ hasText: groupName })
    .first();
  await expect(row, `Admin group row ${groupName} should be visible`).toBeVisible({ timeout: 30_000 });
  const checkbox = row.getByRole('checkbox').first();
  await expect(checkbox, `Admin group row ${groupName} should expose a selection checkbox`).toBeVisible({ timeout: 15_000 });
  if (!(await checkbox.isChecked().catch(() => false))) {
    await checkbox.click({ timeout: 10_000 }).catch(async () => checkbox.dispatchEvent('click'));
  }
  await expect(checkbox, `Admin group row ${groupName} should be selected`).toBeChecked({ timeout: 10_000 });
}

async function selectGroupInAddUserToGroupModal(modal: Locator, groupName: string): Promise<void> {
  const row = modal.locator('[role="row"]').filter({ hasText: groupName }).last();
  await expect(row, `Add user to group modal should show group row ${groupName}`).toBeVisible({ timeout: 30_000 });
  const checkbox = row.getByRole('checkbox').first();
  await expect(checkbox, `Add user to group modal should expose a checkbox for ${groupName}`).toBeVisible({ timeout: 15_000 });
  await checkbox.click({ timeout: 10_000 }).catch(async () => checkbox.dispatchEvent('click'));
  await expect(checkbox, `Add user to group modal should select ${groupName}`).toBeChecked({ timeout: 10_000 });
}

async function adminGroupExists(page: Page, groupName: string): Promise<boolean> {
  const response = await c8oCall(page, 'admin_groups_get', {});
  return groupNames(response).includes(groupName);
}

async function visibleAdminGroupNameInPage(page: Page, groupName: string): Promise<boolean> {
  return page.evaluate((expected) => {
    const visible = (el: Element): el is HTMLElement => {
      const box = (el as HTMLElement).getBoundingClientRect();
      const style = getComputedStyle(el);
      return box.width > 0 && box.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    };
    return [...document.querySelectorAll('page-admindashboarduserswithingroups *')]
      .filter(visible)
      .some((element) => (element.textContent ?? '').includes(expected));
  }, groupName);
}

async function visibleAdminGroupNameWithMemberCount(page: Page, groupName: string, count: number): Promise<boolean> {
  const rows = await visibleAdminGroupTexts(page, groupName);
  return rows.some((text) => text.replace(groupName, '').match(new RegExp(`\\b${count}\\b`)));
}

async function adminGroupContainsVisibleUserAfterSelection(page: Page, groupName: string, userMail: string): Promise<boolean> {
  const group = page.getByText(groupName, { exact: false }).first();
  if (!(await group.isVisible({ timeout: 1_000 }).catch(() => false))) {
    return false;
  }
  await group.click({ timeout: 3_000 }).catch(async () => group.dispatchEvent('click'));
  await page.waitForTimeout(1_000);
  return page.locator(ADMIN_SEL.groupsPage).getByText(userMail, { exact: false }).first().isVisible({ timeout: 1_000 }).catch(() => false);
}

async function visibleAdminGroupTexts(page: Page, groupName: string): Promise<string[]> {
  return page.evaluate((expected) => {
    const visible = (el: Element): el is HTMLElement => {
      const box = (el as HTMLElement).getBoundingClientRect();
      const style = getComputedStyle(el);
      return box.width > 0 && box.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    };
    return [...document.querySelectorAll('page-admindashboarduserswithingroups *')]
      .filter(visible)
      .map((element) => (element.textContent ?? '').replace(/\s+/g, ' ').trim())
      .filter((text) => text.includes(expected) && text.length < 300);
  }, groupName);
}

async function adminGroupRightEnabled(page: Page, groupName: string, right: string): Promise<boolean> {
  const doc = await adminGroupDocument(page, groupName);
  return doc?.[right] === true || doc?.[right] === 'true';
}

async function adminGroupDocument(page: Page, groupName: string): Promise<Record<string, unknown> | null> {
  const response = await c8oCall(page, 'admin_group_get', { _use_doc_id: groupName }).catch(() => null);
  return adminGroupRecord(response, groupName);
}

async function adminGroupMemberCount(page: Page, groupName: string): Promise<number> {
  const entry = await adminGroupListEntry(page, groupName);
  const count = Number(entry?.count ?? NaN);
  return Number.isFinite(count) ? count : -1;
}

async function adminGroupContainsUser(page: Page, groupName: string, userAcl: string): Promise<boolean> {
  const entry = await adminGroupListEntry(page, groupName, true);
  const children = Array.isArray(entry?.children) ? entry.children : [];
  return children.some((child) => stringValue((child as Record<string, unknown>)['~c8oAcl']) === userAcl);
}

async function adminGroupListEntry(page: Page, groupName: string, includeChildren = false): Promise<Record<string, unknown> | null> {
  const response = await c8oCall(page, 'admin_users_get_by_group_v2', includeChildren ? { targetGroup: groupName } : {});
  const values = adminResultValues(response);
  return values.find((entry) => stringValue(entry.value) === groupName) ?? null;
}

async function deleteTemporaryAdminGroup(page: Page, groupName: string): Promise<void> {
  await c8oCall(page, 'admin_groups_delete', {
    meta: JSON.stringify({ group: groupName }),
  }).catch(() => undefined);
  await c8oCall(page, 'admin_group_delete', {
    _use_doc_id: groupName,
  }).catch(() => undefined);
}

function groupNames(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((entry) => groupNames(entry));
  }
  if (!value || typeof value !== 'object') {
    return [];
  }
  const record = value as Record<string, unknown>;
  const ownGroup = typeof record.group === 'string' ? [record.group] : groupNames(record.group);
  return [...ownGroup, ...Object.entries(record).flatMap(([key, entry]) => (key === 'group' ? [] : groupNames(entry)))];
}

function adminGroupRecord(value: unknown, groupName: string): Record<string, unknown> | null {
  if (Array.isArray(value)) {
    for (const entry of value) {
      const match = adminGroupRecord(entry, groupName);
      if (match) {
        return match;
      }
    }
    return null;
  }
  if (!value || typeof value !== 'object') {
    return null;
  }
  const record = value as Record<string, unknown>;
  if (record._id === groupName) {
    return record;
  }
  if (record.group === true && Object.prototype.hasOwnProperty.call(record, 'editing_rights')) {
    return record;
  }
  for (const entry of Object.values(record)) {
    const match = adminGroupRecord(entry, groupName);
    if (match) {
      return match;
    }
  }
  return null;
}

function settingsResult(response: Record<string, unknown>): Record<string, unknown> {
  const document = response.document as Record<string, unknown> | undefined;
  return ((response.res as Record<string, unknown> | undefined) ?? (document?.res as Record<string, unknown> | undefined) ?? {});
}

function adminResultValues(response: Record<string, unknown>): Record<string, unknown>[] {
  const document = response.document as Record<string, unknown> | undefined;
  const result = (response.result as Record<string, unknown> | undefined) ?? (document?.result as Record<string, unknown> | undefined);
  const values = result?.values;
  return Array.isArray(values) ? (values as Record<string, unknown>[]) : [];
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export async function verifyAdminUsersAndGroupsManagementSurfacesThroughUi(page: Page): Promise<void> {
  await test.step('Open the Admin dashboard home', async () => {
    await page.goto('./admin/dashboard', { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await expect(page.locator(ADMIN_SEL.homePage).first(), 'Admin dashboard home should be visible').toBeVisible({
      timeout: 60_000,
    });
    await expect(page.locator(SEL.loginPageRoot), 'Admin dashboard should not redirect to login').toHaveCount(0, {
      timeout: 5_000,
    });
  });

  await test.step('Open the Admin Users management page', async () => {
    await page.goto('./admin/dashboard-user', { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await expect(page.locator(ADMIN_SEL.usersPage).first(), 'Admin Users page should be visible').toBeVisible({
      timeout: 60_000,
    });
    await expect(page.locator(ADMIN_SEL.usersPage).locator(ADMIN_SEL.gridSurface).first(), 'Admin Users grid should render').toBeVisible({
      timeout: 60_000,
    });
    await expect(page.locator(ADMIN_SEL.addUserButton).first(), 'Admin Users page should expose toolbar actions').toBeVisible({
      timeout: 30_000,
    });
  });

  await test.step('Open the Admin Groups management page', async () => {
    await page.goto('./admin/dashboard-groups', { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await expect(page.locator(ADMIN_SEL.groupsPage).first(), 'Admin Groups page should be visible').toBeVisible({
      timeout: 60_000,
    });
    await expect(page.locator(ADMIN_SEL.groupsPage).locator(ADMIN_SEL.gridSurface).first(), 'Admin Groups grid should render').toBeVisible({
      timeout: 60_000,
    });
    await expect(page.locator(ADMIN_SEL.addGroupButton).first(), 'Admin Groups page should expose toolbar actions').toBeVisible({
      timeout: 30_000,
    });
  });
}
