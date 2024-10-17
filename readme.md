


# C8Oforms

Convertigo No Code Studio

## Introducing Convertigo No Code Studio ##

Form Builder is the "No Code" tool built on top of Convertigo Low Code platform technology.

Many Lines of Business verticals such a Manufacturing, Transports, Field maintenance, Mobile sales, Insurance, Automotive or Engineering rely on data forms.

Using Forms, Enterprises will be able to quickly recreate all these paper-based forms as digital formats and have their data directly synchronized to their existing business applications such as ERP, CRM, PLM and Databases

Even more, data entry can trigger complex actions and workflows in their back- end systems interfacing with some compulsory legacy applications running and managed by IT.

[Providing backend services to no-code Form Builder](https://www.convertigo.com/documentation/develop/programming-guide/creating-data-for-c8o-forms/)

[See more on convertigo.com](https://www.convertigo.com/no-code-form-application-builder/)

[Try convertigo on the cloud](https://c8ocloud.convertigo.net/convertigo/projects/C8oCloudSignup/DisplayObjects/mobile/index.html#/signup)

[Installing Convertigo Form Builder Standalone](https://www.convertigo.com/documentation/latest/operating-guide/using-c8o-forms-standalone/)

For more technical informations : [documentation](./project.md)

- [Installation](#installation)
- [Connectors](#connectors)
    - [c8oforms_fs](#c8oforms_fs)
        - [Transactions](#transactions)
            - [DeleteDocument](#deletedocument)
            - [GetDocument](#getdocument)
            - [GetDocumentAttachment](#getdocumentattachment)
            - [GetDocumentAttachment1](#getdocumentattachment1)
            - [GetDocumentAttachmentB64](#getdocumentattachmentb64)
            - [GetDocumentRev](#getdocumentrev)
            - [GetServerInfo](#getserverinfo)
            - [GetServerInfo1](#getserverinfo1)
            - [GetUsersByACL](#getusersbyacl)
            - [GetView](#getview)
            - [GetViewAuth](#getviewauth)
            - [GetViewByKeys](#getviewbykeys)
            - [GetViewIncludeDocs](#getviewincludedocs)
            - [GetViewPublishedbyAcl](#getviewpublishedbyacl)
            - [HeadDocument](#headdocument)
            - [PostBulkDocuments_1](#postbulkdocuments_1)
            - [PostDocument](#postdocument)
            - [PostDocument_PWA](#postdocument_pwa)
            - [PostDocument_restore_deleted](#postdocument_restore_deleted)
            - [PostDocumentAddArgc8o_view_type_pwa_document](#postdocumentaddargc8o_view_type_pwa_document)
            - [PostDocumentBaserowPassword](#postdocumentbaserowpassword)
            - [PostDocumentCreateNotif](#postdocumentcreatenotif)
            - [PostDocumentCreateUserSettings](#postdocumentcreateusersettings)
            - [PostDocumentFromAclKey](#postdocumentfromaclkey)
            - [PostDocumentFromAclKeyMerge](#postdocumentfromaclkeymerge)
            - [PostDocumentJSONBASE](#postdocumentjsonbase)
            - [PostDocumentJsonBaseKeepACL](#postdocumentjsonbasekeepacl)
            - [PostDocumentMigrationAll](#postdocumentmigrationall)
            - [PostDocumentMigrationDraft](#postdocumentmigrationdraft)
            - [PostDocumentMigrationPublished](#postdocumentmigrationpublished)
            - [PostDocumentMigrationPublished11](#postdocumentmigrationpublished11)
            - [PostDocumentMigrationUsers](#postdocumentmigrationusers)
            - [PostDocumentMigrationUsersModif](#postdocumentmigrationusersmodif)
            - [PostDocumentPolicyMerge](#postdocumentpolicymerge)
            - [PostDocumentPublicFormJSONbase](#postdocumentpublicformjsonbase)
            - [PostDocumentSetDone](#postdocumentsetdone)
            - [PostDocumentSetPWAEnabled](#postdocumentsetpwaenabled)
            - [PostDocumentSetStatus](#postdocumentsetstatus)
            - [PostDocumentUpdateRights](#postdocumentupdaterights)
            - [PostFind](#postfind)
            - [PurgeDatabase](#purgedatabase)
            - [PutDocumentAttachment](#putdocumentattachment)
            - [PutDocumentAttachmentFromBase64](#putdocumentattachmentfrombase64)
            - [PutDocumentAttachmentFromFile](#putdocumentattachmentfromfile)
            - [PutDocumentAttachmentOK](#putdocumentattachmentok)
            - [SetLanguage](#setlanguage)
    - [c8oforms_response_fs](#c8oforms_response_fs)
        - [Transactions](#transactions-1)
            - [Generic_GetView](#generic_getview)
            - [GetDocument](#getdocument-1)
            - [GetDocumentAttachment](#getdocumentattachment-1)
            - [GetDocumentRev](#getdocumentrev-1)
            - [GetResponseByFormId](#getresponsebyformid)
            - [GetServerInfo](#getserverinfo-1)
            - [GetView](#getview-1)
            - [GetView1](#getview1)
            - [GetView1_multiple](#getview1_multiple)
            - [GetView1Pretty](#getview1pretty)
            - [PostBulkDocumentsMergeOverrideGrp](#postbulkdocumentsmergeoverridegrp)
            - [PostDocument](#postdocument-1)
            - [PostDocumentAttachmentB64IntoField](#postdocumentattachmentb64intofield)
            - [PostDocumentJBASE](#postdocumentjbase)
            - [PostDocumentOverride](#postdocumentoverride)
            - [PurgeDatabase](#purgedatabase-1)
            - [PutDocumentAttachment](#putdocumentattachment-1)
            - [PutDocumentAttachmentFromFile](#putdocumentattachmentfromfile-1)
    - [HTTP_connector](#http_connector)
        - [Transactions](#transactions-2)
            - [Default_transaction](#default_transaction)
            - [HTTP_transaction](#http_transaction)
    - [void](#void)
        - [Transactions](#transactions-3)
            - [void](#void-1)
- [Rest Web Service](#rest-web-service)
    - [Mappings](#mappings)
        - [/forms/export/{id}](#formsexport{id})
            - [Operations](#operations)
                - [GetOperation](#getoperation)
- [Convertigo Forms Builder](#convertigo-forms-builder)
    - [Pages](#pages)
        - [aiDialog](#aidialog)
        - [colorPage](#colorpage)
        - [ConditionalPage](#conditionalpage)
        - [CreatePwa](#createpwa)
        - [dataPage](#datapage)
        - [dropFilePage](#dropfilepage)
        - [editorPage](#editorpage)
        - [exportCsvPage](#exportcsvpage)
        - [GDRPpage](#gdrppage)
        - [labelsPage](#labelspage)
        - [linkPage](#linkpage)
        - [loginPage](#loginpage)
        - [ManageAccessRights](#manageaccessrights)
        - [modalActions](#modalactions)
        - [modalConfigure](#modalconfigure)
        - [modalVideo](#modalvideo)
        - [NetworkStatus](#networkstatus)
        - [PopOverInputs](#popoverinputs)
        - [PopOverNotifs](#popovernotifs)
        - [popOverPageSelector](#popoverpageselector)
        - [PreviewMultiple](#previewmultiple)
        - [progressPage](#progresspage)
        - [resetPasswordPage](#resetpasswordpage)
        - [responseCompleted](#responsecompleted)
        - [selectorPage](#selectorpage)
        - [settingsPage](#settingspage)
        - [sharingPage](#sharingpage)
        - [startCloud](#startcloud)
        - [viewerPage](#viewerpage)
        - [wallPaperSelection](#wallpaperselection)
    - [Shared Actions](#shared-actions)
        - [addAnyOption](#addanyoption)
        - [addElementonDblClick](#addelementondblclick)
        - [addtoFavorites](#addtofavorites)
        - [allowDrop](#allowdrop)
        - [blobToBase64Function](#blobtobase64function)
        - [callViewLiveAndFillFormList](#callviewliveandfillformlist)
        - [callViewLiveAndFillFormListViewer](#callviewliveandfillformlistviewer)
        - [cancelLive](#cancellive)
        - [changeBackgroundImage](#changebackgroundimage)
        - [changeTabIntoSelectorPage](#changetabintoselectorpage)
        - [checkForDuplicate](#checkforduplicate)
        - [CheckListenerHasBeenExecuted](#checklistenerhasbeenexecuted)
        - [checkUserStatus](#checkuserstatus)
        - [closeOptions](#closeoptions)
        - [CopyLinkToClipBoard](#copylinktoclipboard)
        - [createFormFromTemplate](#createformfromtemplate)
        - [createNewForm](#createnewform)
        - [detectChanges](#detectchanges)
        - [detectChangesDoble](#detectchangesdoble)
        - [dragElementTolist](#dragelementtolist)
        - [dragEnd](#dragend)
        - [dragFormIntoFolder](#dragformintofolder)
        - [dragPage](#dragpage)
        - [dragStartAction](#dragstartaction)
        - [executeGoToPageIfCondition](#executegotopageifcondition)
        - [functionPublishAndCreatePwa](#functionpublishandcreatepwa)
        - [functionPublishDoc](#functionpublishdoc)
        - [getOffsetFunction](#getoffsetfunction)
        - [getPositonAndAddr](#getpositonandaddr)
        - [getSizeObject](#getsizeobject)
        - [getTranslate](#gettranslate)
        - [getViewAndParametersForSelector](#getviewandparametersforselector)
        - [importNg2Tooltips](#importng2tooltips)
        - [isVisibleFunction](#isvisiblefunction)
        - [popOverAddToFav](#popoveraddtofav)
        - [popOverCopy](#popovercopy)
        - [popOverCopyTo](#popovercopyto)
        - [popOverCreatePwa](#popovercreatepwa)
        - [popOverDeleteView](#popoverdeleteview)
        - [popOverDisableSharePublic](#popoverdisablesharepublic)
        - [popOverDownloadCsv](#popoverdownloadcsv)
        - [popOverEditView](#popovereditview)
        - [popOverExport](#popoverexport)
        - [popOverGetLinkShare](#popovergetlinkshare)
        - [popOverGetLinkSharePublic](#popovergetlinksharepublic)
        - [popOverManageCollab](#popovermanagecollab)
        - [popOverManageLabels](#popovermanagelabels)
        - [popOverPublishDoc](#popoverpublishdoc)
        - [popOverRemoveFromFav](#popoverremovefromfav)
        - [popOverShareForm](#popovershareform)
        - [popOverThumnail](#popoverthumnail)
        - [popOverVisualizeView](#popovervisualizeview)
        - [popOverVizualiseResponses](#popovervizualiseresponses)
        - [ProcessSubmitFormViewerPage](#processsubmitformviewerpage)
        - [ProcessSubmitFormViewerPageFINISH](#processsubmitformviewerpagefinish)
        - [recursiveSearch](#recursivesearch)
        - [removeSpinner](#removespinner)
        - [replaceEmptyFunction](#replaceemptyfunction)
        - [searchForm](#searchform)
        - [setLocal](#setlocal)
        - [setSpinner](#setspinner)
        - [sharedTapOnActionSubmit](#sharedtaponactionsubmit)
        - [sharePublishedDocAnonymous](#sharepublisheddocanonymous)
        - [showThreeDotsMenu](#showthreedotsmenu)
        - [showToast](#showtoast)
        - [sublim](#sublim)
        - [switchHighlights](#switchhighlights)
        - [syncAndInvokeViewer](#syncandinvokeviewer)
        - [syncAndUpdateGetOnPull](#syncandupdategetonpull)
        - [SynchronousSync](#synchronoussync)
        - [tickAction](#tickaction)
        - [UpdateFunctionsToBeCalledToDataSource](#updatefunctionstobecalledtodatasource)
        - [updateState](#updatestate)
        - [viewNotifs](#viewnotifs)
        - [ZXing_sa_forms](#zxing_sa_forms)
    - [Shared Components](#shared-components)
        - [cardSelector](#cardselector)
        - [chooseIcon](#chooseicon)
        - [colorPicker](#colorpicker)
        - [conditiongoToPageIf](#conditiongotopageif)
        - [conditiongoToPageIfPrev](#conditiongotopageifprev)
        - [conditionVisibleIf](#conditionvisibleif)
        - [conditionVisibleIfPrev](#conditionvisibleifprev)
        - [datasource](#datasource)
        - [dataSourceEditor](#datasourceeditor)
        - [dataSourceEditorDescription](#datasourceeditordescription)
        - [DraggableElementActionPalette](#draggableelementactionpalette)
        - [DraggableElementApiPalette](#draggableelementapipalette)
        - [editorToolbarButton](#editortoolbarbutton)
        - [inputMultiVal](#inputmultival)
        - [inputTextAndField](#inputtextandfield)
        - [itemActionBusinessLogicEditor](#itemactionbusinesslogiceditor)
        - [itemActionBusinessLogicViewer](#itemactionbusinesslogicviewer)
        - [itemActionSubmitEditor](#itemactionsubmiteditor)
        - [itemActionSubmitViewer](#itemactionsubmitviewer)
        - [itemAddCheckBoxOrRadio](#itemaddcheckboxorradio)
        - [itemBarcodeSelector](#itembarcodeselector)
        - [itemBarcodeViewver](#itembarcodeviewver)
        - [itemCameraSelector](#itemcameraselector)
        - [itemCardEditor](#itemcardeditor)
        - [itemCardEditorViewer](#itemcardeditorviewer)
        - [itemCardViewer](#itemcardviewer)
        - [itemCheckboxEditor](#itemcheckboxeditor)
        - [itemCheckboxGroupEditor](#itemcheckboxgroupeditor)
        - [itemCheckboxGroupViewer](#itemcheckboxgroupviewer)
        - [itemCheckboxGroupViewerConditions](#itemcheckboxgroupviewerconditions)
        - [itemCheckboxViewer](#itemcheckboxviewer)
        - [itemCheckboxViewerConditions](#itemcheckboxviewerconditions)
        - [itemDateSelector](#itemdateselector)
        - [itemDateTimeViewver](#itemdatetimeviewver)
        - [itemDescriptionEditor](#itemdescriptioneditor)
        - [itemDescriptionViewer](#itemdescriptionviewer)
        - [itemFileSelector](#itemfileselector)
        - [itemFileViewver](#itemfileviewver)
        - [itemGridEditor](#itemgrideditor)
        - [itemGridViewer](#itemgridviewer)
        - [itemHeaderEdit](#itemheaderedit)
        - [itemImgViewer](#itemimgviewer)
        - [itemLocationEditor](#itemlocationeditor)
        - [itemLocationViewer](#itemlocationviewer)
        - [itemRadioGroupViewver](#itemradiogroupviewver)
        - [itemRadioListEditor](#itemradiolisteditor)
        - [itemRadioListGroupEditor](#itemradiolistgroupeditor)
        - [itemRadioViewver](#itemradioviewver)
        - [itemSelectEditor](#itemselecteditor)
        - [itemSelectViewver](#itemselectviewver)
        - [itemSignatureSelector](#itemsignatureselector)
        - [itemSignatureViewver](#itemsignatureviewver)
        - [itemSliderEditor](#itemslidereditor)
        - [itemSliderViewver](#itemsliderviewver)
        - [itemTextEditor](#itemtexteditor)
        - [itemTextViewer](#itemtextviewer)
        - [itemTimeSelector](#itemtimeselector)
        - [itemTimeViewver](#itemtimeviewver)
        - [ItemTitleSub](#itemtitlesub)
        - [itemVideoCallEditor](#itemvideocalleditor)
        - [itemVideoCallViewer](#itemvideocallviewer)
        - [itemVideoCallViewerInEditionPage](#itemvideocallviewerineditionpage)
        - [labelFieldMustBeFilled](#labelfieldmustbefilled)
        - [listSelector](#listselector)
        - [mdReader](#mdreader)
        - [menuVersion](#menuversion)
        - [monacoEditor](#monacoeditor)
        - [ngxTagInputCustomC8oForms](#ngxtaginputcustomc8oforms)
        - [PopOverSourceCompletion](#popoversourcecompletion)
        - [searchableSelect](#searchableselect)
        - [sharedDropIndicator](#shareddropindicator)
        - [sharedDropIndicatorSelector](#shareddropindicatorselector)
        - [SharedGrabHeader](#sharedgrabheader)
        - [sharedHeaderMenu](#sharedheadermenu)
        - [SharedHeaderStats](#sharedheaderstats)
        - [sharedLabelElem](#sharedlabelelem)
        - [sharedNocodeDatabase](#sharednocodedatabase)
        - [sharedQuestionElem](#sharedquestionelem)
        - [sharedStatsCheckbox](#sharedstatscheckbox)
        - [sharedStatsCheckboxGroup](#sharedstatscheckboxgroup)
        - [sharedStatsFiles](#sharedstatsfiles)
        - [sharedStatsImg](#sharedstatsimg)
        - [sharedStatsInputText](#sharedstatsinputtext)
        - [sharedStatsLocation](#sharedstatslocation)
        - [sharedStatsRadio](#sharedstatsradio)
        - [SharedTabs](#sharedtabs)
        - [SharedVersion](#sharedversion)
        - [switchItemEdition](#switchitemedition)
        - [switchItemViewer](#switchitemviewer)
        - [treeview](#treeview)
        - [treeviewContent](#treeviewcontent)


## Installation

1. In your Convertigo Studio use `File->Import->Convertigo->Convertigo Project` and hit the `Next` button
2. In the dialog `Project remote URL` field, paste the text below:
   <table>
     <tr><td>Usage</td><td>Click the copy button</td></tr>
     <tr><td>To contribute</td><td>

     ```
     C8Oforms=git@github.com:convertigo/C8oForms.git:branch=NGX
     ```
     </td></tr>
     <tr><td>To simply use</td><td>

     ```
     C8Oforms=git@github.com:convertigo/C8oForms/archive/NGX.zip
     ```
     </td></tr>
    </table>
3. Click the `Finish` button. This will automatically import the __C8Oforms__ project


## Connectors

### c8oforms_fs

Fullsync connector that holds all forms and user settings

#### Transactions

##### DeleteDocument

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_docid</td><td></td>
</tr>
</table>
##### GetDocument

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_docid</td><td></td>
</tr>
</table>
##### GetDocumentAttachment

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_attname</td><td></td>
</tr>
<tr>
<td>_use_attpath</td><td></td>
</tr>
<tr>
<td>_use_docid</td><td></td>
</tr>
<tr>
<td>_use_rev</td><td></td>
</tr>
</table>
##### GetDocumentAttachment1

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_attname</td><td></td>
</tr>
<tr>
<td>_use_attpath</td><td></td>
</tr>
<tr>
<td>_use_docid</td><td></td>
</tr>
</table>
##### GetDocumentAttachmentB64

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_attname</td><td></td>
</tr>
<tr>
<td>_use_docid</td><td></td>
</tr>
</table>
##### GetDocumentRev

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_docid</td><td></td>
</tr>
<tr>
<td>_use_rev</td><td></td>
</tr>
</table>
##### GetServerInfo

##### GetServerInfo1

##### GetUsersByACL

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_ddoc</td><td></td>
</tr>
<tr>
<td>_use_include_docs</td><td></td>
</tr>
<tr>
<td>_use_keys</td><td></td>
</tr>
<tr>
<td>_use_view</td><td></td>
</tr>
</table>
##### GetView

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_ddoc</td><td></td>
</tr>
<tr>
<td>_use_group</td><td></td>
</tr>
<tr>
<td>_use_group_level</td><td></td>
</tr>
<tr>
<td>_use_reduce</td><td></td>
</tr>
<tr>
<td>_use_view</td><td></td>
</tr>
</table>
##### GetViewAuth

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_group</td><td></td>
</tr>
<tr>
<td>_use_group_level</td><td></td>
</tr>
<tr>
<td>_use_keys</td><td></td>
</tr>
<tr>
<td>_use_reduce</td><td></td>
</tr>
</table>
##### GetViewByKeys

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_ddoc</td><td></td>
</tr>
<tr>
<td>_use_keys</td><td></td>
</tr>
<tr>
<td>_use_view</td><td></td>
</tr>
</table>
##### GetViewIncludeDocs

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_ddoc</td><td></td>
</tr>
<tr>
<td>_use_include_docs</td><td></td>
</tr>
<tr>
<td>_use_view</td><td></td>
</tr>
</table>
##### GetViewPublishedbyAcl

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_ddoc</td><td></td>
</tr>
<tr>
<td>_use_key</td><td></td>
</tr>
<tr>
<td>_use_view</td><td></td>
</tr>
</table>
##### HeadDocument

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_docid</td><td></td>
</tr>
</table>
##### PostBulkDocuments_1

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_json_base</td><td></td>
</tr>
</table>
##### PostDocument

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_c8oAcl</td><td></td>
</tr>
<tr>
<td>_id</td><td></td>
</tr>
<tr>
<td>_use_merge</td><td></td>
</tr>
<tr>
<td>actions</td><td></td>
</tr>
<tr>
<td>c8o_view_type_published_form</td><td></td>
</tr>
<tr>
<td>c8oGrp</td><td></td>
</tr>
<tr>
<td>collabs</td><td></td>
</tr>
<tr>
<td>collabsResponse</td><td></td>
</tr>
<tr>
<td>creationDate</td><td></td>
</tr>
<tr>
<td>creator</td><td></td>
</tr>
<tr>
<td>descform</td><td></td>
</tr>
<tr>
<td>descformPosition</td><td></td>
</tr>
<tr>
<td>formulaire</td><td></td>
</tr>
<tr>
<td>lastMofification</td><td></td>
</tr>
<tr>
<td>name</td><td></td>
</tr>
<tr>
<td>namePosition</td><td></td>
</tr>
<tr>
<td>pages</td><td></td>
</tr>
<tr>
<td>parentId</td><td></td>
</tr>
<tr>
<td>parentRev</td><td></td>
</tr>
<tr>
<td>pwa_enabled</td><td></td>
</tr>
<tr>
<td>pwa_subPath</td><td></td>
</tr>
<tr>
<td>respNameRequired</td><td></td>
</tr>
<tr>
<td>sharedAnonymous</td><td></td>
</tr>
<tr>
<td>subTag</td><td></td>
</tr>
<tr>
<td>tag</td><td></td>
</tr>
<tr>
<td>thumbnail</td><td></td>
</tr>
<tr>
<td>version</td><td></td>
</tr>
<tr>
<td>wallpaper</td><td></td>
</tr>
</table>
##### PostDocument_PWA

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_c8oAcl</td><td></td>
</tr>
<tr>
<td>_id</td><td></td>
</tr>
<tr>
<td>_use_json_base</td><td></td>
</tr>
<tr>
<td>_use_merge</td><td></td>
</tr>
<tr>
<td>backgroundColor</td><td></td>
</tr>
<tr>
<td>c8o_view_type_pwa_document</td><td></td>
</tr>
<tr>
<td>name</td><td></td>
</tr>
<tr>
<td>notAnonymous</td><td></td>
</tr>
<tr>
<td>originalFormId</td><td></td>
</tr>
<tr>
<td>querystr</td><td></td>
</tr>
<tr>
<td>shortName</td><td></td>
</tr>
<tr>
<td>targetId</td><td></td>
</tr>
<tr>
<td>themeColor</td><td></td>
</tr>
</table>
##### PostDocument_restore_deleted

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>data</td><td></td>
</tr>
</table>
##### PostDocumentAddArgc8o_view_type_pwa_document

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_id</td><td></td>
</tr>
<tr>
<td>c8o_view_type_pwa_document</td><td></td>
</tr>
<tr>
<td>targetId</td><td></td>
</tr>
</table>
##### PostDocumentBaserowPassword

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_id</td><td></td>
</tr>
<tr>
<td>password</td><td></td>
</tr>
</table>
##### PostDocumentCreateNotif

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_id</td><td></td>
</tr>
<tr>
<td>c8o_view_type_notification</td><td></td>
</tr>
<tr>
<td>date</td><td></td>
</tr>
<tr>
<td>formId</td><td></td>
</tr>
<tr>
<td>new</td><td></td>
</tr>
<tr>
<td>status</td><td></td>
</tr>
<tr>
<td>targetId</td><td></td>
</tr>
<tr>
<td>targetName</td><td></td>
</tr>
<tr>
<td>type</td><td></td>
</tr>
</table>
##### PostDocumentCreateUserSettings

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_c8oAcl</td><td></td>
</tr>
<tr>
<td>_id</td><td></td>
</tr>
<tr>
<td>_use_json_base</td><td></td>
</tr>
<tr>
<td>c8o_view_type_users</td><td></td>
</tr>
<tr>
<td>displayName</td><td></td>
</tr>
<tr>
<td>editing_rights</td><td></td>
</tr>
<tr>
<td>favorites</td><td></td>
</tr>
<tr>
<td>language</td><td></td>
</tr>
<tr>
<td>mail</td><td></td>
</tr>
<tr>
<td>name</td><td></td>
</tr>
<tr>
<td>picture</td><td></td>
</tr>
<tr>
<td>provider</td><td></td>
</tr>
<tr>
<td>published_First</td><td></td>
</tr>
<tr>
<td>surname</td><td></td>
</tr>
</table>
##### PostDocumentFromAclKey

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_c8oAcl</td><td></td>
</tr>
<tr>
<td>_id</td><td></td>
</tr>
<tr>
<td>_use_merge</td><td></td>
</tr>
<tr>
<td>actions</td><td></td>
</tr>
<tr>
<td>c8oGrp</td><td></td>
</tr>
<tr>
<td>creator</td><td></td>
</tr>
<tr>
<td>descform</td><td></td>
</tr>
<tr>
<td>descformPosition</td><td></td>
</tr>
<tr>
<td>formulaire</td><td></td>
</tr>
<tr>
<td>name</td><td></td>
</tr>
<tr>
<td>namePosition</td><td></td>
</tr>
<tr>
<td>pages</td><td></td>
</tr>
<tr>
<td>parentId</td><td></td>
</tr>
<tr>
<td>parentRev</td><td></td>
</tr>
<tr>
<td>respNameRequired</td><td></td>
</tr>
<tr>
<td>version</td><td></td>
</tr>
<tr>
<td>wallpaper</td><td></td>
</tr>
</table>
##### PostDocumentFromAclKeyMerge

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_c8oAcl</td><td></td>
</tr>
<tr>
<td>_id</td><td></td>
</tr>
<tr>
<td>_use_merge</td><td></td>
</tr>
<tr>
<td>actions</td><td></td>
</tr>
<tr>
<td>c8oGrp</td><td></td>
</tr>
<tr>
<td>creator</td><td></td>
</tr>
<tr>
<td>descform</td><td></td>
</tr>
<tr>
<td>descformPosition</td><td></td>
</tr>
<tr>
<td>formulaire</td><td></td>
</tr>
<tr>
<td>name</td><td></td>
</tr>
<tr>
<td>namePosition</td><td></td>
</tr>
<tr>
<td>pages</td><td></td>
</tr>
<tr>
<td>parentId</td><td></td>
</tr>
<tr>
<td>parentRev</td><td></td>
</tr>
<tr>
<td>respNameRequired</td><td></td>
</tr>
<tr>
<td>version</td><td></td>
</tr>
<tr>
<td>wallpaper</td><td></td>
</tr>
</table>
##### PostDocumentJSONBASE

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_c8oAcl</td><td></td>
</tr>
<tr>
<td>_use_json_base</td><td></td>
</tr>
</table>
##### PostDocumentJsonBaseKeepACL

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_json_base</td><td></td>
</tr>
<tr>
<td>_use_merge</td><td></td>
</tr>
</table>
##### PostDocumentMigrationAll

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_id</td><td></td>
</tr>
<tr>
<td>subTag</td><td></td>
</tr>
<tr>
<td>tag</td><td></td>
</tr>
</table>
##### PostDocumentMigrationDraft

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_id</td><td></td>
</tr>
<tr>
<td>c8o_view_type_drafts_form</td><td></td>
</tr>
</table>
##### PostDocumentMigrationPublished

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_id</td><td></td>
</tr>
<tr>
<td>c8o_view_type_published_form</td><td></td>
</tr>
</table>
##### PostDocumentMigrationPublished11

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_id</td><td></td>
</tr>
<tr>
<td>c8o_view_type_published_form</td><td></td>
</tr>
</table>
##### PostDocumentMigrationUsers

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_id</td><td></td>
</tr>
<tr>
<td>c8o_view_type_users</td><td></td>
</tr>
</table>
##### PostDocumentMigrationUsersModif

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_id</td><td></td>
</tr>
<tr>
<td>c8o_view_type_usersModif</td><td></td>
</tr>
</table>
##### PostDocumentPolicyMerge

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_id</td><td></td>
</tr>
<tr>
<td>sharedAnonymous</td><td></td>
</tr>
</table>
##### PostDocumentPublicFormJSONbase

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_json_base</td><td></td>
</tr>
</table>
##### PostDocumentSetDone

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_id</td><td></td>
</tr>
<tr>
<td>done</td><td></td>
</tr>
</table>
##### PostDocumentSetPWAEnabled

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_id</td><td></td>
</tr>
<tr>
<td>pwa_enabled</td><td></td>
</tr>
<tr>
<td>pwa_subPath</td><td></td>
</tr>
</table>
##### PostDocumentSetStatus

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_id</td><td></td>
</tr>
<tr>
<td>status</td><td></td>
</tr>
</table>
##### PostDocumentUpdateRights

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_c8oAcl</td><td></td>
</tr>
<tr>
<td>_id</td><td></td>
</tr>
<tr>
<td>editing_rights</td><td></td>
</tr>
</table>
##### PostFind

##### PurgeDatabase

##### PutDocumentAttachment

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_attname</td><td></td>
</tr>
<tr>
<td>_use_attpath</td><td></td>
</tr>
<tr>
<td>_use_docid</td><td></td>
</tr>
</table>
##### PutDocumentAttachmentFromBase64

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_attbase64</td><td></td>
</tr>
<tr>
<td>_use_attcontent_type</td><td></td>
</tr>
<tr>
<td>_use_attname</td><td></td>
</tr>
<tr>
<td>_use_docid</td><td></td>
</tr>
</table>
##### PutDocumentAttachmentFromFile

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_attcontent_type</td><td></td>
</tr>
<tr>
<td>_use_attname</td><td></td>
</tr>
<tr>
<td>_use_attpath</td><td></td>
</tr>
<tr>
<td>_use_docid</td><td></td>
</tr>
</table>
##### PutDocumentAttachmentOK

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_attcontent_type</td><td></td>
</tr>
<tr>
<td>_use_attname</td><td></td>
</tr>
<tr>
<td>_use_attpath</td><td></td>
</tr>
<tr>
<td>_use_docid</td><td></td>
</tr>
</table>
##### SetLanguage

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_id</td><td></td>
</tr>
<tr>
<td>language</td><td></td>
</tr>
</table>
### c8oforms_response_fs

Fullsync connector that holds all responses

#### Transactions

##### Generic_GetView

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_ddoc</td><td></td>
</tr>
<tr>
<td>_use_key</td><td></td>
</tr>
<tr>
<td>_use_view</td><td></td>
</tr>
</table>
##### GetDocument

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_docid</td><td></td>
</tr>
</table>
##### GetDocumentAttachment

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_attname</td><td></td>
</tr>
<tr>
<td>_use_attpath</td><td></td>
</tr>
<tr>
<td>_use_docid</td><td></td>
</tr>
</table>
##### GetDocumentRev

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_docid</td><td></td>
</tr>
<tr>
<td>_use_rev</td><td></td>
</tr>
</table>
##### GetResponseByFormId

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_key</td><td></td>
</tr>
</table>
##### GetServerInfo

##### GetView

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_key</td><td></td>
</tr>
</table>
##### GetView1

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_key</td><td></td>
</tr>
</table>
##### GetView1_multiple

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_key</td><td></td>
</tr>
</table>
##### GetView1Pretty

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_key</td><td></td>
</tr>
</table>
##### PostBulkDocumentsMergeOverrideGrp

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_json_base</td><td></td>
</tr>
<tr>
<td>_use_merge</td><td></td>
</tr>
</table>
##### PostDocument

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_c8oAcl</td><td></td>
</tr>
<tr>
<td>_id</td><td></td>
</tr>
<tr>
<td>_use_json_base</td><td></td>
</tr>
<tr>
<td>c8oGrp</td><td></td>
</tr>
<tr>
<td>resp</td><td></td>
</tr>
</table>
##### PostDocumentAttachmentB64IntoField

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_id</td><td></td>
</tr>
<tr>
<td>_use_json_base</td><td></td>
</tr>
<tr>
<td>_use_merge</td><td></td>
</tr>
</table>
##### PostDocumentJBASE

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_id</td><td></td>
</tr>
<tr>
<td>_use_json_base</td><td></td>
</tr>
</table>
##### PostDocumentOverride

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_id</td><td></td>
</tr>
<tr>
<td>_use_json_base</td><td></td>
</tr>
<tr>
<td>_use_merge</td><td></td>
</tr>
</table>
##### PurgeDatabase

##### PutDocumentAttachment

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_attbase64</td><td></td>
</tr>
<tr>
<td>_use_attcontent_type</td><td></td>
</tr>
<tr>
<td>_use_attname</td><td></td>
</tr>
<tr>
<td>_use_attpath</td><td></td>
</tr>
<tr>
<td>_use_docid</td><td></td>
</tr>
</table>
##### PutDocumentAttachmentFromFile

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_attcontent_type</td><td></td>
</tr>
<tr>
<td>_use_attname</td><td></td>
</tr>
<tr>
<td>_use_attpath</td><td></td>
</tr>
<tr>
<td>_use_docid</td><td></td>
</tr>
</table>
### HTTP_connector

#### Transactions

##### Default_transaction

##### HTTP_transaction

### void

void connector, replace or don't use it

#### Transactions

##### void

does nothing

## Rest Web Service

### Mappings

#### /forms/export/{id}

Export a forms with a given id

##### Operations

###### GetOperation

Export a forms with a given id

**Parameters**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>id</td><td></td>
</tr>
</table>
## Convertigo Forms Builder

Describes the mobile application global properties 2

### Pages

#### aiDialog

#### colorPage

#### ConditionalPage

#### CreatePwa

#### dataPage

#### dropFilePage

#### editorPage

Form Creator

#### exportCsvPage

#### GDRPpage

#### labelsPage

#### linkPage

#### loginPage

Form login
old segment:
login/:formId/:page/:edit/:published/:d/:e

#### ManageAccessRights

Page to share a form, or add collaborators

#### modalActions

#### modalConfigure

#### modalVideo

#### NetworkStatus

#### PopOverInputs

#### PopOverNotifs

#### popOverPageSelector

#### PreviewMultiple

#### progressPage

#### resetPasswordPage

#### responseCompleted

#### selectorPage

Form chooser

#### settingsPage

Settings

#### sharingPage

#### startCloud

#### viewerPage

Form Visualisator

#### wallPaperSelection

### Shared Actions

#### addAnyOption

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>defaultValue</td><td></td>
</tr>
<tr>
<td>isOther</td><td></td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
</table>
#### addElementonDblClick

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>cat</td><td></td>
</tr>
<tr>
<td>message</td><td></td>
</tr>
<tr>
<td>toast</td><td></td>
</tr>
<tr>
<td>type</td><td></td>
</tr>
</table>
#### addtoFavorites

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>arrayDocId</td><td></td>
</tr>
<tr>
<td>that</td><td></td>
</tr>
</table>
#### allowDrop

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>local</td><td></td>
</tr>
<tr>
<td>position</td><td></td>
</tr>
<tr>
<td>reciever</td><td></td>
</tr>
</table>
#### blobToBase64Function

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>blobData</td><td></td>
</tr>
</table>
#### callViewLiveAndFillFormList

Process a tick (Refresh define in caf)

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>keys</td><td></td>
</tr>
</table>
#### callViewLiveAndFillFormListViewer

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>fromId</td><td></td>
</tr>
<tr>
<td>fs</td><td></td>
</tr>
</table>
#### cancelLive

#### changeBackgroundImage

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>returnBinary</td><td></td>
</tr>
<tr>
<td>selectedForm</td><td></td>
</tr>
<tr>
<td>wallpaper</td><td></td>
</tr>
</table>
#### changeTabIntoSelectorPage

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>canExec</td><td></td>
</tr>
<tr>
<td>changeToData</td><td></td>
</tr>
<tr>
<td>changeToPublished</td><td></td>
</tr>
</table>
#### checkForDuplicate

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>formList</td><td></td>
</tr>
<tr>
<td>value</td><td></td>
</tr>
</table>
#### CheckListenerHasBeenExecuted

#### checkUserStatus

#### closeOptions

This functions is used to close an element selected on editor page

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>child</td><td></td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
</table>
#### CopyLinkToClipBoard

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>link</td><td></td>
</tr>
</table>
#### createFormFromTemplate

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>id</td><td></td>
</tr>
</table>
#### createNewForm

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>ai</td><td></td>
</tr>
<tr>
<td>creating</td><td></td>
</tr>
</table>
#### detectChanges

#### detectChangesDoble

#### dragElementTolist

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>cat</td><td></td>
</tr>
<tr>
<td>type</td><td></td>
</tr>
</table>
#### dragEnd

#### dragFormIntoFolder

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>id</td><td></td>
</tr>
</table>
#### dragPage

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>i</td><td></td>
</tr>
</table>
#### dragStartAction

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>code</td><td></td>
</tr>
<tr>
<td>isTs</td><td></td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
<tr>
<td>targetType</td><td></td>
</tr>
<tr>
<td>transform_toTsMonaco</td><td></td>
</tr>
</table>
#### executeGoToPageIfCondition

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>canExec</td><td></td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
</table>
#### functionPublishAndCreatePwa

used to publish or/and create/update pwa

#### functionPublishDoc

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>selectedForm</td><td></td>
</tr>
</table>
#### getOffsetFunction

#### getPositonAndAddr

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>item</td><td></td>
</tr>
<tr>
<td>model</td><td></td>
</tr>
</table>
#### getSizeObject

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>obj</td><td></td>
</tr>
</table>
#### getTranslate

Get i118n translations

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>msgTosearch</td><td></td>
</tr>
</table>
#### getViewAndParametersForSelector

#### importNg2Tooltips

#### isVisibleFunction

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>selectedForm</td><td></td>
</tr>
</table>
#### popOverAddToFav

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>index</td><td></td>
</tr>
<tr>
<td>selectedForm</td><td></td>
</tr>
<tr>
<td>that</td><td></td>
</tr>
</table>
#### popOverCopy

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>selectedForm</td><td></td>
</tr>
</table>
#### popOverCopyTo

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>selectedForm</td><td></td>
</tr>
</table>
#### popOverCreatePwa

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>header</td><td></td>
</tr>
<tr>
<td>new</td><td></td>
</tr>
<tr>
<td>publish</td><td></td>
</tr>
<tr>
<td>publishInfos</td><td></td>
</tr>
<tr>
<td>realFormFrom</td><td></td>
</tr>
<tr>
<td>selectedForm</td><td></td>
</tr>
</table>
#### popOverDeleteView

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>leavePage</td><td></td>
</tr>
<tr>
<td>multiple</td><td></td>
</tr>
<tr>
<td>selectedForm</td><td></td>
</tr>
</table>
#### popOverDisableSharePublic

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>selectedForm</td><td></td>
</tr>
</table>
#### popOverDownloadCsv

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>name</td><td></td>
</tr>
<tr>
<td>offset</td><td></td>
</tr>
<tr>
<td>selectedForm</td><td></td>
</tr>
<tr>
<td>version</td><td></td>
</tr>
</table>
#### popOverEditView

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>selectedForm</td><td></td>
</tr>
</table>
#### popOverExport

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>selectedForm</td><td></td>
</tr>
</table>
#### popOverGetLinkShare

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>selectedForm</td><td></td>
</tr>
</table>
#### popOverGetLinkSharePublic

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>selectedForm</td><td></td>
</tr>
</table>
#### popOverManageCollab

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>selectedForm</td><td></td>
</tr>
</table>
#### popOverManageLabels

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>published</td><td></td>
</tr>
<tr>
<td>selectedForm</td><td></td>
</tr>
</table>
#### popOverPublishDoc

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>selectedForm</td><td></td>
</tr>
</table>
#### popOverRemoveFromFav

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>selectedForm</td><td></td>
</tr>
</table>
#### popOverShareForm

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>selectedForm</td><td></td>
</tr>
</table>
#### popOverThumnail

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>selectedForm</td><td></td>
</tr>
</table>
#### popOverVisualizeView

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>selectedForm</td><td></td>
</tr>
</table>
#### popOverVizualiseResponses

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>selectedForm</td><td></td>
</tr>
</table>
#### ProcessSubmitFormViewerPage

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>doAll</td><td></td>
</tr>
<tr>
<td>indexPage</td><td></td>
</tr>
<tr>
<td>pages</td><td></td>
</tr>
</table>
#### ProcessSubmitFormViewerPageFINISH

#### recursiveSearch

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>action</td><td></td>
</tr>
<tr>
<td>el</td><td></td>
</tr>
<tr>
<td>local</td><td></td>
</tr>
<tr>
<td>position</td><td></td>
</tr>
</table>
#### removeSpinner

#### replaceEmptyFunction

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>name</td><td></td>
</tr>
</table>
#### searchForm

#### setLocal

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>path</td><td></td>
</tr>
<tr>
<td>val</td><td></td>
</tr>
</table>
#### setSpinner

#### sharedTapOnActionSubmit

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>item</td><td></td>
</tr>
</table>
#### sharePublishedDocAnonymous

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>docid</td><td></td>
</tr>
</table>
#### showThreeDotsMenu

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>currentIndex</td><td></td>
</tr>
<tr>
<td>folder</td><td></td>
</tr>
<tr>
<td>id</td><td></td>
</tr>
<tr>
<td>page</td><td></td>
</tr>
</table>
#### showToast

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>closeButtonText</td><td></td>
</tr>
<tr>
<td>cssClass</td><td></td>
</tr>
<tr>
<td>duration</td><td></td>
</tr>
<tr>
<td>msg</td><td></td>
</tr>
<tr>
<td>position</td><td></td>
</tr>
<tr>
<td>showCloseButton</td><td></td>
</tr>
</table>
#### sublim

This function is used to open an element selected on editor page

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>child</td><td></td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
</table>
#### switchHighlights

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>el</td><td></td>
</tr>
<tr>
<td>local</td><td></td>
</tr>
</table>
#### syncAndInvokeViewer

#### syncAndUpdateGetOnPull

#### SynchronousSync

#### tickAction

Process a tick (Refresh define in caf)

#### UpdateFunctionsToBeCalledToDataSource

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>excludeMySelf</td><td></td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
</table>
#### updateState

Update the state of a field

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>file</td><td></td>
</tr>
<tr>
<td>meta</td><td></td>
</tr>
</table>
#### viewNotifs

#### ZXing_sa_forms

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>file</td><td>File object as Array (if not provided from an input type file).</td>
</tr>
<tr>
<td>imgId</td><td>Img tag identifier to output image file. Optional</td>
</tr>
<tr>
<td>isOutputEvent</td><td>Publish scan result or not to the topic event. Default: true.</td>
</tr>
<tr>
<td>isOutputGlobal</td><td>Insert or not the scan result in a global page variable. The variable is composed of 'zxing:' + topic + ref variables. Default: true.</td>
</tr>
<tr>
<td>ref</td><td>In case of multiple ZXing package instances, set the variable to different values to distinguish the Publish data event and/or the local page variable. Default: ''. Optional</td>
</tr>
<tr>
<td>resultId</td><td>Input tag identifier to set value to. Optional</td>
</tr>
<tr>
<td>topic</td><td>Publish Topic name to use with a Subscribe component. Optional</td>
</tr>
<tr>
<td>type</td><td>Scan from file or video. Default: 'file'</td>
</tr>
<tr>
<td>videoId</td><td>Video tag identifier to output video camera. Default: 'video'. Optional</td>
</tr>
</table>
### Shared Components

#### cardSelector

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>i</td><td></td>
</tr>
<tr>
<td>isAfolder</td><td></td>
</tr>
<tr>
<td>list</td><td></td>
</tr>
<tr>
<td>offsetObject</td><td></td>
</tr>
</table>
#### chooseIcon

#### colorPicker

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>color</td><td></td>
</tr>
<tr>
<td>width</td><td></td>
</tr>
</table>
#### conditiongoToPageIf

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>current</td><td></td>
</tr>
<tr>
<td>i</td><td></td>
</tr>
<tr>
<td>length</td><td></td>
</tr>
</table>
#### conditiongoToPageIfPrev

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>current</td><td></td>
</tr>
<tr>
<td>i</td><td></td>
</tr>
</table>
#### conditionVisibleIf

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>current</td><td></td>
</tr>
<tr>
<td>i</td><td></td>
</tr>
</table>
#### conditionVisibleIfPrev

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>always</td><td></td>
</tr>
<tr>
<td>current</td><td></td>
</tr>
<tr>
<td>i</td><td></td>
</tr>
</table>
#### datasource

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>isSource</td><td></td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
<tr>
<td>path</td><td></td>
</tr>
<tr>
<td>thingIndex</td><td></td>
</tr>
</table>
#### dataSourceEditor

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>apiApp</td><td></td>
</tr>
<tr>
<td>apiC8o</td><td></td>
</tr>
<tr>
<td>apiForm</td><td></td>
</tr>
<tr>
<td>apiPage</td><td></td>
</tr>
<tr>
<td>apiRouter</td><td></td>
</tr>
<tr>
<td>apiTranslate</td><td></td>
</tr>
<tr>
<td>apiUser</td><td></td>
</tr>
<tr>
<td>currentMeta</td><td></td>
</tr>
<tr>
<td>currentObject</td><td></td>
</tr>
<tr>
<td>dragging</td><td></td>
</tr>
<tr>
<td>isSource</td><td></td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
<tr>
<td>path</td><td></td>
</tr>
<tr>
<td>sources</td><td></td>
</tr>
<tr>
<td>thingIndex</td><td></td>
</tr>
<tr>
<td>type</td><td></td>
</tr>
</table>
**events**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>save</td><td></td>
</tr>
</table>
#### dataSourceEditorDescription

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>isText</td><td></td>
</tr>
</table>
#### DraggableElementActionPalette

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>isTs</td><td></td>
</tr>
<tr>
<td>item2ActionPalette</td><td></td>
</tr>
<tr>
<td>targetType</td><td></td>
</tr>
<tr>
<td>transform_toTsMonaco</td><td></td>
</tr>
</table>
#### DraggableElementApiPalette

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>isTs</td><td></td>
</tr>
<tr>
<td>item2ActionPalette</td><td></td>
</tr>
<tr>
<td>targetCode</td><td></td>
</tr>
<tr>
<td>targetType</td><td></td>
</tr>
<tr>
<td>transform_toTsMonaco</td><td></td>
</tr>
</table>
#### editorToolbarButton

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>color</td><td></td>
</tr>
<tr>
<td>icon</td><td></td>
</tr>
<tr>
<td>text</td><td></td>
</tr>
<tr>
<td>textTooltip</td><td></td>
</tr>
</table>
**events**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>clicked</td><td></td>
</tr>
</table>
#### inputMultiVal

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>current</td><td></td>
</tr>
<tr>
<td>i</td><td></td>
</tr>
<tr>
<td>inputngx</td><td></td>
</tr>
<tr>
<td>type</td><td></td>
</tr>
</table>
#### inputTextAndField

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>current</td><td></td>
</tr>
<tr>
<td>i</td><td></td>
</tr>
<tr>
<td>inputngx</td><td></td>
</tr>
<tr>
<td>prefixEvent</td><td></td>
</tr>
<tr>
<td>type</td><td></td>
</tr>
</table>
#### itemActionBusinessLogicEditor

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>idselected</td><td></td>
</tr>
<tr>
<td>isChild</td><td></td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
<tr>
<td>thingIndex</td><td></td>
</tr>
</table>
#### itemActionBusinessLogicViewer

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>item</td><td></td>
</tr>
<tr>
<td>model</td><td>this.formsSubmit[item['name']]</td>
</tr>
</table>
#### itemActionSubmitEditor

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>idselected</td><td></td>
</tr>
<tr>
<td>isChild</td><td></td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
<tr>
<td>thingIndex</td><td></td>
</tr>
</table>
#### itemActionSubmitViewer

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>item</td><td></td>
</tr>
</table>
#### itemAddCheckBoxOrRadio

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>defaultValue</td><td></td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
</table>
#### itemBarcodeSelector

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>idselected</td><td></td>
</tr>
<tr>
<td>isChild</td><td></td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
</table>
#### itemBarcodeViewver

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>disabled</td><td>this.formsSubmit[item['name']]</td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
<tr>
<td>model</td><td>this.formsSubmit[item['name']]</td>
</tr>
<tr>
<td>redList</td><td>this.redList[item['name']]</td>
</tr>
</table>
#### itemCameraSelector

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>idselected</td><td></td>
</tr>
<tr>
<td>isChild</td><td></td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
</table>
#### itemCardEditor

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>disabled</td><td></td>
</tr>
<tr>
<td>idselected</td><td></td>
</tr>
<tr>
<td>indexItem</td><td></td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
</table>
#### itemCardEditorViewer

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>idselected</td><td></td>
</tr>
<tr>
<td>indexItem</td><td></td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
</table>
#### itemCardViewer

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>item</td><td></td>
</tr>
<tr>
<td>model</td><td></td>
</tr>
<tr>
<td>redList</td><td></td>
</tr>
</table>
#### itemCheckboxEditor

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>idselected</td><td></td>
</tr>
<tr>
<td>isChild</td><td></td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
</table>
#### itemCheckboxGroupEditor

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>idselected</td><td></td>
</tr>
<tr>
<td>isChild</td><td></td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
</table>
#### itemCheckboxGroupViewer

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>disabled</td><td>this.formsSubmit[item['name']]</td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
<tr>
<td>model</td><td></td>
</tr>
<tr>
<td>redList</td><td></td>
</tr>
</table>
#### itemCheckboxGroupViewerConditions

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>disabled</td><td>this.formsSubmit[item['name']]</td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
<tr>
<td>model</td><td></td>
</tr>
<tr>
<td>redList</td><td></td>
</tr>
</table>
#### itemCheckboxViewer

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>disabled</td><td>this.formsSubmit[item['name']]</td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
<tr>
<td>model</td><td></td>
</tr>
<tr>
<td>redList</td><td></td>
</tr>
</table>
#### itemCheckboxViewerConditions

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>disabled</td><td>this.formsSubmit[item['name']]</td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
<tr>
<td>model</td><td></td>
</tr>
<tr>
<td>redList</td><td></td>
</tr>
</table>
#### itemDateSelector

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>idselected</td><td></td>
</tr>
<tr>
<td>isChild</td><td></td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
</table>
#### itemDateTimeViewver

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>disabled</td><td>this.formsSubmit[item['name']]</td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
<tr>
<td>model</td><td>this.formsSubmit[item['name']]</td>
</tr>
<tr>
<td>redList</td><td>this.redList[item['name']]</td>
</tr>
</table>
#### itemDescriptionEditor

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>idselected</td><td></td>
</tr>
<tr>
<td>isChild</td><td></td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
</table>
#### itemDescriptionViewer

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>fromViewer</td><td></td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
</table>
#### itemFileSelector

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>idselected</td><td></td>
</tr>
<tr>
<td>isChild</td><td></td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
</table>
#### itemFileViewver

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>disabled</td><td>this.formsSubmit[item['name']]</td>
</tr>
<tr>
<td>idFiles</td><td></td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
<tr>
<td>model</td><td>this.formsSubmit[item['name']]</td>
</tr>
<tr>
<td>redList</td><td>this.redList[item['name']]</td>
</tr>
</table>
#### itemGridEditor

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>idselected</td><td></td>
</tr>
<tr>
<td>isChild</td><td></td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
</table>
#### itemGridViewer

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>disabled</td><td>this.formsSubmit[item['name']]</td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
<tr>
<td>model</td><td>this.formsSubmit[item['name']]</td>
</tr>
<tr>
<td>outModel</td><td></td>
</tr>
<tr>
<td>redList</td><td>this.redList[item['name']]</td>
</tr>
</table>
#### itemHeaderEdit

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>item</td><td></td>
</tr>
<tr>
<td>type</td><td></td>
</tr>
</table>
#### itemImgViewer

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>disabled</td><td>this.formsSubmit[item['name']]</td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
<tr>
<td>model</td><td></td>
</tr>
<tr>
<td>redList</td><td></td>
</tr>
</table>
#### itemLocationEditor

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>idselected</td><td></td>
</tr>
<tr>
<td>isChild</td><td></td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
</table>
#### itemLocationViewer

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>disabled</td><td>this.formsSubmit[item['name']]</td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
<tr>
<td>model</td><td>this.formsSubmit[item['name']]</td>
</tr>
<tr>
<td>redList</td><td>this.redList[item['name']]</td>
</tr>
</table>
#### itemRadioGroupViewver

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>disabled</td><td>this.formsSubmit[item['name']]</td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
<tr>
<td>model</td><td></td>
</tr>
<tr>
<td>redList</td><td></td>
</tr>
</table>
#### itemRadioListEditor

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>idselected</td><td></td>
</tr>
<tr>
<td>isChild</td><td></td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
</table>
#### itemRadioListGroupEditor

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>idselected</td><td></td>
</tr>
<tr>
<td>isChild</td><td></td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
</table>
#### itemRadioViewver

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>disabled</td><td>this.formsSubmit[item['name']]</td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
<tr>
<td>model</td><td></td>
</tr>
<tr>
<td>redList</td><td></td>
</tr>
</table>
#### itemSelectEditor

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>idselected</td><td></td>
</tr>
<tr>
<td>isChild</td><td></td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
</table>
#### itemSelectViewver

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>disabled</td><td>this.formsSubmit[item['name']]</td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
<tr>
<td>model</td><td>this.formsSubmit[item['name']]</td>
</tr>
<tr>
<td>redList</td><td>this.redList[item['name']]</td>
</tr>
</table>
#### itemSignatureSelector

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>idselected</td><td></td>
</tr>
<tr>
<td>isChild</td><td></td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
</table>
#### itemSignatureViewver

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>color</td><td></td>
</tr>
<tr>
<td>disabled</td><td>this.formsSubmit[item['name']]</td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
<tr>
<td>model</td><td>this.formsSubmit[item['name']]</td>
</tr>
<tr>
<td>parentname</td><td></td>
</tr>
<tr>
<td>redList</td><td>this.redList[item['name']]</td>
</tr>
</table>
#### itemSliderEditor

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>idselected</td><td></td>
</tr>
<tr>
<td>isChild</td><td></td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
</table>
#### itemSliderViewver

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>disabled</td><td>this.formsSubmit[item['name']]</td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
<tr>
<td>model</td><td></td>
</tr>
<tr>
<td>redList</td><td></td>
</tr>
</table>
#### itemTextEditor

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>idselected</td><td></td>
</tr>
<tr>
<td>isChild</td><td></td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
</table>
#### itemTextViewer

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>disabled</td><td>this.formsSubmit[item['name']]</td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
<tr>
<td>model</td><td>this.formsSubmit[item['name']]</td>
</tr>
<tr>
<td>redList</td><td>this.redList[item['name']]</td>
</tr>
</table>
#### itemTimeSelector

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>idselected</td><td></td>
</tr>
<tr>
<td>isChild</td><td></td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
</table>
#### itemTimeViewver

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>disabled</td><td>this.formsSubmit[item['name']]</td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
<tr>
<td>model</td><td>this.formsSubmit[item['name']]</td>
</tr>
<tr>
<td>redList</td><td>this.redList[item['name']]</td>
</tr>
</table>
#### ItemTitleSub

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>config</td><td></td>
</tr>
</table>
#### itemVideoCallEditor

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>idselected</td><td></td>
</tr>
<tr>
<td>isChild</td><td></td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
</table>
#### itemVideoCallViewer

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>disabled</td><td>this.formsSubmit[item['name']]</td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
<tr>
<td>model</td><td>this.formsSubmit[item['name']]</td>
</tr>
<tr>
<td>redList</td><td>this.redList[item['name']]</td>
</tr>
</table>
#### itemVideoCallViewerInEditionPage

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>disabled</td><td>this.formsSubmit[item['name']]</td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
<tr>
<td>model</td><td>this.formsSubmit[item['name']]</td>
</tr>
<tr>
<td>redList</td><td>this.redList[item['name']]</td>
</tr>
</table>
#### labelFieldMustBeFilled

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>item</td><td></td>
</tr>
<tr>
<td>name</td><td></td>
</tr>
<tr>
<td>text</td><td></td>
</tr>
</table>
#### listSelector

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>i</td><td></td>
</tr>
<tr>
<td>isAfolder</td><td></td>
</tr>
<tr>
<td>list</td><td></td>
</tr>
<tr>
<td>offsetObject</td><td></td>
</tr>
</table>
#### mdReader

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>data</td><td></td>
</tr>
</table>
#### menuVersion

#### monacoEditor

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>code</td><td></td>
</tr>
</table>
**events**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>onBlur</td><td></td>
</tr>
</table>
#### ngxTagInputCustomC8oForms

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>autocompleteItems</td><td></td>
</tr>
<tr>
<td>editableTag</td><td></td>
</tr>
<tr>
<td>errorMessages</td><td></td>
</tr>
<tr>
<td>inputtext</td><td></td>
</tr>
<tr>
<td>itemDisplayBy</td><td></td>
</tr>
<tr>
<td>itemIdentifyBy</td><td></td>
</tr>
<tr>
<td>items</td><td></td>
</tr>
<tr>
<td>keepOpen</td><td></td>
</tr>
<tr>
<td>maxItems</td><td></td>
</tr>
<tr>
<td>onlyFromAutocomplete</td><td></td>
</tr>
<tr>
<td>placeholder</td><td></td>
</tr>
<tr>
<td>removableTag</td><td></td>
</tr>
<tr>
<td>secondaryPlaceholder</td><td></td>
</tr>
<tr>
<td>showAutoCompleteDropdownIfEmpty</td><td></td>
</tr>
<tr>
<td>theme</td><td></td>
</tr>
<tr>
<td>validators</td><td></td>
</tr>
</table>
**events**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>ngxTagInputAdded</td><td></td>
</tr>
<tr>
<td>ngxTagInputBlured</td><td></td>
</tr>
<tr>
<td>ngxTagInputChanged</td><td></td>
</tr>
<tr>
<td>ngxTagInputEdited</td><td></td>
</tr>
<tr>
<td>ngxTagInputFocused</td><td></td>
</tr>
<tr>
<td>ngxTagInputNgModelChange</td><td></td>
</tr>
<tr>
<td>ngxTagInputPasted</td><td></td>
</tr>
<tr>
<td>ngxTagInputRemoved</td><td></td>
</tr>
<tr>
<td>ngxTagInputSelected</td><td></td>
</tr>
<tr>
<td>ngxTagInputValidationError</td><td></td>
</tr>
</table>
#### PopOverSourceCompletion

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>currentItem</td><td></td>
</tr>
<tr>
<td>keyName</td><td></td>
</tr>
</table>
#### searchableSelect

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>elems</td><td></td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
<tr>
<td>model</td><td></td>
</tr>
<tr>
<td>placeholder</td><td></td>
</tr>
<tr>
<td>value</td><td></td>
</tr>
</table>
#### sharedDropIndicator

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>action</td><td></td>
</tr>
<tr>
<td>card</td><td></td>
</tr>
<tr>
<td>i</td><td></td>
</tr>
<tr>
<td>id</td><td></td>
</tr>
</table>
#### sharedDropIndicatorSelector

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>folder</td><td></td>
</tr>
</table>
#### SharedGrabHeader

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>childIntoGrabHeader</td><td></td>
</tr>
</table>
#### sharedHeaderMenu

#### SharedHeaderStats

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>element</td><td></td>
</tr>
<tr>
<td>show</td><td></td>
</tr>
<tr>
<td>total</td><td></td>
</tr>
</table>
#### sharedLabelElem

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>item</td><td></td>
</tr>
<tr>
<td>setStyle</td><td></td>
</tr>
</table>
#### sharedNocodeDatabase

#### sharedQuestionElem

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>item</td><td></td>
</tr>
</table>
#### sharedStatsCheckbox

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>element</td><td></td>
</tr>
<tr>
<td>total</td><td></td>
</tr>
<tr>
<td>value</td><td></td>
</tr>
</table>
#### sharedStatsCheckboxGroup

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>element</td><td></td>
</tr>
<tr>
<td>total</td><td></td>
</tr>
<tr>
<td>value</td><td></td>
</tr>
</table>
#### sharedStatsFiles

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>element</td><td></td>
</tr>
<tr>
<td>value</td><td></td>
</tr>
</table>
#### sharedStatsImg

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>element</td><td></td>
</tr>
<tr>
<td>value</td><td></td>
</tr>
</table>
#### sharedStatsInputText

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>element</td><td></td>
</tr>
<tr>
<td>value</td><td></td>
</tr>
</table>
#### sharedStatsLocation

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>element</td><td></td>
</tr>
<tr>
<td>value</td><td></td>
</tr>
</table>
#### sharedStatsRadio

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>element</td><td></td>
</tr>
<tr>
<td>total</td><td></td>
</tr>
<tr>
<td>value</td><td></td>
</tr>
</table>
#### SharedTabs

#### SharedVersion

#### switchItemEdition

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>currentItem</td><td></td>
</tr>
<tr>
<td>idselected</td><td></td>
</tr>
<tr>
<td>isChild</td><td></td>
</tr>
</table>
#### switchItemViewer

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>currentItem</td><td></td>
</tr>
<tr>
<td>currentModel</td><td></td>
</tr>
<tr>
<td>currentRedList</td><td></td>
</tr>
<tr>
<td>disabled</td><td></td>
</tr>
</table>
#### treeview

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>currentElement</td><td></td>
</tr>
<tr>
<td>graphic</td><td></td>
</tr>
<tr>
<td>handler</td><td></td>
</tr>
<tr>
<td>name</td><td></td>
</tr>
<tr>
<td>path</td><td></td>
</tr>
<tr>
<td>showHeader</td><td></td>
</tr>
<tr>
<td>tree</td><td></td>
</tr>
<tr>
<td>treebuiltin</td><td></td>
</tr>
</table>
#### treeviewContent

if this compenent is renamed it must be also renamed in editorPage (edit page class)

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>currentElement</td><td></td>
</tr>
<tr>
<td>graphic</td><td></td>
</tr>
<tr>
<td>handler</td><td></td>
</tr>
<tr>
<td>name</td><td></td>
</tr>
<tr>
<td>path</td><td></td>
</tr>
<tr>
<td>showHeader</td><td></td>
</tr>
<tr>
<td>tree</td><td></td>
</tr>
<tr>
<td>treebuiltin</td><td></td>
</tr>
</table>


