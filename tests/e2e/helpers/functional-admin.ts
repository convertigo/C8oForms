import { expect, test, type Locator, type Page } from '@playwright/test';
import { SEL, c8oCall, gotoWithTransientRetry, login } from './studio';
import { functionalAdminUserCredentials } from './functional-studio';
import { ensureFunctionalUserIfPossible } from './functional-users';

const ADMIN_SEL = {
  homePage: 'page-admindashboardhome',
  usersPage: 'page-admindashboardusers',
  groupsPage: 'page-admindashboarduserswithingroups',
  gridSurface: '.ag-root:visible, lib-extendedcomponents-ui-ngx-aggrid:visible',
  addUserButton: 'page-admindashboardusers ion-button:visible',
  addUserCreateButton: 'page-admindashboardusers ion-button.class1770913408988, page-admindashboardusers ion-button.class1758560034313',
  addUserModal: 'ion-modal.show-modal c8oforms-adduserform, ion-modal:visible c8oforms-adduserform',
  addUserNameInput: 'ion-input.class1758735188803 input',
  addUserSurnameInput: 'ion-input.class1758735188845 input',
  addUserEmailInput: 'ion-input.class1758735188890 input',
  addUserSubmitButton: 'ion-button.class1758735188998',
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
  // adminDashboardUsersWithinGroups.html:308 - the Groups panel's own search box,
  // wired through (ionChange) to agGrid.api.setQuickFilter.
  groupsQuickFilter: 'page-admindashboarduserswithingroups ion-input.class1759575794337',
  usersSearch: 'page-admindashboardusers ion-input.class1758557718475',
  groupedUsersQuickFilter: 'page-admindashboarduserswithingroups ion-input.class1759746664380',
  groupedUsersGrid: 'page-admindashboarduserswithingroups .class1759334322293',
} as const;

const UNKNOWN_USER_LABEL = /Unknown user|Utilisateur inconnu|Usuario desconocido|Utente sconosciuto/i;

export async function loginAsAdminWithUsernamePassword(page: Page): Promise<void> {
  await test.step('Log in with the configured admin-capable Studio user', async () => {
    const credentials = functionalAdminUserCredentials();
    if (!credentials) {
      throw new Error(
        'Set C8OFORMS_FUNCTIONAL_ADMIN_USER/PASSWORD, or CONVERTIGO_ADMIN_PASSWORD to provision an Admin UI user',
      );
    }
    await ensureFunctionalUserIfPossible(credentials, { admin: true });
    await login(page, credentials);
  });
}

/**
 * Create a group whose name contains C8O, prove that it persisted, then prove
 * that the Admin Groups UI did not filter it out. The temporary group is always
 * removed after the assertion.
 */
export async function verifyAdminGroupContainingC8OCanBeCreatedAndListedThroughUi(page: Page): Promise<void> {
  const groupName = `Issue1119-C8O-${Date.now()}`;
  try {
    await openAdminGroupsPage(page);
    await createAdminGroupThroughUi(page, groupName);

    await test.step('Verify the C8O-named group persists and remains visible in the Admin Groups list', async () => {
      await expect
        .poll(() => adminGroupRightEnabled(page, groupName, 'editing_rights'), {
          message: `admin group ${groupName} should persist its UI-selected editing permission after creation`,
          timeout: 60_000,
        })
        .toBe(true);
      await expect
        .poll(() => visibleAdminGroupNameInPage(page, groupName), {
          message: `admin group ${groupName} should not be filtered out of the Admin Groups UI`,
          timeout: 60_000,
        })
        .toBe(true);
    });
  } finally {
    await deleteTemporaryAdminGroup(page, groupName).catch(() => undefined);
  }
}

/**
 * Guard the #1120 contract on the current Admin Groups implementation. Group
 * creation deliberately seeds the authenticated administrator as its first
 * member, so the useful invariant is a coherent 1 -> 2 counter transition and
 * the presence of both the creator and the user added through the modal.
 */
