<#-- This FTL template helps generating the readme.md file of your project -->
<#-- see FTL language documentation : https://freemarker.apache.org/docs/index.html -->

<#-- GLOBALS -->
<#global lineBreak = settings.lineBreak />
<#global locale = "US" />
<#global dictionnary = {
		"installation":	{"US": "Installation"			, "FR": "Installation"},
		"branding.symbols": {"US": "Branding Symbols"		, "FR": "Symboles de personnalisation"},
		"administration": {"US": "Administration"		, "FR": "Administration"},
		"more.info": 	{"US": "For more technical informations"	, "FR": "Pour plus d'informations techniques"},
		"connectors": 	{"US": "Connectors"				, "FR": "Connecteurs"},
		"transactions": {"US": "Transactions"			, "FR": "Transactions"},
		"sequences": 	{"US": "Sequences"				, "FR": "Séquences"},
		"references": 	{"US": "References"				, "FR": "Références"},
		"urlmapper": 	{"US": "Rest Web Service"		, "FR": "Service Web REST"},
		"mappings": 	{"US": "Mappings"				, "FR": "Mappages"},
		"operations": 	{"US": "Operations"				, "FR": "Operations"},
		"parameters": 	{"US": "Parameters"				, "FR": "Paramètres"},
		"mobileapp": 	{"US": "Mobile Application"		, "FR": "Application Mobile"},
		"mobilelib": 	{"US": "Mobile Library"			, "FR": "Librairie Mobile"},
		"pages": 		{"US": "Pages"					, "FR": "Pages"},
		"actions": 		{"US": "Shared Actions"			, "FR": "Actions partagées"},
		"components": 	{"US": "Shared Components"		, "FR": "Composants partagés"},
		"variables": 	{"US": "variables"				, "FR": "variables"},
		"events": 		{"US": "events"					, "FR": "évènements"}
	}
/>
<#-- please modify the global show values as needed -->
<#global show = {
	"toc"			: true,
	"installation"	: true,
	"brandingSymbols" : true,
	"administration" : true,
	
	"connectors"	: true,
	"transactions"	: true,
	"sequences"		: true,
	
	"references"	: false,
	
	"urlmapper"		: true,
	"mappings"		: true,
	"operations"	: true,
	"parameters"	: true,
	
	"mobileapp"		: true,
	"pages"			: !project.name?starts_with("lib_"),
	"actions"		: true,
	"components"	: true,
	
	"variables"		: true,
	"events"		: true
	} 
/>

<#-- FUNCTIONS -->
<#-- on: returns the show flag for the given key -->
<#function on key>
  <#return show[key]?? && show[key]>
</#function>

<#-- on: test if given dbo has the given key with non empty size -->
<#function has dbo key>
  <#return dbo[key]?? && (dbo[key]?size > 0) >
</#function>

<#-- anchor: generates an anchor link for the given text -->
<#function anchor anchors text>
  <#assign a = ""+ text?lower_case?replace(" ", "-")?replace("/", "")>
  <#if anchors?seq_contains(a)>
  	<#assign f = anchors?filter(s -> s?matches(""+ a + "-(\\d+)"))>
  	<#assign a = ""+ a + "-" + (f?size+1)>
  </#if>
  <#assign anchors += [""+a]>
  <#return a>
</#function>

<#-- on: returns the dictionnary value for the given key -->
<#function help key>
  <#if has(dictionnary, key)>
    <#return dictionnary[key][locale]!key>
  </#if>
  <#return key>
</#function>

<#-- MACROS -->
<#-- header: generates a header with given text as heading and add it to TOC with its anchor link -->
<#macro header toc anchors heading text>
${heading} ${text}${lineBreak}
<#assign a = anchor(anchors, text)>
<#if (heading?keep_before_last("#")?length > 0)>
<#assign toc += "" + heading?keep_before_last("##")?replace("#","    ") + "-" + " ["+text+"](#"+ a +")" + lineBreak>
</#if>
</#macro>

<#-- comment: add given text -->
<#macro comment text>
<#if (text?length > 0) >
${text}${lineBreak}
</#if>
</#macro>

<#-- table: generates a table with given headers and rows -->
<#macro table title headers rows>
<#if (rows?size > 0)>
${title}${lineBreak}
<table
<tr>
<#list headers as header><th>${header}</th></#list>
</tr>
<#list rows as i>
<tr>
<#list headers as header><td>${i[header]}</td></#list>
</tr>
</#list>
</table>
</#if>
</#macro>

<#-- installation : add project installation instructions if any -->
<#macro installation>
<#if locale == "US">
1. In your Convertigo Studio use `File->Import->Convertigo->Convertigo Project` and hit the `Next` button
2. In the dialog `Project remote URL` field, paste the text below:
   <table>
     <tr><td>Usage</td><td>Click the copy button</td></tr>
     <tr><td>To contribute</td><td>${lineBreak}
     ```
     ${project.contributeUrl}
     ```
     </td></tr>
     <tr><td>To simply use</td><td>${lineBreak}
     ```
     ${project.usageUrl}
     ```
     </td></tr>
    </table>
3. Click the `Finish` button. This will automatically import the __${project.name}__ project
</#if>
<#if locale == "FR">
1. Dans votre Studio Convertigo, utilisez `File->Import->Convertigo->Convertigo Project` et appuyez sur le bouton `Next`
2. Dans le champ `Project remote URL` de la boîte de dialogue, collez le texte ci-dessous:
   <table>
     <tr><td>Usage</td><td>Cliquez sur le bouton de copie</td></tr>
     <tr><td>Pour contribuer</td><td>${lineBreak}
     ```
     ${lineBreak}${project.contributeUrl}
     ```
     </td></tr>
     <tr><td>Pour simplement utiliser</td><td>${lineBreak}
     ```
     ${lineBreak}${project.usageUrl}
     ```
     </td></tr>
    </table>
3. Cliquez sur le bouton `Finish`. Cela importera automatiquement le projet __${project.name}__
</#if>
${lineBreak}
</#macro>

<#-- brandingSymbols : add branding symbol documentation -->
<#macro brandingSymbols>
The project supports the following branding symbols for logo and login carousel customization.

| Symbol | Purpose | Expected value | Default / fallback behavior |
|---|---|---|---|
| `C8Oforms.legacy_logo` | Enables legacy header/logo branding mode. | Boolean-like value (`true` or `false`). | Defaults to `false`. When `false`, the standard no-code-studio logo is used. |
| `C8Oforms.customHeaderLogo` | Overrides branded header/logo image with a custom logo URL. | Non-empty string URL/path (for example `https://...` or `assets/...`). | If empty or missing, fallback uses `C8Oforms.legacy_logo` behavior. If defined, it has priority. |
| `C8Oforms.customCarouselImage` | Replaces default login carousel images. | JSON-stringified array of image URLs/paths, for example `["https://.../slide1.png","https://.../slide2.png"]`. | If empty/missing, the default login slides are used. |
| `C8Oforms.customCarouselImageObjectFit` | Controls CSS `object-fit` for login carousel images. | One of: `fill`, `contain`, `cover`, `none`, `scale-down`. | If invalid/missing, no override is applied and default styling is kept. |

### Notes

- For URL/path symbols (`customHeaderLogo`, `customCarouselImage`), use web-accessible paths only.
- Absolute URLs are recommended (`https://...`).
- Relative app paths are supported when served by the application (`assets/...`).
- Local filesystem paths (for example `/Users/...`) are not supported by the browser runtime.

### Example values

```properties
C8Oforms.legacy_logo=true
C8Oforms.customHeaderLogo=https://cdn.example.com/branding/header-logo.svg
C8Oforms.customCarouselImage=["https://cdn.example.com/branding/slide-1.png","https://cdn.example.com/branding/slide-2.png"]
C8Oforms.customCarouselImageObjectFit=cover
```

### Priority summary

1. `C8Oforms.customHeaderLogo` (if non-empty)
2. `C8Oforms.legacy_logo` behavior
3. Default project logo behavior

${lineBreak}
</#macro>

<#-- administration : add the administration space documentation (screenshots in docs/admin) -->
<#macro administration>
The administration space lets administrators supervise the No Code Studio: users and their permissions, groups, the data protection (GDPR) page, and usage statistics for applications and form responses.

The screenshots below come from version `2.2.0-beta349` (branch `NGX`) with demonstration data. Labels are shown in English, the French label is given in parentheses when it helps to find a menu entry.