export async function verifyAdminGroupMembershipCountThroughUi(page: Page): Promise<void> {
  const groupName = `${ADMIN_GROUP_PREFIX}${Date.now()}`;
  let currentUserAcl = '';
  let addedUserAcl = '';
  let addedUserLabel = '';

  try {
    await test.step('Remove temporary groups left behind by earlier interrupted runs', async () => {
      await deleteStaleAdminGroups(page);
    });

    await openAdminGroupsPage(page);
    await createAdminGroupThroughUi(page, groupName);

    await test.step('Verify the new group has one coherent creator membership', async () => {
      const currentUser = await currentAdminUser(page);
      currentUserAcl = currentUser.acl;
      expect(currentUserAcl, 'current admin user should expose a FullSync ACL id').not.toBe('');

      await expect
        .poll(() => adminGroupMemberCount(page, groupName), {
          message: `new admin group ${groupName} should initially count its creator`,
          timeout: 60_000,
        })
        .toBe(1);
      await expect
        .poll(() => adminGroupContainsUser(page, groupName, currentUserAcl), {
          message: `new admin group ${groupName} should contain its creator`,
          timeout: 60_000,
        })
        .toBe(true);
      await expect
        .poll(() => visibleAdminGroupNameWithMemberCount(page, groupName, 1), {
          message: `Admin Groups UI should show one member for newly created group ${groupName}`,
          timeout: 60_000,
        })
        .toBe(true);
    });

    await test.step('Add a different user and verify the membership count changes from one to two', async () => {
      const user = await firstAdminUserOutsideGroup(page, groupName, currentUserAcl);
      addedUserAcl = user.acl;
      addedUserLabel = user.label;

      await addUserToAdminGroupThroughModal(page, groupName, addedUserLabel);
      await expect
        .poll(() => adminGroupMemberCount(page, groupName), {
          message: `admin group ${groupName} should count its creator and the newly added user`,
          timeout: 60_000,
        })
        .toBe(2);
      await expect
        .poll(() => adminGroupContainsUser(page, groupName, currentUserAcl), {
          message: `admin group ${groupName} should keep its creator after adding another user`,
          timeout: 60_000,
        })
        .toBe(true);
      await expect
        .poll(() => adminGroupContainsUser(page, groupName, addedUserAcl), {
          message: `admin group ${groupName} should contain the user added through the modal`,
          timeout: 60_000,
        })
        .toBe(true);
    });

    await test.step('Verify the Admin Groups UI shows two members and the added user', async () => {
      await gotoWithTransientRetry(page, './admin/dashboard-groups');
      await expect(page.locator(ADMIN_SEL.groupsPage).first(), 'Admin Groups page should be visible after membership update').toBeVisible({
        timeout: 60_000,
      });
      await expect
        .poll(() => visibleAdminGroupNameWithMemberCount(page, groupName, 2), {
          message: `Admin Groups UI should show two members for ${groupName}`,
          timeout: 60_000,
        })
        .toBe(true);
      await expect
        .poll(() => adminGroupContainsVisibleUserAfterSelection(page, groupName, addedUserLabel), {
          message: `Admin Groups UI should show the user added to ${groupName}`,
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

/**
 * Exercise the bulk relation behind #1165 from the Admin Groups screen: two
 * users are selected in the UI, then the Add to group modal assigns both to two
 * independently created groups in one operation.
 */
export async function verifyMultipleUsersCanBeAddedToMultipleAdminGroupsThroughUi(page: Page): Promise<void> {
  const createdAt = Date.now();
  const groupNames = [`${ADMIN_GROUP_PREFIX}${createdAt}`, `${ADMIN_GROUP_PREFIX}${createdAt + 1}`];
  let userAcls: string[] = [];

  try {
    await test.step('Remove temporary groups left behind by earlier interrupted runs', async () => {
      await deleteStaleAdminGroups(page);
    });

    await openAdminGroupsPage(page);
    for (const groupName of groupNames) {
      await createAdminGroupThroughUi(page, groupName);
    }

    const currentUser = await currentAdminUser(page);
    expect(currentUser.acl, 'current admin user should expose a FullSync ACL id').not.toBe('');
    const users = await firstAdminUsersOutsideGroups(page, groupNames, currentUser.acl, 2);
    userAcls = users.map((user) => user.acl);

    await test.step('Select two users and add them to both temporary groups through the bulk modal', async () => {
      for (const user of users) {
        await selectVisibleAdminUser(page, user.label);
      }

      const actionsButton = page.locator(ADMIN_SEL.userActionsButton).filter({ visible: true }).last();
      await expect(actionsButton, 'Admin Groups page should expose user actions after selecting users').toBeVisible({
        timeout: 30_000,
      });
      await actionsButton.click({ timeout: 10_000 }).catch(async () => actionsButton.dispatchEvent('click'));

      const popover = page.locator(ADMIN_SEL.userActionsPopover).last();
      await expect(popover, 'Admin Groups user actions popover should open').toBeVisible({ timeout: 15_000 });
      const openButton = popover.locator(ADMIN_SEL.addUserToGroupToolbarButton).filter({ visible: true }).first();
      await expect(openButton, 'User actions should expose Add to group for the bulk selection').toBeVisible({
        timeout: 30_000,
      });
      await openButton.click({ timeout: 10_000 }).catch(async () => openButton.dispatchEvent('click'));

      const modal = page.locator(ADMIN_SEL.addUserToGroupModal).last();
      await expect(modal, 'Add user to group modal should open for the selected users').toBeVisible({ timeout: 30_000 });
      for (const groupName of groupNames) {
        await selectGroupInAddUserToGroupModal(modal, groupName);
      }

      const submit = modal.locator(ADMIN_SEL.addUserToGroupSubmitButton).filter({ visible: true }).last();
      await expect(submit, 'Bulk Add to group submit button should be enabled').toBeEnabled({ timeout: 15_000 });
      await submit.click({ timeout: 10_000 }).catch(async () => submit.dispatchEvent('click'));
      await expect(modal, 'Bulk Add to group modal should close after submit').toBeHidden({ timeout: 60_000 });
    });

    await test.step('Verify both selected users belong to both selected groups', async () => {
      for (const groupName of groupNames) {
        await expect
          .poll(() => adminGroupMemberCount(page, groupName), {
            message: `${groupName} should contain its creator plus both bulk-selected users`,
            timeout: 60_000,
          })
          .toBe(3);
        for (const userAcl of userAcls) {
          await expect
            .poll(() => adminGroupContainsUser(page, groupName, userAcl), {
              message: `${groupName} should contain bulk-selected user ${userAcl}`,
              timeout: 60_000,
            })
            .toBe(true);
        }
        await expect
          .poll(() => visibleAdminGroupNameWithMemberCount(page, groupName, 3), {
            message: `Admin Groups UI should render three members for ${groupName}`,
            timeout: 60_000,
          })
          .toBe(true);
      }
    });
  } finally {
    const usersToRemove = [...new Set(userAcls)];
    if (usersToRemove.length > 0) {
      await removeUsersFromAdminGroups(page, groupNames, usersToRemove).catch(() => undefined);
    }
    for (const groupName of groupNames) {
      await deleteTemporaryAdminGroup(page, groupName).catch(() => undefined);
    }
  }
}

export async function verifyAdminGroupCanBeCreatedAndCleanedThroughUi(page: Page): Promise<void> {
  const groupName = `${ADMIN_GROUP_PREFIX}${Date.now()}`;
  let currentUserAcl = '';
  let addedUserAcl = '';
  let addedUserLabel = '';
  let expectedMemberCount = 1;
  try {
    await test.step('Remove temporary groups left behind by earlier interrupted runs', async () => {
      await deleteStaleAdminGroups(page);
    });

    await openAdminGroupsPage(page);
    await createAdminGroupThroughUi(page, groupName, { verifyUncheckedPermissions: true });

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
      await gotoWithTransientRetry(page, './admin/dashboard-groups');
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

/**
 * Regression contract for #1311. Create a Forms-provider user through the Admin
 * modal, prove that the persisted displayName and both rendered Admin surfaces
 * retain the complete first/surname identity, then remove the temporary user.
 */
export async function verifyManualAdminUserFullNameThroughUi(page: Page): Promise<void> {
  const suffix = Date.now();
  const firstName = `Functional${suffix}`;
  const surname = 'Identity';
  const fullName = `${firstName} ${surname}`;
  const email = `functional-admin-identity-${suffix}@example.test`;

  try {
    await openAdminUsersPage(page);

    await test.step(`Create temporary Admin user ${email} through the UI`, async () => {
      const addUserButton = page.locator(ADMIN_SEL.addUserCreateButton).filter({ visible: true }).first();
      await expect(addUserButton, 'Admin Users page should expose the New user action').toBeVisible({ timeout: 30_000 });
      await addUserButton.click({ timeout: 10_000 }).catch(async () => addUserButton.dispatchEvent('click'));

      const modal = page.locator(ADMIN_SEL.addUserModal).last();
      await expect(modal, 'Add user modal should open').toBeVisible({ timeout: 30_000 });

      // #1310 was fixed on this sibling permission list as well as Add group.
      await expectUncheckedAdminPermissionCheckboxesVisible(modal, 'Add user');

      await fillNativeInput(modal.locator(ADMIN_SEL.addUserNameInput).first(), firstName, 'first name');
      await fillNativeInput(modal.locator(ADMIN_SEL.addUserSurnameInput).first(), surname, 'surname');
      await fillNativeInput(modal.locator(ADMIN_SEL.addUserEmailInput).first(), email, 'email');

      const submit = modal.locator(ADMIN_SEL.addUserSubmitButton).last();
      await expect(submit, 'Add user modal should enable its submit action after required fields are filled').toBeEnabled({
        timeout: 15_000,
      });
      await submit.click({ timeout: 10_000 }).catch(async () => submit.dispatchEvent('click'));
      await expect(modal, 'Add user modal should close after successful creation').toBeHidden({ timeout: 60_000 });
    });

    await test.step('Verify the manually created identity persisted with its complete display name', async () => {
      await expect
        .poll(async () => stringValue((await adminUserDocument(page, email))?.displayName), {
          message: `temporary Admin user ${email} should persist displayName=${fullName}`,
          timeout: 60_000,
        })
        .toBe(fullName);
    });

    await test.step('Verify the Users dashboard renders the full name and No Code Studio provider', async () => {
      await applyIonInputFilter(page.locator(ADMIN_SEL.usersSearch).filter({ visible: true }).first(), email);
      const row = page.locator(`${ADMIN_SEL.usersPage} [role="row"]`).filter({ hasText: email }).first();
      await expect(row, `Admin Users grid should render temporary user ${email}`).toBeVisible({ timeout: 60_000 });
      await expect(row.getByText(fullName, { exact: true }), 'Admin Users grid should render the exact complete name').toBeVisible();
      await expect(row.getByText('No Code Studio', { exact: true }), 'Forms-provider users should be identified as No Code Studio').toBeVisible();
      await expect(row.getByText(UNKNOWN_USER_LABEL), 'Manually created user should not be rendered as an unknown user').toHaveCount(0);
    });

    await test.step('Verify the Groups dashboard renders the same complete user name', async () => {
      await openAdminGroupsPage(page);
      await applyIonInputFilter(page.locator(ADMIN_SEL.groupedUsersQuickFilter).filter({ visible: true }).first(), email);
      const visibleRows = page.locator(`${ADMIN_SEL.groupedUsersGrid} [role="row"]`).filter({ visible: true });
      const row = visibleRows.filter({ hasText: fullName }).first();
      await expect(row, `Admin Groups users grid should render temporary user ${email}`).toBeVisible({ timeout: 60_000 });
      await expect(row.getByText(fullName, { exact: true }), 'Admin Groups users grid should render the exact complete name').toBeVisible();
      await expect(visibleRows.getByText(UNKNOWN_USER_LABEL), 'Admin Groups should not lose a manually created user name').toHaveCount(0);
    });
  } finally {
    await deleteTemporaryAdminUser(page, email).catch(() => undefined);
  }
}

async function openAdminGroupsPage(page: Page): Promise<void> {
  await test.step('Open the Admin Groups management page', async () => {
    await gotoWithTransientRetry(page, './admin/dashboard-groups');
    const groupsPage = page.locator(ADMIN_SEL.groupsPage).first();
    await expect(groupsPage, 'Admin Groups page should be visible').toBeVisible({ timeout: 60_000 });
    await expect(groupsPage.locator(ADMIN_SEL.gridSurface).first(), 'Admin Groups grid should render').toBeVisible({
      timeout: 60_000,
    });
  });
}

async function openAdminUsersPage(page: Page): Promise<void> {
  await test.step('Open the Admin Users management page', async () => {
    await gotoWithTransientRetry(page, './admin/dashboard-user');
    const usersPage = page.locator(ADMIN_SEL.usersPage).first();
    await expect(usersPage, 'Admin Users page should be visible').toBeVisible({ timeout: 60_000 });
    await expect(usersPage.locator(ADMIN_SEL.gridSurface).first(), 'Admin Users grid should render').toBeVisible({
      timeout: 60_000,
    });
  });
}

async function createAdminGroupThroughUi(
  page: Page,
  groupName: string,
  options: { verifyUncheckedPermissions?: boolean } = {},
): Promise<void> {
  await test.step(`Create admin group ${groupName} through the UI`, async () => {
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
        name: /Application editing|Editing rights|Édition des applications|Edición de aplicaciones|Modifica delle applicazioni|editing_rights/i,
      })
      .first();
    await expect(editingRights, 'Add group modal should expose the Application editing permission').toBeVisible({
      timeout: 15_000,
    });
    if (options.verifyUncheckedPermissions) {
      await expectUncheckedAdminPermissionCheckboxesVisible(modal, 'Add group');
    }
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
}

async function expectUncheckedAdminPermissionCheckboxesVisible(modal: Locator, context: string): Promise<void> {
  const permissions = modal.locator('ion-checkbox.form-checkbox--small').filter({ visible: true });
  await expect(permissions.first(), `${context} modal should expose permission checkboxes`).toBeVisible({ timeout: 15_000 });

  const unchecked: Locator[] = [];
  for (let index = 0; index < (await permissions.count()); index += 1) {
    const permission = permissions.nth(index);
    if (!(await ionCheckboxChecked(permission))) {
      unchecked.push(permission);
    }
  }
  expect(unchecked.length, `${context} modal should expose at least one unchecked permission`).toBeGreaterThan(0);

  for (const permission of unchecked) {
    await expect(permission, `${context} unchecked permission host should remain visible`).toBeVisible();
    const visual = await permission.evaluate((element) => {
      const host = element as HTMLElement;
      const container = host.shadowRoot?.querySelector<HTMLElement>('[part~="container"], .checkbox-icon') ?? null;
      if (!container) {
        return { width: 0, height: 0, opacity: 0, visibleOutline: false };
      }
      const box = container.getBoundingClientRect();
      const style = getComputedStyle(container);
      const borderWidth = Math.max(
        Number.parseFloat(style.borderTopWidth) || 0,
        Number.parseFloat(style.borderRightWidth) || 0,
        Number.parseFloat(style.borderBottomWidth) || 0,
        Number.parseFloat(style.borderLeftWidth) || 0,
      );
      const borderColor = style.borderColor.replace(/\s/g, '').toLowerCase();
      const transparentBorder = borderColor === 'transparent' || /rgba\([^)]*,0(?:\.0+)?\)/.test(borderColor);
      const visibleOutline = (borderWidth >= 1 && !transparentBorder) || (style.boxShadow !== 'none' && style.boxShadow.includes('inset'));
      return {
        width: box.width,
        height: box.height,
        opacity: Number.parseFloat(style.opacity || '1'),
        visibleOutline,
      };
    });
    expect(visual.width, `${context} unchecked checkbox should retain a rendered width`).toBeGreaterThanOrEqual(12);
    expect(visual.height, `${context} unchecked checkbox should retain a rendered height`).toBeGreaterThanOrEqual(12);
    expect(visual.opacity, `${context} unchecked checkbox should not be transparent`).toBeGreaterThan(0);
    expect(visual.visibleOutline, `${context} unchecked checkbox should expose a visible border or inset outline`).toBe(true);
  }
}

async function fillNativeInput(input: Locator, value: string, label: string): Promise<void> {
  await expect(input, `Add user modal should expose the ${label} input`).toBeVisible({ timeout: 15_000 });
  await input.fill(value);
  await input.blur();
  await expect(input, `Add user ${label} should retain its value`).toHaveValue(value);
}

async function applyIonInputFilter(search: Locator, query: string): Promise<void> {
  await expect(search, 'Admin list should expose its search input').toBeVisible({ timeout: 30_000 });
  await search.evaluate((element, value) => {
    const host = element as HTMLElement & { value?: string; shadowRoot?: ShadowRoot | null };
    const root = host.shadowRoot ?? host;
    const input = root.querySelector('input') as HTMLInputElement | null;
    host.value = value;
    if (input) {
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
      input.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    }
    host.dispatchEvent(new CustomEvent('ionInput', { bubbles: true, composed: true, detail: { value } }));
    host.dispatchEvent(new CustomEvent('ionChange', { bubbles: true, composed: true, detail: { value } }));
  }, query);
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

async function firstAdminUsersOutsideGroups(
  page: Page,
  groupNames: string[],
  currentUserAcl: string,
  count: number,
): Promise<{ acl: string; label: string }[]> {
  const allUsers = await adminGroupChildren(page, 'all_users');
  const currentMembers = new Set<string>();
  for (const groupName of groupNames) {
    for (const entry of await adminGroupChildren(page, groupName)) {
      currentMembers.add(stringValue(entry['~c8oAcl']));
    }
  }

  const seenLabels = new Set<string>();
  const candidates = allUsers
    .map((entry) => ({ acl: stringValue(entry['~c8oAcl']), label: adminUserLabel(entry) }))
    .filter((entry) => {
      if (!entry.acl || entry.acl === currentUserAcl || currentMembers.has(entry.acl) || !entry.label || seenLabels.has(entry.label)) {
        return false;
      }
      seenLabels.add(entry.label);
      return true;
    })
    .slice(0, count);

  expect(candidates.length, `Admin Groups test needs ${count} visible users outside ${groupNames.join(', ')}`).toBe(count);
  return candidates;
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
  await applyAdminGroupsQuickFilter(page, groupName);
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

// The Admin Groups ag-grid renders only the rows inside its virtualisation band (15 of 194
// rows on the shared CI server). domLayout 'autoHeight' does NOT disable that: ag-grid 31.3.4
// only bypasses virtualisation for printLayout or suppressRowVirtualisation. A freshly created
// group collates past the band, so it is absent from the DOM even though the listing has been
// refreshed and its rowData does contain it. Drive the page's own group search box first,
// exactly as a user would, then walk the DOM.
async function applyAdminGroupsQuickFilter(page: Page, query: string): Promise<void> {
  const search = page.locator(ADMIN_SEL.groupsQuickFilter).first();
  if ((await search.count()) === 0) {
    return;
  }
  await search.evaluate((element, value) => {
    const host = element as HTMLElement & { value?: string; shadowRoot?: ShadowRoot | null };
    const root = host.shadowRoot ?? host;
    const input = root.querySelector('input') as HTMLInputElement | null;
    host.value = value;
    if (input) {
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
      input.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    }
    host.dispatchEvent(new CustomEvent('ionInput', { bubbles: true, composed: true, detail: { value } }));
    host.dispatchEvent(new CustomEvent('ionChange', { bubbles: true, composed: true, detail: { value } }));
  }, query);
  await page.waitForTimeout(300);
}

async function visibleAdminGroupNameInPage(page: Page, groupName: string): Promise<boolean> {
  await applyAdminGroupsQuickFilter(page, groupName);
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
  await applyAdminGroupsQuickFilter(page, groupName);
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

// This test names its group functional_admin_group_<Date.now()> and deletes it in `finally`.
// When the test dies on its timeout, Playwright abandons the test body and closes the
// browser context, so that cleanup never runs (or its page.request calls fail and are
// swallowed) and the group is left on the server.
// The Add-user-to-group modal (myaggrid4) has no search box and renders ~14 rows, in CouchDB
// view-key order: C8O_TEST, DSI, functional_admin_group_*, functional_group_member_*,
// functional_share_group_*, RH. On 2026-09-21 the server listed 200 groups, 13 of them stale
// functional_admin_group_* leftovers that sorted AHEAD of the new group and filled the band.
// Swept, the new group is the 3rd row. The ~185 functional_group_member_/functional_share_group_
// leftovers (leaked the same way by functional-publication-sharing.ts) sort after this prefix
// and do not affect this test. So this relies on fewer than ~10 groups sorting before
// 'functional_admin_group_'.
// Only groups this test created, and only those older than STALE_ADMIN_GROUP_AGE_MS, are
// removed, so a run in flight in another job is never touched.
const ADMIN_GROUP_PREFIX = 'functional_admin_group_';
const STALE_ADMIN_GROUP_AGE_MS = 30 * 60_000;
const STALE_ADMIN_GROUP_SWEEP_BUDGET_MS = 90_000;
const STALE_ADMIN_GROUP_SWEEP_CONCURRENCY = 8;

async function deleteStaleAdminGroups(page: Page): Promise<void> {
  const response = await c8oCall(page, 'admin_groups_get', {});
  const now = Date.now();
  const stale = [...new Set(groupNames(response))].filter((name) => {
    if (!name.startsWith(ADMIN_GROUP_PREFIX)) {
      return false;
    }
    const createdAt = Number(name.slice(ADMIN_GROUP_PREFIX.length));
    return Number.isFinite(createdAt) && createdAt > 0 && now - createdAt > STALE_ADMIN_GROUP_AGE_MS;
  });

  // Bounded so a large backlog or a slow server cannot eat the test budget: each batch races
  // the time left (its deletes swallow their own errors, so one that loses the race finishes
  // harmlessly in the background). Leftovers are collected by the next run; the steady state
  // is zero or one stale group.
  const deadline = Date.now() + STALE_ADMIN_GROUP_SWEEP_BUDGET_MS;
  for (let start = 0; start < stale.length; start += STALE_ADMIN_GROUP_SWEEP_CONCURRENCY) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) {
      break;
    }
    const batch = stale.slice(start, start + STALE_ADMIN_GROUP_SWEEP_CONCURRENCY);
    await Promise.race([Promise.all(batch.map((name) => deleteTemporaryAdminGroup(page, name))), page.waitForTimeout(remaining)]);
  }

  if (stale.length === 0) {
    return;
  }
  // deleteTemporaryAdminGroup swallows errors, so count what is really gone rather than what
  // was attempted: a sweep that silently failed would otherwise surface minutes later as a
  // misleading "Add user to group modal should list the temporary group".
  const staleNames = new Set(stale);
  const left = groupNames(await c8oCall(page, 'admin_groups_get', {}).catch(() => ({}))).filter((name) => staleNames.has(name));
  if (left.length > 0) {
    console.warn(
      `ADM-001 stale group sweep: ${stale.length - left.length}/${stale.length} removed, ${left.length} left for the next run: ${left.join(', ')}`,
    );
  }
}

async function deleteTemporaryAdminGroup(page: Page, groupName: string): Promise<void> {
  await c8oCall(page, 'admin_groups_delete', {
    meta: JSON.stringify({ group: groupName }),
  }).catch(() => undefined);
  await c8oCall(page, 'admin_group_delete', {
    _use_doc_id: groupName,
  }).catch(() => undefined);
}

async function adminUserDocument(page: Page, email: string): Promise<Record<string, unknown> | null> {
  const response = await c8oCall(page, 'admin_users_get', {
    search: email,
    limit: '10',
    skip: '0',
  }).catch(() => null);
  if (!response) {
    return null;
  }
  return adminResultValues(response).find((entry) => stringValue(entry.mail) === email || stringValue(entry['~c8oAcl']) === email) ?? null;
}

async function deleteTemporaryAdminUser(page: Page, email: string): Promise<void> {
  const user = await adminUserDocument(page, email);
  if (!user) {
    return;
  }
  const id = stringValue(user._id);
  const revision = stringValue(user._rev);
  if (!id || !revision) {
    return;
  }
  await c8oCall(page, 'admin_users_delete', {
    docs: JSON.stringify([{ _id: id, _rev: revision }]),
  });
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
    await gotoWithTransientRetry(page, './admin/dashboard');
    await expect(page.locator(ADMIN_SEL.homePage).first(), 'Admin dashboard home should be visible').toBeVisible({
      timeout: 60_000,
    });
    await expect(page.locator(SEL.loginPageRoot), 'Admin dashboard should not redirect to login').toHaveCount(0, {
      timeout: 5_000,
    });
  });

  await test.step('Open the Admin Users management page', async () => {
    await gotoWithTransientRetry(page, './admin/dashboard-user');
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
    await gotoWithTransientRetry(page, './admin/dashboard-groups');
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