- [Access to the administration](#access-to-the-administration)
- [Permissions](#permissions)
- [Dashboard](#dashboard)
- [User administration](#user-administration)
- [Group management](#group-management)
- [Data protection (GDPR)](#data-protection-gdpr)
- [Statistics: application mapping and tracking changes](#statistics-application-mapping-and-tracking-changes)
- [Help Center](#help-center)
- [Administrator features in the application list](#administrator-features-in-the-application-list)
- [Read-only administrators](#read-only-administrators)
- [Configuration (global symbols)](#configuration-global-symbols)
- [Notes and limitations](#notes-and-limitations)

### Access to the administration

There are two administrator levels:

| Level | What it allows |
|---|---|
| **Administration** | Full access: manage users, groups and permissions, edit the GDPR page, see and act on every application. |
| **Administration (read only)** (Administration (consultation)) | See all administration pages and statistics, without changing anything. |

A user is an administrator when the **Administration** permission is set on their own profile, or on one of the groups they belong to. The same rule applies to the read-only level.

When the user is an administrator, the side menu shows the **MANAGEMENT** (GESTION) section:

| Menu entry | Page | Route |
|---|---|---|
| Dashboard (Tableau de bord) | Administration home | `admin/dashboard` |
| Users (Utilisateurs) | User administration | `admin/dashboard-user` |
| Groups (Groupes) | Group management | `admin/dashboard-groups` |
| Data protection settings (Configuration RGPD) | GDPR page management | `admin/gdrp` |
| Settings (Paramètres) | Personal settings, shown to every user | |

The **SUPPORT** section, shown to every user, contains **Data protection rights**, the GDPR page that administrators edit.

![Dashboard](docs/admin/01-dashboard.png)

#### Making the first administrator

Once an administrator exists, other administrators are appointed from the [Users](#user-administration) or [Groups](#group-management) pages. On a new server, appoint the first one with a Convertigo server administrator account:

1. Sign in to the Convertigo administration console, `https://<server>/convertigo/admin/`, with a server administrator account.
2. In the same browser, open:

   ```
   https://<server>/convertigo/projects/C8Oforms/.json?__sequence=APIV2_setUserAdmin&id=<user login>
   ```

   `<user login>` is the user's login identifier, the e-mail address for No Code Studio accounts. The answer is `{"success": true}`.
3. The user sees the **MANAGEMENT** section the next time a page loads.

A server administrator session passes the server-side checks of the administration sequences, but it does not show the administration menu by itself: the user also needs the **Administration** permission.

### Permissions

Each user has six permissions. In lists, they appear as coloured dots; the **Permissions** button of the Users and Groups pages shows the legend.

| Permission (UI label) | Dot | What it allows | Default when not set on the user |
|---|---|---|---|
| Administration | red | Full access to all administration features. | off |
| Administration (read only) | purple | Read-only access to all administration features. | off |
| No-code editing (database access) | yellow | Create, edit and delete no-code databases, tables and data. | `C8Oforms.no_code_db_rights_default_enabled` (true) |
| Application editing | green | Create and edit applications. | `C8Oforms.editing_rights_default_enabled` (true) |
| Javascript editing | green | Edit advanced JavaScript formulas. | `C8Oforms.formulas_default_enabled` (true) |
| Application publishing | blue | Publish applications. | `C8Oforms.publication_default_rights` (true) |

![Permissions legend](docs/admin/07-users-permissions-legend.png)

Permissions are cumulative. A user's effective permissions combine:

- the permissions set on their own profile;
- the default value of the global symbol, for the four non-administration permissions when they are not set on the profile;
- the permissions of every group they belong to.

The Users page shows only the permissions set on the profile. The Groups page shows the effective permissions.

### Dashboard

**MANAGEMENT > Dashboard** opens the administration home ("Welcome to your no-code administration space").

| Element | Content | Click |
|---|---|---|
| **Users** card | Number of users. | Users page |
| **Published applications** card | Number of published applications. | Application mapping |
| **Form responses** card | Number of responses, from the editor and from published applications. | Tracking changes |
| **Groups** card | Number of groups that carry permissions; the line below gives the total number of groups. | Groups page |
| **Users** chart, "Authentication distribution" | Users by sign-in source: Active directory, Microsoft, No Code Studio, Google, LinkedIn. | Users page (arrow) |
| **Groups** chart, "Permission breakdown" | Groups by combination of editing, administration and no-code permissions. | Groups page (arrow) |
| **Form responses** chart, "Response distribution" | Responses sent from the editor preview ("Edit responses") versus from published applications ("Production responses"). | |
| **Applications** chart, "Application distribution" | Applications in edition versus published applications. | |
| **User roles guide** | Description of the roles: Admin, Admin (read-only), Publisher, Editor, NoCode Database, Advanced formula editing in JavaScript. It can be expanded; it is hidden on narrow screens. | |
| Quick actions | **User management**, **Group management**, **GDPR page management** (button **Manage**); **Application Mapping**, **Change Tracking** (button **View**). | Corresponding page |

### User administration

**MANAGEMENT > Users** ("User administration") lists every user of the No Code Studio.

![User administration](docs/admin/02-users.png)

- **Cards**: number of users, and number of users with the Administration permission on their profile ("Special permissions").
- **Search**: name, e-mail, language, source and permission names. Press Enter to search.
- **Filters**: by language (Français, English, Italiano, Español), by source (Microsoft, LDAP or Active Directory, Google, LinkedIn, No Code Studio, OpenID) and by permission. The round arrow button clears the search and the filters.
- **Grid**: user (initials, display name, first name), contact (e-mail, language, source badge), permissions (dots), and the **⋮** menu. Columns can be sorted; pages hold 100 users.

![User filters](docs/admin/08-users-filters.png)

#### Actions on one user

The **⋮** menu of a row offers:

| Action | Effect |
|---|---|
| **View profile** | Shows the name, language, source, e-mail and permissions of the user. |
| **Edit** | Changes the first name, last name and language. The e-mail address cannot be changed. |
| **Permissions** | Opens "Manage permissions": tick or untick each of the six permissions, then **Apply**. |
| **Delete** | Deletes the user's account and profile after confirmation. The user's applications are kept. |

![User menu](docs/admin/03-users-row-menu.png)

| View profile | Edit user | Manage permissions |
|---|---|---|
| ![View profile](docs/admin/04-user-profile.png) | ![Edit user](docs/admin/05-user-edit.png) | ![Manage permissions](docs/admin/06-user-permissions.png) |

#### Actions on several users

Tick users in the grid: the bar "*n* utilisateurs sélectionnés" appears with an **Actions** button. Each action asks for confirmation, then applies to all the selected users.

| Group | Actions |
|---|---|
| Permissions | Allow editing / Revoke editing; Grant / Revoke advanced formulas (JS) editing; Allow / Revoke no-code database access; Set as application publisher / Remove application publisher role |
| Special permissions | Set as administrator / Remove administrator; Set as administrator (read) / Remove as administrator (read) |
| | **Remove**: deletes the selected users |

| Actions menu | Confirmation |
|---|---|
| ![Bulk actions](docs/admin/09-users-bulk-actions.png) | ![Bulk confirmation](docs/admin/10-users-bulk-confirm.png) |

#### Creating a user

**New user** opens "Add a user": first name, last name, e-mail address, language and permissions. By default, No-code editing, Application editing and Javascript editing are ticked.

**Create user** creates a No Code Studio account (sign-in with e-mail and password). The user receives an e-mail to set their password, so the server must be able to send e-mails. An e-mail address can be used by one account only.

Users who sign in with Active Directory, LDAP, Microsoft, Google, LinkedIn or OpenID do not need to be created: they appear in the list after their first sign-in.

| Add a user | Delete confirmation |
|---|---|
| ![Add a user](docs/admin/11-user-new.png) | ![Delete a user](docs/admin/12-user-delete-confirm.png) |

### Group management

**MANAGEMENT > Groups** ("Group management") organises users into groups. A group gives its permissions to all its members.

![Group management](docs/admin/20-groups.png)

- **Cards**: total number of groups, groups with permissions (and their share), and number of distinct permission combinations.
- **Left panel**: the **All users** card, then the groups with their description (generated from their permissions), number of members and permission dots. A search field, a permission filter and, when groups are ticked, an **Actions** button (**Edit**, **Remove**) are above the list.
- **Right panel**: the members of the selected group, or all users when **All users** is selected. Cards show the effective permissions of each user. A search field, filters (language, source, permission) and, when users are ticked, an **Actions** button (**Add to a group**, **Remove from group**) are above the list.

Click a group to show its members. The **⋮** menu of a group offers **Edit** and **Delete**; the **⋮** menu of a member offers **View profile**, **Add to a group** and **Remove from group**.

| Members of a group | Actions on members |
|---|---|
| ![Group members](docs/admin/21-group-members.png) | ![Actions on members](docs/admin/27-group-members-actions.png) |

#### Creating and editing a group

**Create a group** asks for a name and the permissions of the group. Ticking **Administration** also ticks **Administration (read only)**; unticking the read-only permission also unticks Administration.

A group exists through its members: the administrator who creates it becomes its first member. Remove yourself from the group afterwards if needed.

**Edit** (from the **⋮** menu or the **Actions** button) renames the group or changes its permissions. When several groups are ticked, **Actions > Edit** changes their permissions together.

| Create a group | Edit a group |
|---|---|
| ![Create a group](docs/admin/22-group-create.png) | ![Edit a group](docs/admin/23-group-edit.png) |

#### Adding users to groups

**Add to a group** opens a dialog listing the selected users and the groups. Tick one or more groups, then choose:

- **Ajouter aux groupes** (add): the users join the groups and keep their current groups;
- **Déplacer vers les groupes** (move): the users leave the current group and join the selected groups. This option is available when the dialog is opened from a group.

Users inherit the permissions of their new groups.

| Add to a group | Move to another group |
|---|---|
| ![Add to a group](docs/admin/24-group-add-users.png) | ![Move users](docs/admin/25-group-move-users.png) |

#### Removing users and deleting groups

- **Remove from group** takes the selected users out of the group. When all members are removed, the group is deleted with its permissions.
- **Delete** (group **⋮** menu) or **Actions > Remove** deletes the selected groups and their permissions after confirmation. Their members keep their accounts and their other groups.
- **View profile** shows a member's details and effective permissions.

| Actions on groups | Member profile |
|---|---|
| ![Actions on groups](docs/admin/26-groups-actions.png) | ![Member profile](docs/admin/28-group-user-profile.png) |

### Data protection (GDPR)

**MANAGEMENT > Data protection settings** ("GDPR page management") edits the **Data protection rights** page that every user can open from the **SUPPORT** menu, and the GDPR reminders displayed as toasts.

The content is defined per language. Choose the language in **Language currently being edited** (French, English, Spanish, Italian or Simplified Chinese) before editing. **Preview** opens the resulting page; **Save** stores the configuration for all languages.

#### Sections tab

![GDPR sections](docs/admin/40-gdpr-sections.png)

- Each **section** has an icon, a title and a description. Colours alternate automatically.
- **Add GDPR section** adds a section in all languages or only in the language being edited.
- The trash icon deletes a section in all languages or only in the language being edited.
- The icon menu changes the section icon, in all languages or only in the language being edited.
- The **DPO contact section** holds a title, a description and the DPO e-mail address. On the public page, it shows a **Contact the DPO** button (e-mail) and a link to the CNIL.

| Icon choice | Messages Toast tab |
|---|---|
| ![Icon choice](docs/admin/41-gdpr-icon-picker.png) | ![GDPR toasts](docs/admin/42-gdpr-toasts.png) |

#### Messages Toast tab

- **Message for visitors (Viewers)**: displayed to users who open a published application, to inform them about the privacy policy.
- **Message for creators (Builders)**: displayed to application creators when they create an application, to remind them of their GDPR responsibilities.

#### Result and legacy configuration

The **Data protection rights** page shows the sections and the DPO contact of the user's language.

If the global symbol `C8Oforms.GDRP-MENU` (page content) or `C8Oforms.GDRP-TOAST` (toasts) is defined on the server, the corresponding part is locked and the page shows "Legacy configuration active". Delete the symbol in the Convertigo administration console, then reload the page to use the editor.

| Data protection rights page | Legacy configuration |
|---|---|
| ![Data protection rights](docs/admin/44-gdpr-public-page.png) | ![Legacy configuration](docs/admin/43-gdpr-legacy-locked.png) |

### Statistics: application mapping and tracking changes

The Dashboard's **Published applications** and **Form responses** cards, and its **Application Mapping** and **Change Tracking** quick actions, open two statistics pages.

Each statistics panel shows a chart and its data grid:

- the chart toolbar zooms, pans and downloads the chart as SVG, PNG or CSV;
- the download icon exports the grid as CSV;
- the expand icon shows the panel full page.

![Expanded panel](docs/admin/52-stats-chart-expanded.png)

#### Application mapping

"Overview of editors and application complexity".

- **Cards**: total published applications, active editors (users who published at least one application), complex applications (applications with more elements than the average).
- **Top application publishers**: number of published applications per user.
- **Number of answers per application**: responses per published application. **See details** opens the application details: name, version, link to the published application, creator, creation and last modification dates.
- **Most complex published applications**: number of elements per published application. A card counts its inner elements.
- **Number of apps per creator with more than 5 published versions**.

| Application mapping | Application details |
|---|---|
| ![Application mapping](docs/admin/50-stats-mapping.png) | ![Application details](docs/admin/51-stats-app-details.png) |

#### Tracking changes

"Analysis of creation trends and application evolution", with two tabs:

- **Applications**: applications created today (compared with yesterday), daily average over the last 30 days, cumulative total, peak day; charts **Daily Applications Count** and **Cumulative Applications per Day**.
- **Responses**: the same indicators for form responses; charts **Daily Answers Count** and **Cumulative Answers per Day**.

| Applications tab | Responses tab |
|---|---|
| ![Tracking applications](docs/admin/53-stats-tracking-apps.png) | ![Tracking responses](docs/admin/54-stats-tracking-responses.png) |

### Help Center

The **Help guide** button at the top of the Dashboard, Users, Groups and statistics pages opens the "Convertigo Help Center":

- **Permissions**: description of the six permissions, groups and default settings;
- **Examples**: how permissions combine across groups and settings;
- **Guide**: quick start and shortcuts to the administration pages.

The default settings listed there use other symbol names than the ones read by the application: see [Configuration](#configuration-global-symbols).

| Permissions tab | Examples tab |
|---|---|
| ![Help Center](docs/admin/60-help-center.png) | ![Help Center examples](docs/admin/61-help-center-examples.png) |

### Administrator features in the application list

Outside the MANAGEMENT section, a full administrator also has these features in the application list (**HOME > Edit**):

- the **All applications** quick filter shows the applications of every user;
- the **User** field of the advanced search ("Type the name or email of a user to search for their apps") shows the applications of one user;
- the **⋮** menu of any application offers all its actions (edit, publish, responses, CSV, access rights, delete), whoever owns it;
- the sharing dialog lists all groups.

| All applications | Search by user |
|---|---|
| ![All applications](docs/admin/70-apps-all-applications.png) | ![Search by user](docs/admin/71-apps-search-by-user.png) |

### Read-only administrators

A read-only administrator sees the MANAGEMENT section and can:

- read the Dashboard and the statistics pages, and download their CSV files;
- browse the Users and Groups pages, and view profiles;
- open the GDPR settings and preview the page.

On the Users and Groups pages, the search, filter and selection tools are hidden. The **New user**, **Create a group** and **⋮** buttons remain, but the server refuses every change and the page shows an error, such as "Unable to update user.". Saving the GDPR settings fails in the same way.

The **All applications** filter and the search by user show only the read-only administrator's own applications.

| Users page, read only | Change refused |
|---|---|
| ![Read-only users](docs/admin/80-readonly-users.png) | ![Change refused](docs/admin/81-readonly-write-refused.png) |

### Configuration (global symbols)

These Convertigo global symbols change the administration. Set them in the Convertigo administration console, **Symbols** page.

| Symbol | Default | Effect |
|---|---|---|
| `C8Oforms.editing_rights_default_enabled` | `true` | Default value of Application editing for users who do not have it set on their profile. |
| `C8Oforms.no_code_db_rights_default_enabled` | `true` | Default value of No-code editing (database access). |
| `C8Oforms.formulas_default_enabled` | `true` | Default value of Javascript editing. |
| `C8Oforms.publication_default_rights` | `true` | Default value of Application publishing. |
| `C8Oforms.useGenericLDAP` | `false` | `true` shows the source "LDAP" instead of "Active Directory". |
| `C8Oforms.share.showAllGroups` | `false` | `true` lists all groups in the sharing dialog for every user, not only for administrators. |
| `C8Oforms.GDRP-MENU`, `C8Oforms.GDRP-TOAST` | not defined | Legacy GDPR content. When defined, the GDPR editor is locked for that part. |

No symbol grants the administration permissions by default.

### Notes and limitations

- Some labels are not translated and stay in French in every language: "Actions rapides" on the Dashboard; "Utilisateur", "Administrateurs" and "utilisateurs sélectionnés" on the Users page; "membres" and "sélectionnés" on the Groups page; the options of the "Add to a group" dialog.
- The Help Center names the default settings `C8Oforms.publishing_rights_default_enabled`, `C8Oforms.advanced_formulas_default_enabled`, `C8Oforms.nocode_database_default_enabled`, `C8Oforms.admin_read_rights_default_enabled` and `C8Oforms.admin_write_rights_default_enabled`. The application reads the symbols listed in [Configuration](#configuration-global-symbols); the two administration symbols do not exist.
- Permission changes apply to a user at their next page load.
- Administrators cannot set a user's password: No Code Studio users set it from the e-mail sent at creation, or with "Password forgotten?" on the sign-in page.
- The user and group lists cannot be exported; CSV export is available on the statistics panels.
- The administration sequences (`admin_*`) check the administrator permissions on the server; the read sequences also accept read-only administrators.

${lineBreak}
</#macro>

<#-- DEFAULT PROJECT TEMPLATE -->

<#-- anchors variable for TOC : do not modify -->
<#assign anchors = [""]>
<#-- toc variable : do not modify -->
<#assign toc = "">

<#-- Please modify below templates as needed -->

<#-- intro variable : add project header and comment -->
<#assign intro>
	<@header toc=toc anchors=anchors heading="#" text=project.label />
	<@comment text=project.comment />

[![e2e tests](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/convertigo/C8oForms/badges/e2e-badge.json)](https://github.com/convertigo/C8oForms/actions/workflows/build_and_deploy.yml)

	<#-- you can add your text or own macro call here to add something -->
	<#--
	This is text i want to add after the project comment
	<@my_own_macro my_var='xxxx xxxxx xxxxx'>
	-->
## Introducing Convertigo No Code Studio ##

Form Builder is the "No Code" tool built on top of Convertigo Low Code platform technology.

Many Lines of Business verticals such a Manufacturing, Transports, Field maintenance, Mobile sales, Insurance, Automotive or Engineering rely on data forms.

Using Forms, Enterprises will be able to quickly recreate all these paper-based forms as digital formats and have their data directly synchronized to their existing business applications such as ERP, CRM, PLM and Databases

Even more, data entry can trigger complex actions and workflows in their back- end systems interfacing with some compulsory legacy applications running and managed by IT.

[Providing backend services to no-code Form Builder](https://www.convertigo.com/documentation/develop/programming-guide/creating-data-for-c8o-forms/)

[See more on convertigo.com](https://www.convertigo.com/no-code-form-application-builder/)

[Try convertigo on the cloud](https://c8ocloud.convertigo.net/convertigo/projects/C8oCloudSignup/DisplayObjects/mobile/index.html#/signup)

[Installing Convertigo Form Builder Standalone](https://www.convertigo.com/documentation/latest/operating-guide/using-c8o-forms-standalone/)
</#assign>

<#-- content variable : add project sub-beans header and comment -->
<#-- you can add your text or own macro call anywhere -->
<#assign content>
<#if on("installation") && (project.url?length > 0) && (project.url != project.name)>
	<@header toc=toc anchors=anchors heading="##" text=help("installation") />
	<@installation />
</#if>
<#if on("brandingSymbols")>
	<@header toc=toc anchors=anchors heading="##" text=help("branding.symbols") />
	<@brandingSymbols />
</#if>
<#if on("administration")>
	<@header toc=toc anchors=anchors heading="##" text=help("administration") />
	<@administration />
</#if>
<#if on("references") && has(project,"references")>
  	<@header toc=toc anchors=anchors heading="##" text=help("references") />
  	<#list project.references as reference>
    	<@header toc=toc anchors=anchors heading="###" text=reference.label />
    	<@comment text=reference.comment />
  	</#list>
</#if>
<#if on("sequences") && has(project,"sequences")>
  	<@header toc=toc anchors=anchors heading="##" text=help("sequences") />
  	<#list project.sequences as sequence>
    	<@header toc=toc anchors=anchors heading="###" text=sequence.label />
    	<@comment text=sequence.comment />
    	<#if on("variables") && has(sequence,"variables")>
      		<@table title="**"+help("variables")+"**" headers=["name","comment"] rows=sequence.variables />
    	</#if>
  </#list>
</#if>
<#if on("connectors") && has(project,"connectors")>
  	<@header toc=toc anchors=anchors heading="##" text=help("connectors") />
  	<#list project.connectors as connector>
    	<@header toc=toc anchors=anchors heading="###" text=connector.label />
    	<@comment text=connector.comment />
    	<#if on("transactions") && has(connector,"transactions")>
      		<@header toc=toc anchors=anchors heading="####" text=help("transactions") />
      		<#list connector.transactions as transaction>
        		<@header toc=toc anchors=anchors heading="#####" text=transaction.label />
        		<@comment text=transaction.comment />
        		<#if on("variables") && has(transaction,"variables")>
          			<@table title="**"+help("variables")+"**" headers=["name","comment"] rows=transaction.variables />
        		</#if>
      		</#list>
    	</#if>
  	</#list>
</#if>
<#if on("urlmapper") && has(project,"urlmapper")>
  	<@header toc=toc anchors=anchors heading="##" text=help("urlmapper") />
  	<@comment text=project.urlmapper.comment />
  	<#if on("mappings") && has(project.urlmapper,"mappings")>
	  	<@header toc=toc anchors=anchors heading="###" text=help("mappings") />
	  	<#list project.urlmapper.mappings as mapping>
	    	<@header toc=toc anchors=anchors heading="####" text=mapping.label />
	    	<@comment text=mapping.comment />
	    	<#if on("operations") && has(mapping,"operations")>
	      		<@header toc=toc anchors=anchors heading="#####" text=help("operations") />
	      		<#list mapping.operations as operation>
	        		<@header toc=toc anchors=anchors heading="######" text=operation.label />
	        		<@comment text=operation.comment />
	        		<#if on("parameters") && has(operation,"parameters")>
	          			<@table title="**"+help("parameters")+"**" headers=["name","comment"] rows=operation.parameters />
	        		</#if>
	      		</#list>
	    	</#if>
	  </#list>
	</#if>
</#if>
<#if on("mobileapp") && has(project,"mobileapp")>
	<#assign appname = (project.mobileapp.applicationName?length > 0)
			?string(project.mobileapp.applicationName, (project.name?starts_with("lib_"))?string(help("mobilelib"),help("mobileapp"))) />
  	<@header toc=toc anchors=anchors heading="##" text=appname />
  	<@comment text=project.mobileapp.comment />
  	<#if on("pages") && has(project.mobileapp,"pages")>
	  	<@header toc=toc anchors=anchors heading="###" text=help("pages") />
	  	<#list project.mobileapp.pages as page>
	    	<@header toc=toc anchors=anchors heading="####" text=page.label />
	    	<@comment text=page.comment />
 	  </#list>
	</#if>
  	<#if on("actions") && has(project.mobileapp,"actions")>
	  	<@header toc=toc anchors=anchors heading="###" text=help("actions") />
	  	<#list project.mobileapp.actions as action>
	    	<@header toc=toc anchors=anchors heading="####" text=action.label />
	    	<@comment text=action.comment />
    		<#if on("variables") && has(action,"variables")>
      			<@table title="**"+help("variables")+"**" headers=["name","comment"] rows=action.variables />
    		</#if>
	  </#list>
	</#if>
  	<#if on("components") && has(project.mobileapp,"components")>
	  	<@header toc=toc anchors=anchors heading="###" text=help("components") />
	  	<#list project.mobileapp.components as component>
	    	<@header toc=toc anchors=anchors heading="####" text=component.label />
	    	<@comment text=component.comment />
    		<#if on("variables") && has(component,"variables")>
      			<@table title="**"+help("variables")+"**" headers=["name","comment"] rows=component.variables />
    		</#if>
    		<#if on("events") && has(component,"events")>
      			<@table title="**"+help("events")+"**" headers=["name","comment"] rows=component.events />
    		</#if>
	  </#list>
	</#if>
</#if>
</#assign>


<#-- output project name and comment -->
${intro}
<#-- output project.md link -->
${help("more.info")} : [documentation](./project.md)

<#-- output table of content -->
<#if on("toc")>${toc}</#if>

<#-- output project content -->
${content}
