


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
- [Sequences](#sequences)
    - [AddUser](#adduser)
    - [admin_get_current_dependencies](#admin_get_current_dependencies)
    - [admin_group_delete](#admin_group_delete)
    - [admin_group_get](#admin_group_get)
    - [admin_group_upsert](#admin_group_upsert)
    - [admin_group_upsert_bulk](#admin_group_upsert_bulk)
    - [admin_groups_delete](#admin_groups_delete)
    - [admin_groups_get](#admin_groups_get)
    - [admin_groups_get_by_user_id](#admin_groups_get_by_user_id)
    - [admin_groups_patch](#admin_groups_patch)
    - [admin_groups_post](#admin_groups_post)
    - [admin_stats_getCountAnswersPerDay](#admin_stats_getcountanswersperday)
    - [admin_stats_getCountAnswersPerForm](#admin_stats_getcountanswersperform)
    - [admin_stats_getCumulatedAnswersPerDay](#admin_stats_getcumulatedanswersperday)
    - [admin_stats_getCumulatedFormsPerDay](#admin_stats_getcumulatedformsperday)
    - [admin_stats_getDocumentById](#admin_stats_getdocumentbyid)
    - [admin_stats_getFormsCountPerDay](#admin_stats_getformscountperday)
    - [admin_stats_getMoreThan5versionsOwners](#admin_stats_getmorethan5versionsowners)
    - [admin_stats_getTopAnswersForms](#admin_stats_gettopanswersforms)
    - [admin_stats_getTopPublishedComplex](#admin_stats_gettoppublishedcomplex)
    - [admin_stats_getTopPublishers](#admin_stats_gettoppublishers)
    - [admin_stats_home](#admin_stats_home)
    - [admin_user_add_to_group](#admin_user_add_to_group)
    - [admin_user_delete_from_group](#admin_user_delete_from_group)
    - [admin_user_patch](#admin_user_patch)
    - [admin_user_post](#admin_user_post)
    - [admin_users_delete](#admin_users_delete)
    - [admin_users_get](#admin_users_get)
    - [admin_users_get_by_group](#admin_users_get_by_group)
    - [admin_users_get_by_group_v2](#admin_users_get_by_group_v2)
    - [admin_users_get_by_id](#admin_users_get_by_id)
    - [admin_users_of_group_get](#admin_users_of_group_get)
    - [admin_users_patch](#admin_users_patch)
    - [admin_users_post_in_groups](#admin_users_post_in_groups)
    - [admin_users_remove_from_groups](#admin_users_remove_from_groups)
    - [APIV2_checkForPendingInvitationNewUsers](#apiv2_checkforpendinginvitationnewusers)
    - [APIV2_CleanThumbnailsWallpapersB64](#apiv2_cleanthumbnailswallpapersb64)
    - [APIV2_createEmptyFolder](#apiv2_createemptyfolder)
    - [APIV2_createIndexes](#apiv2_createindexes)
    - [APIV2_csv](#apiv2_csv)
    - [APIV2_deleteDocument](#apiv2_deletedocument)
    - [APIV2_deleteResponses](#apiv2_deleteresponses)
    - [APIV2_DuplicateFormulaireDocument](#apiv2_duplicateformulairedocument)
    - [APIV2_Execute_Sequences](#apiv2_execute_sequences)
    - [APIV2_ExecuteView](#apiv2_executeview)
    - [APIV2_GeneratePwaAsset](#apiv2_generatepwaasset)
    - [APIV2_getAttachments](#apiv2_getattachments)
    - [APIV2_getCSVkey](#apiv2_getcsvkey)
    - [APIV2_getDocument](#apiv2_getdocument)
    - [APIV2_getGroupsDistinct](#apiv2_getgroupsdistinct)
    - [APIV2_getKnownUsersFormatted](#apiv2_getknownusersformatted)
    - [APIV2_GetManageAccessRights](#apiv2_getmanageaccessrights)
    - [APIV2_getOwnerShip](#apiv2_getownership)
    - [APIV2_getPWA](#apiv2_getpwa)
    - [APIV2_getResponses](#apiv2_getresponses)
    - [APIV2_mapper_redirect](#apiv2_mapper_redirect)
    - [APIV2_NotifyUsersSharing](#apiv2_notifyuserssharing)
    - [APIV2_OverrideUserSettings](#apiv2_overrideusersettings)
    - [APIV2_postResponse](#apiv2_postresponse)
    - [APIV2_Publish](#apiv2_publish)
    - [APIV2_RebuildC8oGrp](#apiv2_rebuildc8ogrp)
    - [APIV2_SetManageAccessRights](#apiv2_setmanageaccessrights)
    - [APIV2_setOwnerShip](#apiv2_setownership)
    - [APIV2_SetSharedAnonymous](#apiv2_setsharedanonymous)
    - [APIV2_setUserAdmin](#apiv2_setuseradmin)
    - [APIV2_updateFormulaireDocument](#apiv2_updateformulairedocument)
    - [APIV2_updateTags](#apiv2_updatetags)
    - [b](#b)
    - [BaserowAccount](#baserowaccount)
    - [BaserowAccountGet](#baserowaccountget)
    - [BuildCsvByFormId](#buildcsvbyformid)
    - [ChangePassword](#changepassword)
    - [ChangeUserEditingRights](#changeusereditingrights)
    - [CheckForPendingInvitationNewUsers](#checkforpendinginvitationnewusers)
    - [checkIfDeleteIsPermitted](#checkifdeleteispermitted)
    - [CreatePublicUserAddGroupe](#createpublicuseraddgroupe)
    - [data_integrity_accessRights_check_between_edition_published_pwa_doc_anonymous](#data_integrity_accessrights_check_between_edition_published_pwa_doc_anonymous)
    - [data_integrity_collabsResponse_check_between_edition_published](#data_integrity_collabsresponse_check_between_edition_published)
    - [data_integrity_collabsResponse_check_between_forms_and_response](#data_integrity_collabsresponse_check_between_forms_and_response)
    - [data_integrity_collabsResponse_repair_between_forms_and_response](#data_integrity_collabsresponse_repair_between_forms_and_response)
    - [delete_all_templates](#delete_all_templates)
    - [DeleteB64FromExistingResponses](#deleteb64fromexistingresponses)
    - [DeleteUser](#deleteuser)
    - [downloadFile](#downloadfile)
    - [Execute_Sequences](#execute_sequences)
    - [ForgotPassword](#forgotpassword)
    - [GeneratePwaAsset](#generatepwaasset)
    - [getAnonymousForm](#getanonymousform)
    - [getAvailableAuthModeForLogin](#getavailableauthmodeforlogin)
    - [getBrevoChatId](#getbrevochatid)
    - [getConvertigoUrl](#getconvertigourl)
    - [getCSVDefaultCharacterSet](#getcsvdefaultcharacterset)
    - [getCurrentUserSettings](#getcurrentusersettings)
    - [getGDRPmenu](#getgdrpmenu)
    - [getGDRPtoast](#getgdrptoast)
    - [getInactiveForms](#getinactiveforms)
    - [getKnownUsers](#getknownusers)
    - [GetLanguage](#getlanguage)
    - [GetSequences](#getsequences)
    - [getTinyMaxs](#gettinymaxs)
    - [GroupsOf](#groupsof)
    - [HasProject](#hasproject)
    - [importTemplates](#importtemplates)
    - [initAllPWAS](#initallpwas)
    - [InsertNotifIntoCurrentUser](#insertnotifintocurrentuser)
    - [listAllPWAsUrls](#listallpwasurls)
    - [Login](#login)
    - [LoginAD](#loginad)
    - [LoginGoogle](#logingoogle)
    - [LoginLinkedIn](#loginlinkedin)
    - [LoginMicrosoft](#loginmicrosoft)
    - [LoginOpenID](#loginopenid)
    - [Logout](#logout)
    - [MIgrateToAllPWA](#migratetoallpwa)
    - [MigrationApiV2](#migrationapiv2)
    - [NotifyNewUsersSharing](#notifynewuserssharing)
    - [NotifyResponseByMail](#notifyresponsebymail)
    - [NotifyUsersSharing](#notifyuserssharing)
    - [Ping](#ping)
    - [RemoveNewUserSharing](#removenewusersharing)
    - [RemoveUserFromGroup](#removeuserfromgroup)
    - [SetLanguage](#setlanguage)
    - [SetUserInGroup](#setuseringroup)
    - [submitResponseAnonymous](#submitresponseanonymous)
    - [usersOf](#usersof)
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
            - [PostDocument1](#postdocument1)
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
            - [PostDocumentJsonBaseOverride](#postdocumentjsonbaseoverride)
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
            - [SetLanguage](#setlanguage-1)
    - [c8oforms_response_fs](#c8oforms_response_fs)
        - [Transactions](#transactions-1)
            - [AllDocs](#alldocs)
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
            - [GetViewNotOnMapOnly](#getviewnotonmaponly)
            - [PostBulkDocumentsMergeOverrideGrp](#postbulkdocumentsmergeoverridegrp)
            - [PostDocument](#postdocument-1)
            - [PostDocumentAttachmentB64IntoField](#postdocumentattachmentb64intofield)
            - [PostDocumentJBASE](#postdocumentjbase)
            - [PostDocumentOverride](#postdocumentoverride)
            - [PurgeDatabase](#purgedatabase-1)
            - [PutDocumentAttachment](#putdocumentattachment-1)
            - [PutDocumentAttachmentFromFile](#putdocumentattachmentfromfile-1)
    - [c8ofullsyncgrp](#c8ofullsyncgrp)
        - [Transactions](#transactions-2)
            - [GetGroupsDistinct](#getgroupsdistinct)
            - [GetServerInfo](#getserverinfo-2)
- [Rest Web Service](#rest-web-service)
    - [Mappings](#mappings)
        - [/forms/export/{id}](#formsexport{id})
            - [Operations](#operations)
                - [GetOperation](#getoperation)
- [Convertigo Forms Builder](#convertigo-forms-builder)
    - [Pages](#pages)
        - [adminDashboardDetail](#admindashboarddetail)
        - [adminDashboardHome](#admindashboardhome)
        - [adminDashboardUsers](#admindashboardusers)
        - [adminDashboardUsersWithinGroups](#admindashboarduserswithingroups)
        - [aiChat](#aichat)
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
        - [ModalEditImage](#modaleditimage)
        - [modalVideo](#modalvideo)
        - [NetworkStatus](#networkstatus)
        - [Page](#page)
        - [PopOverInputs](#popoverinputs)
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
        - [checkAndRegister](#checkandregister)
        - [checkForDuplicate](#checkforduplicate)
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
        - [popOverShareForm](#popovershareform)
        - [popOverThumnail](#popoverthumnail)
        - [popOverTransferOwnerShip](#popovertransferownership)
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
        - [syncAndUpdateGetOnPull](#syncandupdategetonpull)
        - [tickAction](#tickaction)
        - [UpdateFunctionsToBeCalledToDataSource](#updatefunctionstobecalledtodatasource)
        - [updateState](#updatestate)
        - [ZXing_sa_forms](#zxing_sa_forms)
    - [Shared Components](#shared-components)
        - [addGroupForm](#addgroupform)
        - [addUserForm](#adduserform)
        - [addUserToGroupForm](#addusertogroupform)
        - [cardSelector](#cardselector)
        - [chooseIcon](#chooseicon)
        - [colorPicker](#colorpicker)
        - [conditiongoToPageIf](#conditiongotopageif)
        - [conditiongoToPageIfPrev](#conditiongotopageifprev)
        - [conditionVisibleIf](#conditionvisibleif)
        - [conditionVisibleIfPrev](#conditionvisibleifprev)
        - [datasource](#datasource)
        - [dataSourceEditor](#datasourceeditor)
        - [dataSourceEditor_GridRow_GridColSourcePicker_Group](#datasourceeditor_gridrow_gridcolsourcepicker_group)
        - [dataSourceEditorDescription](#datasourceeditordescription)
        - [dataviz](#dataviz)
        - [datavizHolder](#datavizholder)
        - [documentationPanel](#documentationpanel)
        - [DraggableElementActionPalette](#draggableelementactionpalette)
        - [DraggableElementApiPalette](#draggableelementapipalette)
        - [editorToolbarButton](#editortoolbarbutton)
        - [getApplicationDetail](#getapplicationdetail)
        - [getUserGroupsDetail](#getusergroupsdetail)
        - [inputMultiVal](#inputmultival)
        - [inputTextAndField](#inputtextandfield)
        - [itemActionBusinessLogicEditor](#itemactionbusinesslogiceditor)
        - [itemActionBusinessLogicViewer](#itemactionbusinesslogicviewer)
        - [itemActionSubmitEditor](#itemactionsubmiteditor)
        - [itemActionSubmitViewer](#itemactionsubmitviewer)
        - [itemAddCheckBoxOrRadio](#itemaddcheckboxorradio)
        - [itemAddRowToLocalGridActionEditor](#itemaddrowtolocalgridactioneditor)
        - [itemAddRowToLocalGridActionViewer](#itemaddrowtolocalgridactionviewer)
        - [itemBarcodeSelector](#itembarcodeselector)
        - [itemBarcodeViewver](#itembarcodeviewver)
        - [itemButtonEditor](#itembuttoneditor)
        - [itemButtonViewer](#itembuttonviewer)
        - [itemCameraSelector](#itemcameraselector)
        - [itemCardEditor](#itemcardeditor)
        - [itemCardEditor_Elem](#itemcardeditor_elem)
        - [itemCardEditorViewer](#itemcardeditorviewer)
        - [itemCardEditorViewer_Elem](#itemcardeditorviewer_elem)
        - [itemCardViewer](#itemcardviewer)
        - [itemCardViewer_Elem](#itemcardviewer_elem)
        - [itemChartEditor](#itemcharteditor)
        - [itemChartViewer](#itemchartviewer)
        - [itemCheckboxEditor](#itemcheckboxeditor)
        - [itemCheckboxGroupEditor](#itemcheckboxgroupeditor)
        - [itemCheckboxGroupViewer](#itemcheckboxgroupviewer)
        - [itemCheckboxGroupViewerConditions](#itemcheckboxgroupviewerconditions)
        - [itemCheckboxViewer](#itemcheckboxviewer)
        - [itemCheckboxViewerConditions](#itemcheckboxviewerconditions)
        - [itemConditionEditor](#itemconditioneditor)
        - [itemConditionEditor_Elem](#itemconditioneditor_elem)
        - [itemConditionEditorViewer](#itemconditioneditorviewer)
        - [itemConditionViewer_Elem](#itemconditionviewer_elem)
        - [itemDateSelector](#itemdateselector)
        - [itemDateTimeViewver](#itemdatetimeviewver)
        - [itemDescriptionEditor](#itemdescriptioneditor)
        - [itemDescriptionViewer](#itemdescriptionviewer)
        - [itemFileSelector](#itemfileselector)
        - [itemFileViewver](#itemfileviewver)
        - [itemForLoopEditor1](#itemforloopeditor1)
        - [itemForLoopEditor_Elem1](#itemforloopeditor_elem1)
        - [itemForLoopEditorViewer1](#itemforloopeditorviewer1)
        - [itemForLoopEditorViewer_Elem1](#itemforloopeditorviewer_elem1)
        - [itemGridEditor](#itemgrideditor)
        - [itemGridViewer](#itemgridviewer)
        - [itemHeaderEdit](#itemheaderedit)
        - [itemImgViewer](#itemimgviewer)
        - [itemLayoutConfigCols](#itemlayoutconfigcols)
        - [itemLayoutEditor](#itemlayouteditor)
        - [itemLayoutEditor_Elem](#itemlayouteditor_elem)
        - [itemLayoutEditor_Params](#itemlayouteditor_params)
        - [itemLayoutEditorViewer](#itemlayouteditorviewer)
        - [itemLayoutViewer](#itemlayoutviewer)
        - [itemLayoutViewer_Elem](#itemlayoutviewer_elem)
        - [itemLocationEditor](#itemlocationeditor)
        - [itemLocationViewer](#itemlocationviewer)
        - [itemMapEditor](#itemmapeditor)
        - [itemMapViewer](#itemmapviewer)
        - [itemNavigateAppActionEditor](#itemnavigateappactioneditor)
        - [itemNavigateAppActionViewer](#itemnavigateappactionviewer)
        - [itemNavigatePageActionEditor](#itemnavigatepageactioneditor)
        - [itemNavigatePageActionViewer](#itemnavigatepageactionviewer)
        - [itemRadioGroupViewver](#itemradiogroupviewver)
        - [itemRadioListEditor](#itemradiolisteditor)
        - [itemRadioListGroupEditor](#itemradiolistgroupeditor)
        - [itemRadioViewver](#itemradioviewver)
        - [itemRadioViewver_Tag_Div_RadioList_Directive2_Directive2](#itemradioviewver_tag_div_radiolist_directive2_directive2)
        - [itemRefreshGridActionEditor](#itemrefreshgridactioneditor)
        - [itemRefreshGridActionViewer](#itemrefreshgridactionviewer)
        - [itemRemoveRowFromLocalGridActionEditor](#itemremoverowfromlocalgridactioneditor)
        - [itemRemoveRowFromLocalGridActionViewer](#itemremoverowfromlocalgridactionviewer)
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
        - [itemToastActionEditor](#itemtoastactioneditor)
        - [itemToastActionViewer](#itemtoastactionviewer)
        - [itemVideoCallEditor](#itemvideocalleditor)
        - [itemVideoCallViewer](#itemvideocallviewer)
        - [itemVideoCallViewerInEditionPage](#itemvideocallviewerineditionpage)
        - [labelFieldMustBeFilled](#labelfieldmustbefilled)
        - [listSelector](#listselector)
        - [mdReader](#mdreader)
        - [menuVersion](#menuversion)
        - [monacoEditor](#monacoeditor)
        - [moveUserToGroupForm](#moveusertogroupform)
        - [ngxTagInputCustomC8oForms](#ngxtaginputcustomc8oforms)
        - [PopoverFilters](#popoverfilters)
        - [PopoverListPagesAndFlows](#popoverlistpagesandflows)
        - [PopoverSort](#popoversort)
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
        - [SharedStyleMarginEditor](#sharedstylemargineditor)
        - [SharedTabs](#sharedtabs)
        - [SharedVersion](#sharedversion)
        - [switchItemEdition](#switchitemedition)
        - [switchItemViewer](#switchitemviewer)
        - [treeview](#treeview)
        - [treeviewContent](#treeviewcontent)
        - [updateGroupAccessRights](#updategroupaccessrights)


## Installation

1. In your Convertigo Studio use `File->Import->Convertigo->Convertigo Project` and hit the `Next` button
2. In the dialog `Project remote URL` field, paste the text below:
   <table>
     <tr><td>Usage</td><td>Click the copy button</td></tr>
     <tr><td>To contribute</td><td>

     ```
     C8Oforms=git@github.com:convertigo/C8oForms.git:branch=hotfix/2.1.11
     ```
     </td></tr>
     <tr><td>To simply use</td><td>

     ```
     C8Oforms=git@github.com:convertigo/C8oForms/archive/hotfix/2.1.11.zip
     ```
     </td></tr>
    </table>
3. Click the `Finish` button. This will automatically import the __C8Oforms__ project


## Sequences

### AddUser

Add user.
Creates or updates a user record with default rights and metadata.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>displayName</td><td>should be en/fr/it/es</td>
</tr>
<tr>
<td>editing_rights</td><td>Rights JSON used when patching collaborators.</td>
</tr>
<tr>
<td>language</td><td>should be en/fr/it/es</td>
</tr>
<tr>
<td>name</td><td>should be en/fr/it/es</td>
</tr>
<tr>
<td>password</td><td>Password submitted by the user.</td>
</tr>
<tr>
<td>published_First</td><td>True when first publication should be marked.</td>
</tr>
<tr>
<td>surname</td><td>should be en/fr/it/es</td>
</tr>
<tr>
<td>user</td><td>should be a valid email</td>
</tr>
</table>
### admin_get_current_dependencies

List current dependencies.
Returns the currently loaded Convertigo project dependencies.

### admin_group_delete

Delete group.
Checks admin rights then deletes the group document from CouchDB.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_doc_id</td><td>Document identifier sent to the DeleteDocument transaction.</td>
</tr>
</table>
### admin_group_get

Get group.
Retrieves a specific group definition with its members.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_doc_id</td><td>Document identifier sent to the DeleteDocument transaction.</td>
</tr>
</table>
### admin_group_upsert

Upsert group.
Creates or updates a group definition and metadata.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>meta</td><td>JSON metadata payload associated with the operation.</td>
</tr>
</table>
### admin_group_upsert_bulk

Bulk upsert groups.
Upserts multiple group definitions in one call.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>docs</td><td>Collection of documents supplied to the maintenance job.</td>
</tr>
<tr>
<td>right</td><td>Single right entry to grant or revoke.</td>
</tr>
<tr>
<td>value</td><td></td>
</tr>
</table>
### admin_groups_delete

Delete groups.
Deletes several group documents after admin validation.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>meta</td><td></td>
</tr>
</table>
### admin_groups_get

List groups.
Returns all groups along with summary data.

### admin_groups_get_by_user_id

Groups by user.
Lists groups that contain the requested user.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>user</td><td></td>
</tr>
</table>
### admin_groups_patch

Patch groups.
Applies partial updates to group definitions.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>meta</td><td></td>
</tr>
</table>
### admin_groups_post

Create group.
Creates a new group from admin inputs.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>meta</td><td></td>
</tr>
</table>
### admin_stats_getCountAnswersPerDay

Answers per day.
Computes daily counts of submitted answers for admin dashboards.

### admin_stats_getCountAnswersPerForm

Answers per form.
Counts answers per form for reporting.

### admin_stats_getCumulatedAnswersPerDay

Cumulated answers per day.
Builds cumulative answer counts day by day.

### admin_stats_getCumulatedFormsPerDay

Cumulated forms per day.
Computes cumulative counts of created forms per day.

### admin_stats_getDocumentById

Get document by id.
Retrieves any document by id for admin diagnosis.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>id</td><td>Generic identifier for the targeted resource.</td>
</tr>
</table>
### admin_stats_getFormsCountPerDay

Forms per day.
Counts created forms per day for admin charts.

### admin_stats_getMoreThan5versionsOwners

Owners with many versions.
Lists owners whose forms have more than five versions.

### admin_stats_getTopAnswersForms

Top answered forms.
Returns forms ranked by total answers.

### admin_stats_getTopPublishedComplex

Top published complex forms.
Ranks complex published forms using admin metrics.

### admin_stats_getTopPublishers

Top publishers.
Lists top publishers by volume of forms.

### admin_stats_home

Admin stats home.
Aggregates various stats for the admin dashboard.

### admin_user_add_to_group

Add user to group.
Adds a user to a group through admin APIs.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>meta</td><td></td>
</tr>
</table>
### admin_user_delete_from_group

Remove user from group.
Removes a user from a group through admin APIs.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>meta</td><td></td>
</tr>
</table>
### admin_user_patch

Patch user.
Applies partial updates to a user profile.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>meta</td><td></td>
</tr>
</table>
### admin_user_post

Create user.
Creates a user via the admin interface.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>meta</td><td></td>
</tr>
</table>
### admin_users_delete

Delete users.
Deletes multiple user accounts in one admin call.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>docs</td><td></td>
</tr>
</table>
### admin_users_get

List users.
Lists users with pagination and filters for admin views.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>admin_readonly</td><td>Flag forcing admin view access in read only mode.</td>
</tr>
<tr>
<td>editing_apps_default_rights</td><td>Default editing rights for applications.</td>
</tr>
<tr>
<td>formulas_default_rights</td><td>Default rights for formula based widgets.</td>
</tr>
<tr>
<td>no_code_db_default_rights</td><td>Default rights for no-code database elements.</td>
</tr>
<tr>
<td>publication</td><td>Publication flag or structure applied to the form.</td>
</tr>
</table>
### admin_users_get_by_group

Users by group.
Lists users belonging to a specific group.

### admin_users_get_by_group_v2

Users by group v2.
Improved list of users for a given group with roles.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>admin_readonly</td><td>Flag forcing admin view access in read only mode.</td>
</tr>
<tr>
<td>editing_apps_default_rights</td><td>Default editing rights for applications.</td>
</tr>
<tr>
<td>formulas_default_rights</td><td>Default rights for formula based widgets.</td>
</tr>
<tr>
<td>no_code_db_default_rights</td><td>Default rights for no-code database elements.</td>
</tr>
<tr>
<td>publication</td><td>Publication flag or structure applied to the form.</td>
</tr>
<tr>
<td>targetGroup</td><td>Group identifier receiving the user.</td>
</tr>
</table>
### admin_users_get_by_id

Get user by id.
Retrieves a single user's details by id.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>c8oAcl</td><td></td>
</tr>
</table>
### admin_users_of_group_get

Groups memberships.
Returns group memberships for the requested user.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>group</td><td>Target group identifier.</td>
</tr>
</table>
### admin_users_patch

Patch users.
Applies partial updates to multiple users.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>docs</td><td>Collection of documents supplied to the maintenance job.</td>
</tr>
<tr>
<td>right</td><td>Single right entry to grant or revoke.</td>
</tr>
<tr>
<td>value</td><td></td>
</tr>
</table>
### admin_users_post_in_groups

Add users to groups.
Adds several users to one or more groups.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>groups</td><td>List of groups to add or remove.</td>
</tr>
<tr>
<td>users</td><td></td>
</tr>
</table>
### admin_users_remove_from_groups

Remove users from groups.
Removes multiple users from listed groups.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>groups</td><td>List of groups to add or remove.</td>
</tr>
<tr>
<td>users</td><td></td>
</tr>
</table>
### APIV2_checkForPendingInvitationNewUsers

Check pending invites.
Looks for pending invitations created for new users in API v2 flows.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>email</td><td>Email address targeted by the sequence.</td>
</tr>
<tr>
<td>grp</td><td>Group metadata object to update.</td>
</tr>
</table>
### APIV2_CleanThumbnailsWallpapersB64

Clean thumbnail B64.
Scans forms for base64 thumbnail/wallpaper blobs and optionally strips them in safe batches.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>chunkSize</td><td>Number of documents fetched per CouchDB page while iterating.</td>
</tr>
<tr>
<td>execute</td><td>Set to true to remove the Base64 fields instead of only listing impacted documents.</td>
</tr>
</table>
### APIV2_createEmptyFolder

Create empty folder.
Creates a folder placeholder document for organising forms.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>meta</td><td></td>
</tr>
</table>
### APIV2_createIndexes

Ensure API indexes.
Creates or updates required CouchDB indexes for API v2 sequences.

### APIV2_csv

Export responses CSV.
Builds a CSV stream for responses while respecting header order and privacy.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>c</td><td>column_name</td>
</tr>
<tr>
<td>e</td><td>encoding</td>
</tr>
<tr>
<td>f</td><td>formId</td>
</tr>
<tr>
<td>k</td><td>formId</td>
</tr>
<tr>
<td>l</td><td>lang</td>
</tr>
<tr>
<td>li</td><td>formId</td>
</tr>
<tr>
<td>n</td><td>name</td>
</tr>
<tr>
<td>o</td><td>offset</td>
</tr>
<tr>
<td>p</td><td>privacy</td>
</tr>
<tr>
<td>s</td><td>separator</td>
</tr>
<tr>
<td>se</td><td>string_separator</td>
</tr>
<tr>
<td>sk</td><td>formId</td>
</tr>
<tr>
<td>v</td><td>version</td>
</tr>
</table>
### APIV2_deleteDocument

Delete form document.
Removes a form draft or folder after validating ownership.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>fromResponse</td><td>Indicates the fetch originates from response doc context.</td>
</tr>
<tr>
<td>id</td><td>Generic identifier for the targeted resource.</td>
</tr>
<tr>
<td>rev</td><td>Document revision ensuring optimistic locking.</td>
</tr>
</table>
### APIV2_deleteResponses

Delete form responses.
Purges stored responses for a form and logs errors.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>id</td><td>Generic identifier for the targeted resource.</td>
</tr>
<tr>
<td>version</td><td></td>
</tr>
</table>
### APIV2_DuplicateFormulaireDocument

Duplicate draft form.
Validates ACLs, clones attachments, and resets metadata to produce a new draft document.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_id</td><td></td>
</tr>
</table>
### APIV2_Execute_Sequences

Run API v2 jobs.
Dispatches API v2 maintenance sequences sequentially or asynchronously.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>attachments</td><td></td>
</tr>
<tr>
<td>attachments_meta</td><td></td>
</tr>
<tr>
<td>doc</td><td></td>
</tr>
<tr>
<td>execute_Async</td><td>True to run the maintenance job asynchronously.</td>
</tr>
</table>
### APIV2_ExecuteView

Execute forms view.
Builds Mango queries with filters and ACLs to list forms or responses.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>dynamicParams</td><td>JSON encoded dynamic filter parameters.</td>
</tr>
<tr>
<td>fromResponses</td><td>True when targeting the responses database.</td>
</tr>
<tr>
<td>target</td><td>Target identifier for the action.</td>
</tr>
</table>
### APIV2_GeneratePwaAsset

Generate PWA assets.
Transforms uploaded files into PWA thumbnails or wallpapers and updates metadata.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>from_start_server</td><td>True when invocation happens from server start hook.</td>
</tr>
<tr>
<td>meta</td><td></td>
</tr>
</table>
### APIV2_getAttachments

Fetch form attachments.
Streams document attachments as base64 payloads with metadata.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>element</td><td></td>
</tr>
<tr>
<td>formId</td><td>Identifier of the form being handled.</td>
</tr>
<tr>
<td>version</td><td>Version string applied to the project or document.</td>
</tr>
</table>
### APIV2_getCSVkey

Get CSV key.
Returns the CSV export key used to secure download links.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>id</td><td>Generic identifier for the targeted resource.</td>
</tr>
<tr>
<td>secretCSV</td><td>Shared secret protecting CSV export endpoints.</td>
</tr>
</table>
### APIV2_getDocument

Fetch form document.
Retrieves form data with ACL filtering and computed flags.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>exportForm</td><td>Form identifier used for export routines.</td>
</tr>
<tr>
<td>fromResponse</td><td>Indicates the fetch originates from response doc context.</td>
</tr>
<tr>
<td>id</td><td>Generic identifier for the targeted resource.</td>
</tr>
<tr>
<td>k</td><td>Legacy key parameter forwarded to sub sequences.</td>
</tr>
<tr>
<td>rev</td><td>Document revision ensuring optimistic locking.</td>
</tr>
<tr>
<td>secretCSV</td><td>Shared secret protecting CSV export endpoints.</td>
</tr>
<tr>
<td>target</td><td>Target identifier for the action.</td>
</tr>
</table>
### APIV2_getGroupsDistinct

### APIV2_getKnownUsersFormatted

List known users.
Formats known users for UI selectors including groups and badges.

### APIV2_GetManageAccessRights

Fetch manage rights.
Reads and formats the manage-access-rights document for a form.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>collab</td><td></td>
</tr>
<tr>
<td>id</td><td>Generic identifier for the targeted resource.</td>
</tr>
<tr>
<td>showAllGroups</td><td>Flag allowing non-admin users to list every group.</td>
</tr>
</table>
### APIV2_getOwnerShip

Get ownership info.
Returns owner and collaborators metadata for a form.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>id</td><td></td>
</tr>
</table>
### APIV2_getPWA

Get PWA package.
Provides published PWA metadata and download paths.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>id</td><td></td>
</tr>
</table>
### APIV2_getResponses

Fetch API responses.
Retrieves paginated responses with filtering, formatting and attachments.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>archive</td><td>True to mark the form as archived.</td>
</tr>
<tr>
<td>csv</td><td>CSV content or configuration passed to the sequence.</td>
</tr>
<tr>
<td>element</td><td>Element identifier inside the document.</td>
</tr>
<tr>
<td>formId</td><td>Identifier of the form being handled.</td>
</tr>
<tr>
<td>k</td><td></td>
</tr>
<tr>
<td>meta</td><td>JSON metadata payload associated with the operation.</td>
</tr>
<tr>
<td>summary</td><td>Summary text displayed in notifications.</td>
</tr>
<tr>
<td>version</td><td>Version string applied to the project or document.</td>
</tr>
</table>
### APIV2_mapper_redirect

Redirect mapper call.
Rebuilds parameters and returns a 302 redirect to the target sequence.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>targetSequence</td><td></td>
</tr>
</table>
### APIV2_NotifyUsersSharing

Notify shared users.
Sends sharing notifications to collaborators and tracks delivery status.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>meta</td><td>JSON metadata payload associated with the operation.</td>
</tr>
<tr>
<td>smtpAuthType</td><td>SMTP authentication mechanism to use.</td>
</tr>
<tr>
<td>smtpPassword</td><td>SMTP account password.</td>
</tr>
<tr>
<td>smtpPort</td><td>SMTP server port.</td>
</tr>
<tr>
<td>smtpServer</td><td>SMTP server hostname.</td>
</tr>
<tr>
<td>smtpUsername</td><td>SMTP account username.</td>
</tr>
<tr>
<td>sSender</td><td>Sender email displayed in notifications.</td>
</tr>
<tr>
<td>sslProtocols</td><td>Allowed SSL protocols list for SMTP connections.</td>
</tr>
<tr>
<td>xslFilepath</td><td>XSL file path needed for email rendering.</td>
</tr>
</table>
### APIV2_OverrideUserSettings

Override user settings.
Merges provided overrides into user settings while preserving explicit false values.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>meta</td><td></td>
</tr>
</table>
### APIV2_postResponse

Submit API response.
Validates, normalises and stores a response coming from the PWA.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>files</td><td></td>
</tr>
<tr>
<td>id</td><td>Generic identifier for the targeted resource.</td>
</tr>
<tr>
<td>meta</td><td>JSON metadata payload associated with the operation.</td>
</tr>
</table>
### APIV2_Publish

Publish form.
Promotes a draft, regenerates its PWA and synchronises publication metadata.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>file</td><td>Binary file content processed by the sequence.</td>
</tr>
<tr>
<td>id</td><td>Generic identifier for the targeted resource.</td>
</tr>
<tr>
<td>meta</td><td>JSON metadata payload associated with the operation.</td>
</tr>
<tr>
<td>rev</td><td>Document revision ensuring optimistic locking.</td>
</tr>
</table>
### APIV2_RebuildC8oGrp

Rebuild c8oGrp flags.
Audits forms and responses to rebuild c8oGrp membership maps.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>chunkSize</td><td>Number of documents fetched per Mango page during the audit.</td>
</tr>
<tr>
<td>execute</td><td>Set to true to rebuild c8oGrp based on computed expectations.</td>
</tr>
</table>
### APIV2_SetManageAccessRights

Set manage rights.
Applies manage-access-rights updates and keeps ACLs in sync.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>collab</td><td>Collaborator identifier to add or update.</td>
</tr>
<tr>
<td>id</td><td>Generic identifier for the targeted resource.</td>
</tr>
<tr>
<td>meta</td><td></td>
</tr>
</table>
### APIV2_setOwnerShip

Update ownership.
Updates owner and collaborators, syncing ACL and group lists.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>id</td><td>Generic identifier for the targeted resource.</td>
</tr>
<tr>
<td>owner</td><td></td>
</tr>
</table>
### APIV2_SetSharedAnonymous

Toggle anonymous sharing.
Updates the anonymous sharing flags and supporting metadata for a form.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>id</td><td>Generic identifier for the targeted resource.</td>
</tr>
<tr>
<td>meta</td><td></td>
</tr>
</table>
### APIV2_setUserAdmin

Flag admin user.
Promotes or demotes a Convertigo user as an admin helper.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>id</td><td></td>
</tr>
</table>
### APIV2_updateFormulaireDocument

Update form document.
Applies draft updates, merges metadata and handles attachments.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>file</td><td>Binary file content processed by the sequence.</td>
</tr>
<tr>
<td>meta</td><td>JSON metadata payload associated with the operation.</td>
</tr>
</table>
### APIV2_updateTags

Update form tags.
Applies tag changes on a form and refreshes derived structures.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>id</td><td>Generic identifier for the targeted resource.</td>
</tr>
<tr>
<td>meta</td><td></td>
</tr>
<tr>
<td>rev</td><td>Document revision ensuring optimistic locking.</td>
</tr>
</table>
### b

Legacy bridge.
Provides a thin compatibility layer for legacy clients.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>c</td><td>Generic parameter used by legacy clients.</td>
</tr>
<tr>
<td>e</td><td>Email address parameter used by legacy flows.</td>
</tr>
<tr>
<td>f</td><td>Filter fragment passed by legacy API calls.</td>
</tr>
<tr>
<td>l</td><td>Language code supplied by legacy clients.</td>
</tr>
<tr>
<td>n</td><td>Notification identifier handled by the flow.</td>
</tr>
<tr>
<td>o</td><td>Output selector used by legacy APIs.</td>
</tr>
<tr>
<td>p</td><td>Pagination or page parameter for legacy requests.</td>
</tr>
<tr>
<td>s</td><td>Search term supplied by the caller.</td>
</tr>
<tr>
<td>se</td><td>Sequence identifier forwarded by legacy APIs.</td>
</tr>
<tr>
<td>v</td><td>Version value used in compatibility checks.</td>
</tr>
</table>
### BaserowAccount

Save Baserow account.
Stores Baserow credentials and metadata for the current user.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>password</td><td>Password submitted by the user.</td>
</tr>
</table>
### BaserowAccountGet

Get Baserow account.
Returns Baserow credentials and sync flags for the current user.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>owner</td><td></td>
</tr>
</table>
### BuildCsvByFormId

Build CSV by form.
Creates a CSV report for a form using stored configuration.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>column_name</td><td>Column name when querying Baserow tables.</td>
</tr>
<tr>
<td>encoding</td><td>Character encoding requested for exports.</td>
</tr>
<tr>
<td>formId</td><td>Identifier of the form being handled.</td>
</tr>
<tr>
<td>lang</td><td>Language code ISO used for localisation.</td>
</tr>
<tr>
<td>name</td><td>Human readable name of the target entity.</td>
</tr>
<tr>
<td>offset</td><td>Pagination offset for queries.</td>
</tr>
<tr>
<td>privacy</td><td>Privacy level requested for exports.</td>
</tr>
<tr>
<td>separator</td><td>CSV separator character requested.</td>
</tr>
<tr>
<td>string_separator</td><td>Separator string used in CSV exports.</td>
</tr>
<tr>
<td>version</td><td>Version string applied to the project or document.</td>
</tr>
</table>
### ChangePassword

Change password.
Verifies reset token and updates the user password.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>newPwd</td><td>Nouveau mot de passe</td>
</tr>
<tr>
<td>user</td><td>Compte utilisateur</td>
</tr>
</table>
### ChangeUserEditingRights

Change editing rights.
Adjusts collaborator editing rights for forms or folders.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>editingRights</td><td>Editing rights payload to apply on the target.</td>
</tr>
<tr>
<td>forceCreation</td><td></td>
</tr>
<tr>
<td>user</td><td>User identifier concerned by the request.</td>
</tr>
</table>
### CheckForPendingInvitationNewUsers

Check pending invites.
Lists pending invitations created for new users.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>acl</td><td></td>
</tr>
<tr>
<td>mail</td><td>Email payload returned to the caller.</td>
</tr>
</table>
### checkIfDeleteIsPermitted

Check delete permission.
Ensures the caller can delete the targeted document.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>doc</td><td></td>
</tr>
</table>
### CreatePublicUserAddGroupe

Create public user.
Creates an anonymous user and grants access to a group.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>deleteControlDoc</td><td>Flag deciding whether control documents must be erased.</td>
</tr>
<tr>
<td>doc</td><td></td>
</tr>
</table>
### data_integrity_accessRights_check_between_edition_published_pwa_doc_anonymous

Check access rights integrity.
Compares edition, published and anonymous docs to detect access-right mismatches.

### data_integrity_collabsResponse_check_between_edition_published

Check collab response integrity.
Ensures collaborator responses match between edition and published docs.

### data_integrity_collabsResponse_check_between_forms_and_response

Check collab response links.
Validates collab response linkage between forms and responses databases.

### data_integrity_collabsResponse_repair_between_forms_and_response

Repair collab response links.
Repairs inconsistencies between forms and response documents.

### delete_all_templates

Delete all templates.
Purges all template documents from the project.

### DeleteB64FromExistingResponses

Delete response B64.
Removes base64 data from existing response attachments.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>chunkSize</td><td>Maximum number of documents processed per batch.</td>
</tr>
<tr>
<td>execute</td><td>True to run the sequence in apply mode.</td>
</tr>
</table>
### DeleteUser

Delete user.
Removes a user account and related ACL references.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>user</td><td>User identifier concerned by the request.</td>
</tr>
</table>
### downloadFile

Download file.
Streams a file attachment from the FullSync database.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>documentName</td><td></td>
</tr>
<tr>
<td>filename</td><td>Filename of the processed attachment.</td>
</tr>
</table>
### Execute_Sequences

Run maintenance jobs.
Sequentially executes the maintenance sequences configured for the project.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>doc</td><td></td>
</tr>
</table>
### ForgotPassword

Send reset mail.
Generates a reset token and emails the password recovery link.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>email</td><td>Email address targeted by the sequence.</td>
</tr>
<tr>
<td>emailBody</td><td>Email body template for notifications.</td>
</tr>
<tr>
<td>emailLogo</td><td>Email logo URL used inside templates.</td>
</tr>
<tr>
<td>emailSubject</td><td>Email subject template.</td>
</tr>
<tr>
<td>newPassword</td><td>New password to be set</td>
</tr>
<tr>
<td>passwordResetKey</td><td>Password reset key</td>
</tr>
<tr>
<td>targetApplicationName</td><td>Email where to send the reset password link to</td>
</tr>
</table>
### GeneratePwaAsset

Generate PWA assets.
Processes images to generate icons, splash screens and runtime metadata.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>doc</td><td></td>
</tr>
<tr>
<td>from_start_server</td><td>True when invocation happens from server start hook.</td>
</tr>
<tr>
<td>threads</td><td>Number of worker threads to use for job execution.</td>
</tr>
</table>
### getAnonymousForm

Get anonymous form.
Returns the anonymous version of a published form.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>login</td><td>Login identifier submitted by the user.</td>
</tr>
</table>
### getAvailableAuthModeForLogin

List auth modes.
Lists authentication modes available to the login page.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>AD</td><td>Whether Active Directory login is requested.</td>
</tr>
<tr>
<td>autoCheckActiveDirectory</td><td>Flag enabling automatic Active Directory lookup.</td>
</tr>
<tr>
<td>cloudBranding</td><td>Branding identifier applied to the cloud deployment.</td>
</tr>
<tr>
<td>hideConvertigoLogin</td><td>Flag hiding the Convertigo login page.</td>
</tr>
<tr>
<td>hidePasswordForgotten</td><td>Flag hiding the password forgotten link.</td>
</tr>
<tr>
<td>Identifier</td><td>Identifier of the target record or user.</td>
</tr>
<tr>
<td>loginAdLabel</td><td>Active Directory label shown on login page.</td>
</tr>
<tr>
<td>openIdBrand</td><td>Brand identifier used during OpenID login.</td>
</tr>
</table>
### getBrevoChatId

Get Brevo chat id.
Retrieves the Brevo conversations identifier for the user.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>aiVisible</td><td>Flag indicating AI related features visibility.</td>
</tr>
<tr>
<td>BrevoConversationsID</td><td>Brevo conversations identifier used for chat handoff.</td>
</tr>
<tr>
<td>EnableProductTour</td><td>Flag enabling the product tour for the user.</td>
</tr>
<tr>
<td>legacyLogo</td><td>Legacy logo URL to migrate.</td>
</tr>
</table>
### getConvertigoUrl

Get Convertigo URL.
Returns the base Convertigo endpoint configured for the app.

### getCSVDefaultCharacterSet

Get CSV charset.
Returns the default character set used for CSV exports.

### getCurrentUserSettings

Get user settings.
Loads the settings document for the connected user.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>editing_apps_default_rights</td><td>Default editing rights for applications.</td>
</tr>
<tr>
<td>formulas_default_rights</td><td>Default rights for formula based widgets.</td>
</tr>
<tr>
<td>no_code_db_default_rights</td><td>Default rights for no-code database elements.</td>
</tr>
<tr>
<td>publication</td><td>Publication flag or structure applied to the form.</td>
</tr>
</table>
### getGDRPmenu

Get GDPR menu.
Returns GDPR menu content stored in settings.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>symbol</td><td>Symbol or tag referencing a statistic axis.</td>
</tr>
</table>
### getGDRPtoast

Get GDPR toast.
Returns GDPR toast configuration for display.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>symbol</td><td>Symbol or tag referencing a statistic axis.</td>
</tr>
</table>
### getInactiveForms

List inactive forms.
Lists forms marked as inactive or archived.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>monthsAgo</td><td>Number of months to look back in stats.</td>
</tr>
</table>
### getKnownUsers

List known users.
Returns all known users for sharing and invitations.

### GetLanguage

Get language.
Returns the language preferences of the current user.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>email</td><td>Email address targeted by the sequence.</td>
</tr>
</table>
### GetSequences

List sequences.
Returns a list of sequences that can be triggered remotely.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>projectFilter</td><td>Project filter applied to stats queries.</td>
</tr>
<tr>
<td>sequenceFilter</td><td>Filter selecting which sequences to execute.</td>
</tr>
<tr>
<td>type</td><td>Type of element processed (form, folder, etc.).</td>
</tr>
<tr>
<td>variableFilter</td><td>Filter used to select variables in maintenance flows.</td>
</tr>
</table>
### getTinyMaxs

Get TinyMCE limits.
Returns TinyMCE text and image size limits.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>error_message</td><td>Error message to log or forward.</td>
</tr>
<tr>
<td>max_size</td><td>Maximum allowed attachment size in bytes.</td>
</tr>
<tr>
<td>warn_message</td><td>Warning message shown to the user.</td>
</tr>
</table>
### GroupsOf

List user groups.
Lists the groups the given user belongs to.

### HasProject

Check project ownership.
Verifies that the requester owns the current project.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>projectName</td><td>Convertigo project name referenced by the request.</td>
</tr>
</table>
### importTemplates

Import templates.
Imports template documents from provided archives.

### initAllPWAS

Init all PWAs.
Regenerates all PWA artifacts from stored forms.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>from_start_server</td><td>True when invocation happens from server start hook.</td>
</tr>
<tr>
<td>threads</td><td>Number of worker threads to use for job execution.</td>
</tr>
</table>
### InsertNotifIntoCurrentUser

Insert notification.
Adds a notification entry into the current user's document.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>formId</td><td>Identifier of the form being handled.</td>
</tr>
<tr>
<td>id</td><td>Generic identifier for the targeted resource.</td>
</tr>
<tr>
<td>status</td><td>Status value to apply to the document.</td>
</tr>
<tr>
<td>targetId</td><td>Target document or user identifier.</td>
</tr>
<tr>
<td>targetName</td><td></td>
</tr>
<tr>
<td>type</td><td>Type of element processed (form, folder, etc.).</td>
</tr>
</table>
### listAllPWAsUrls

List PWA URLs.
Lists accessible URLs for every generated PWA.

### Login

Login user.
Authenticates using internal credentials and returns session data.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>email</td><td>Email address targeted by the sequence.</td>
</tr>
<tr>
<td>password</td><td>Password submitted by the user.</td>
</tr>
<tr>
<td>secretL</td><td>Shared secret used by legacy authentication flows.</td>
</tr>
</table>
### LoginAD

Login with AD.
Performs Active Directory login and mirrors user data.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>email</td><td>Email address targeted by the sequence.</td>
</tr>
<tr>
<td>group_ad_login</td><td>Active Directory group login value.</td>
</tr>
<tr>
<td>LDAP</td><td>Raw LDAP payload received from the identity provider.</td>
</tr>
<tr>
<td>password</td><td>Password submitted by the user.</td>
</tr>
<tr>
<td>secretL</td><td>Shared secret used by legacy authentication flows.</td>
</tr>
</table>
### LoginGoogle

Login with Google.
Handles Google OAuth callback and authenticates the user.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>decodedToken</td><td>Decoded identity token payload.</td>
</tr>
<tr>
<td>displayName</td><td>Display name for the user or group.</td>
</tr>
<tr>
<td>lang</td><td>Language code ISO used for localisation.</td>
</tr>
<tr>
<td>name</td><td>Human readable name of the target entity.</td>
</tr>
<tr>
<td>picture</td><td></td>
</tr>
<tr>
<td>surname</td><td>Surname or last name of the user.</td>
</tr>
</table>
### LoginLinkedIn

Login with LinkedIn.
Handles LinkedIn OAuth callback and authenticates the user.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>decodedToken</td><td>Decoded identity token payload.</td>
</tr>
<tr>
<td>displayName</td><td>Display name for the user or group.</td>
</tr>
<tr>
<td>isTrial</td><td>Flag telling if the user is a trial account.</td>
</tr>
<tr>
<td>lang</td><td>Language code ISO used for localisation.</td>
</tr>
<tr>
<td>mail</td><td>Email payload returned to the caller.</td>
</tr>
<tr>
<td>name</td><td>Human readable name of the target entity.</td>
</tr>
<tr>
<td>surname</td><td>Surname or last name of the user.</td>
</tr>
</table>
### LoginMicrosoft

Login with Microsoft.
Handles Azure AD OAuth callback and authenticates the user.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>decodedToken</td><td>Decoded identity token payload.</td>
</tr>
<tr>
<td>displayName</td><td></td>
</tr>
<tr>
<td>lang</td><td>Language code ISO used for localisation.</td>
</tr>
<tr>
<td>name</td><td>Human readable name of the target entity.</td>
</tr>
<tr>
<td>surname</td><td>Surname or last name of the user.</td>
</tr>
</table>
### LoginOpenID

Login with OpenID.
Performs OpenID Connect authentication and stores tokens.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>decodedToken</td><td>Decoded identity token payload.</td>
</tr>
<tr>
<td>displayName</td><td>Display name for the user or group.</td>
</tr>
<tr>
<td>mail</td><td></td>
</tr>
<tr>
<td>name</td><td>Human readable name of the target entity.</td>
</tr>
<tr>
<td>surname</td><td>Surname or last name of the user.</td>
</tr>
</table>
### Logout

Logout user.
Clears session data and revokes tokens if needed.

### MIgrateToAllPWA

Migrate all PWAs.
Migrates existing apps to the unified PWA deployment.

### MigrationApiV2

Run API v2 migration.
Ensures data structures comply with API v2 requirements.

### NotifyNewUsersSharing

Notify new users.
Sends sharing notifications to newly invited users.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>body</td><td>Email body or message payload.</td>
</tr>
<tr>
<td>emails</td><td>Collection of email addresses to process.</td>
</tr>
<tr>
<td>idDoc</td><td></td>
</tr>
<tr>
<td>subject</td><td>Email subject line to send.</td>
</tr>
</table>
### NotifyResponseByMail

Mail response notification.
Builds and sends email notifications for form responses.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>doc</td><td></td>
</tr>
</table>
### NotifyUsersSharing

Notify collaborators.
Alerts existing collaborators about sharing changes.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>body</td><td></td>
</tr>
<tr>
<td>grps</td><td>List of group identifiers stored on the document.</td>
</tr>
<tr>
<td>subject</td><td>Email subject line to send.</td>
</tr>
</table>
### Ping

Ping endpoint.
Returns a simple pong node for health checks.

### RemoveNewUserSharing

Remove pending share.
Cancels pending sharing invitations for new users.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>id</td><td></td>
</tr>
</table>
### RemoveUserFromGroup

Remove user from group.
Removes a user from a group and updates ACLs.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>group</td><td></td>
</tr>
<tr>
<td>user</td><td>User identifier concerned by the request.</td>
</tr>
</table>
### SetLanguage

Set language.
Updates the preferred language of the current user.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>email</td><td>Email address targeted by the sequence.</td>
</tr>
<tr>
<td>language</td><td></td>
</tr>
</table>
### SetUserInGroup

Assign user to group.
Adds a user to a group and refreshes ACL caches.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>group</td><td></td>
</tr>
<tr>
<td>user</td><td>User identifier concerned by the request.</td>
</tr>
</table>
### submitResponseAnonymous

Submit anonymous response.
Stores an anonymous response and handles confirmation flows.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>actions</td><td>List of actions to execute sequentially.</td>
</tr>
<tr>
<td>files</td><td></td>
</tr>
<tr>
<td>filesInfo</td><td>JSON metadata about files to manage.</td>
</tr>
<tr>
<td>formId</td><td>Identifier of the form being handled.</td>
</tr>
<tr>
<td>formRev</td><td>Revision of the form document.</td>
</tr>
<tr>
<td>grp</td><td>Group metadata object to update.</td>
</tr>
<tr>
<td>login</td><td>Login identifier submitted by the user.</td>
</tr>
<tr>
<td>myId</td><td>Current user identifier used to personalise the request.</td>
</tr>
<tr>
<td>resp</td><td>Response document payload to process.</td>
</tr>
<tr>
<td>timestamp</td><td>Timestamp used for caching control.</td>
</tr>
<tr>
<td>version</td><td>Version string applied to the project or document.</td>
</tr>
</table>
### usersOf

Users of group.
Returns the users associated with a given group.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>group</td><td></td>
</tr>
</table>
## Connectors

### c8oforms_fs

Forms fullsync store.
CouchDB FullSync connector storing forms, settings, and shared metadata.

#### Transactions

##### DeleteDocument

Delete form document.
Deletes a document from c8oforms_fs using the provided id.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_docid</td><td>Identifier of the document targeted by the transaction.</td>
</tr>
</table>
##### GetDocument

Get form document.
Fetches a document from c8oforms_fs by id with optional test coverage.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_docid</td><td>Identifier of the document targeted by the transaction.</td>
</tr>
</table>
##### GetDocumentAttachment

Get attachment by path.
Streams an attachment by name and path from c8oforms_fs.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_attname</td><td>Attachment name to read or write.</td>
</tr>
<tr>
<td>_use_attpath</td><td>File system path used to fetch attachment content.</td>
</tr>
<tr>
<td>_use_docid</td><td>Identifier of the document targeted by the transaction.</td>
</tr>
<tr>
<td>_use_rev</td><td>Revision token of the targeted document.</td>
</tr>
</table>
##### GetDocumentAttachment1

Get attachment by name.
Retrieves an attachment solely by document id and name.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_attname</td><td>Attachment name to read or write.</td>
</tr>
<tr>
<td>_use_attpath</td><td>File system path used to fetch attachment content.</td>
</tr>
<tr>
<td>_use_docid</td><td>Identifier of the document targeted by the transaction.</td>
</tr>
</table>
##### GetDocumentAttachmentB64

Get attachment as base64.
Returns an attachment encoded as base64 for inline transfers.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_attname</td><td>Attachment name to read or write.</td>
</tr>
<tr>
<td>_use_docid</td><td>Identifier of the document targeted by the transaction.</td>
</tr>
</table>
##### GetDocumentRev

Get document revision.
Fetches a document by id and revision for optimistic locking.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_docid</td><td>Identifier of the document targeted by the transaction.</td>
</tr>
<tr>
<td>_use_rev</td><td>Revision token of the targeted document.</td>
</tr>
</table>
##### GetServerInfo

Get server info.
Retrieves CouchDB server information for health checks.

##### GetServerInfo1

Get server info copy.
Alternative server info accessor kept for backward compatibility.

##### GetUsersByACL

List users by ACL.
Queries view usersV2/byACL to resolve user membership from ACL entries.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_ddoc</td><td>Design document identifier to query.</td>
</tr>
<tr>
<td>_use_include_docs</td><td>Whether to embed full documents in the view response.</td>
</tr>
<tr>
<td>_use_keys</td><td>List of keys used to filter view results.</td>
</tr>
<tr>
<td>_use_view</td><td>Name of the view to execute.</td>
</tr>
</table>
##### GetView

Run integrity view.
Executes data_integrity/check_published_collabResponse_groups with long timeout.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_ddoc</td><td>Design document identifier to query.</td>
</tr>
<tr>
<td>_use_descending</td><td>Return view rows in descending key order when true.</td>
</tr>
<tr>
<td>_use_group</td><td>Whether to group reduced view results.</td>
</tr>
<tr>
<td>_use_group_level</td><td>Group level used when reducing view rows.</td>
</tr>
<tr>
<td>_use_reduce</td><td>Whether to apply the reduce function on the view.</td>
</tr>
<tr>
<td>_use_view</td><td>Name of the view to execute.</td>
</tr>
</table>
##### GetViewAuth

Run authentication view.
Calls authentication/distinctGroups grouped to inspect group usage.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_group</td><td>Whether to group reduced view results.</td>
</tr>
<tr>
<td>_use_group_level</td><td>Group level used when reducing view rows.</td>
</tr>
<tr>
<td>_use_keys</td><td>List of keys used to filter view results.</td>
</tr>
<tr>
<td>_use_reduce</td><td>Whether to apply the reduce function on the view.</td>
</tr>
</table>
##### GetViewByKeys

Run view by keys.
Executes the formsV2 view with an explicit keys list.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_ddoc</td><td>Design document identifier to query.</td>
</tr>
<tr>
<td>_use_keys</td><td>List of keys used to filter view results.</td>
</tr>
<tr>
<td>_use_view</td><td>Name of the view to execute.</td>
</tr>
</table>
##### GetViewIncludeDocs

Run view including docs.
Loads formsV2 view entries while embedding full documents.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_ddoc</td><td>Design document identifier to query.</td>
</tr>
<tr>
<td>_use_include_docs</td><td>Whether to embed full documents in the view response.</td>
</tr>
<tr>
<td>_use_view</td><td>Name of the view to execute.</td>
</tr>
</table>
##### GetViewPublishedbyAcl

Run published-by-ACL view.
Queries published_forms/distinct_by_acl to list ACL driven publications.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_ddoc</td><td>Design document identifier to query.</td>
</tr>
<tr>
<td>_use_key</td><td>Single key used to filter view results.</td>
</tr>
<tr>
<td>_use_view</td><td>Name of the view to execute.</td>
</tr>
</table>
##### HeadDocument

Head form document.
Performs a HEAD request on a document to check its existence.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_docid</td><td>Identifier of the document targeted by the transaction.</td>
</tr>
</table>
##### PostBulkDocuments_1

Bulk merge documents.
Merges a batch of documents into c8oforms_fs with merge policy.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_json_base</td><td>JSON base template used to build documents.</td>
</tr>
</table>
##### PostDocument

Post document.
Creates or updates a document with merge policy and metadata protections.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_c8oAcl</td><td>ACL metadata stored on the document.</td>
</tr>
<tr>
<td>_id</td><td>Identifier of the document to process.</td>
</tr>
<tr>
<td>_use_merge</td><td>Merge policy instructions applied during bulk uploads.</td>
</tr>
<tr>
<td>actions</td><td>Array of actions executed by the connector call.</td>
</tr>
<tr>
<td>c8o_view_type_published_form</td><td>Flag identifying published form documents.</td>
</tr>
<tr>
<td>c8oGrp</td><td>Group membership map attached to the document.</td>
</tr>
<tr>
<td>collabs</td><td>Collaborators array stored on the form.</td>
</tr>
<tr>
<td>collabsResponse</td><td>Collaborators allowed to read responses.</td>
</tr>
<tr>
<td>creationDate</td><td>Creation timestamp saved on the document.</td>
</tr>
<tr>
<td>creator</td><td>Creator identifier tied to the document.</td>
</tr>
<tr>
<td>descform</td><td>Long description of the form.</td>
</tr>
<tr>
<td>descformPosition</td><td>Display order for the form description.</td>
</tr>
<tr>
<td>formulaire</td><td>Serialized form definition payload.</td>
</tr>
<tr>
<td>lastMofification</td><td>Timestamp of the last modification.</td>
</tr>
<tr>
<td>name</td><td>Name of the entity written into the document.</td>
</tr>
<tr>
<td>namePosition</td><td>Display order for the name field.</td>
</tr>
<tr>
<td>pages</td><td>Serialized page definitions for the form.</td>
</tr>
<tr>
<td>parentId</td><td>Parent document identifier in the hierarchy.</td>
</tr>
<tr>
<td>parentRev</td><td>Parent revision reference used during migration.</td>
</tr>
<tr>
<td>pwa_enabled</td><td>Flag enabling PWA generation for the form.</td>
</tr>
<tr>
<td>pwa_subPath</td><td>Sub-path used to host the generated PWA.</td>
</tr>
<tr>
<td>respNameRequired</td><td>Flag making response name mandatory.</td>
</tr>
<tr>
<td>sharedAnonymous</td><td>Flag enabling anonymous sharing on the form.</td>
</tr>
<tr>
<td>subTag</td><td>Secondary tag set on the document.</td>
</tr>
<tr>
<td>tag</td><td>Tag label applied to the form.</td>
</tr>
<tr>
<td>thumbnail</td><td>Thumbnail metadata or payload stored with the document.</td>
</tr>
<tr>
<td>version</td><td>Version string of the migrated document.</td>
</tr>
<tr>
<td>wallpaper</td><td>Wallpaper metadata or payload stored with the document.</td>
</tr>
</table>
##### PostDocument1

Post document (raw).
Posts a document with keep-attachments flag for specialized flows.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_c8oAcl</td><td>ACL metadata stored on the document.</td>
</tr>
<tr>
<td>_id</td><td>Identifier of the document to process.</td>
</tr>
<tr>
<td>_use_merge</td><td>Merge policy instructions applied during bulk uploads.</td>
</tr>
<tr>
<td>actions</td><td>Array of actions executed by the connector call.</td>
</tr>
<tr>
<td>c8o_view_type_published_form</td><td>Flag identifying published form documents.</td>
</tr>
<tr>
<td>c8oGrp</td><td>Group membership map attached to the document.</td>
</tr>
<tr>
<td>collabs</td><td>Collaborators array stored on the form.</td>
</tr>
<tr>
<td>collabsResponse</td><td>Collaborators allowed to read responses.</td>
</tr>
<tr>
<td>creationDate</td><td>Creation timestamp saved on the document.</td>
</tr>
<tr>
<td>creator</td><td>Creator identifier tied to the document.</td>
</tr>
<tr>
<td>descform</td><td>Long description of the form.</td>
</tr>
<tr>
<td>descformPosition</td><td>Display order for the form description.</td>
</tr>
<tr>
<td>formulaire</td><td>Serialized form definition payload.</td>
</tr>
<tr>
<td>lastMofification</td><td>Timestamp of the last modification.</td>
</tr>
<tr>
<td>name</td><td>Name of the entity written into the document.</td>
</tr>
<tr>
<td>namePosition</td><td>Display order for the name field.</td>
</tr>
<tr>
<td>pages</td><td>Serialized page definitions for the form.</td>
</tr>
<tr>
<td>parentId</td><td>Parent document identifier in the hierarchy.</td>
</tr>
<tr>
<td>parentRev</td><td>Parent revision reference used during migration.</td>
</tr>
<tr>
<td>pwa_enabled</td><td>Flag enabling PWA generation for the form.</td>
</tr>
<tr>
<td>pwa_subPath</td><td>Sub-path used to host the generated PWA.</td>
</tr>
<tr>
<td>respNameRequired</td><td>Flag making response name mandatory.</td>
</tr>
<tr>
<td>sharedAnonymous</td><td>Flag enabling anonymous sharing on the form.</td>
</tr>
<tr>
<td>subTag</td><td>Secondary tag set on the document.</td>
</tr>
<tr>
<td>tag</td><td>Tag label applied to the form.</td>
</tr>
<tr>
<td>thumbnail</td><td>Thumbnail metadata or payload stored with the document.</td>
</tr>
<tr>
<td>version</td><td>Version string of the migrated document.</td>
</tr>
<tr>
<td>wallpaper</td><td>Wallpaper metadata or payload stored with the document.</td>
</tr>
</table>
##### PostDocument_PWA

Post PWA document.
Stores generated PWA metadata and assets.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_c8oAcl</td><td>ACL metadata stored on the document.</td>
</tr>
<tr>
<td>_id</td><td>Identifier of the document to process.</td>
</tr>
<tr>
<td>_use_json_base</td><td>JSON base template used to build documents.</td>
</tr>
<tr>
<td>_use_merge</td><td>Merge policy instructions applied during bulk uploads.</td>
</tr>
<tr>
<td>backgroundColor</td><td>Background color value stored with the document.</td>
</tr>
<tr>
<td>c8o_view_type_pwa_document</td><td>Flag identifying generated PWA documents.</td>
</tr>
<tr>
<td>name</td><td>Name of the entity written into the document.</td>
</tr>
<tr>
<td>notAnonymous</td><td>Flag forcing authenticated access to the document.</td>
</tr>
<tr>
<td>originalFormId</td><td>Original form identifier referenced by the record.</td>
</tr>
<tr>
<td>querystr</td><td>Query string appended when calling the view.</td>
</tr>
<tr>
<td>shortName</td><td>Short name used in lists and menus.</td>
</tr>
<tr>
<td>targetId</td><td>Target identifier referenced by the notification.</td>
</tr>
<tr>
<td>themeColor</td><td>Theme color applied to the generated PWA.</td>
</tr>
</table>
##### PostDocument_restore_deleted

Restore deleted form.
Restores a previously deleted document by clearing _deleted flag.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>data</td><td>Main data payload written to the document.</td>
</tr>
</table>
##### PostDocumentAddArgc8o_view_type_pwa_document

Flag PWA document.
Marks a document with the PWA view type during creation.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_id</td><td>Identifier of the document to process.</td>
</tr>
<tr>
<td>c8o_view_type_pwa_document</td><td>Flag identifying generated PWA documents.</td>
</tr>
<tr>
<td>targetId</td><td>Target identifier referenced by the notification.</td>
</tr>
</table>
##### PostDocumentBaserowPassword

Save Baserow password.
Stores hashed Baserow credentials in the connector.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_id</td><td>Identifier of the document to process.</td>
</tr>
<tr>
<td>password</td><td>Password or secret associated with the record.</td>
</tr>
</table>
##### PostDocumentCreateNotif

Create notification doc.
Adds notification documents for user alerts.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_id</td><td>Identifier of the document to process.</td>
</tr>
<tr>
<td>c8o_view_type_notification</td><td>Flag identifying notification documents.</td>
</tr>
<tr>
<td>date</td><td>Timestamp or date value stored during migration.</td>
</tr>
<tr>
<td>formId</td><td>Identifier of the parent form document.</td>
</tr>
<tr>
<td>new</td><td>Flag telling whether the record is newly created.</td>
</tr>
<tr>
<td>status</td><td>Workflow status value of the form.</td>
</tr>
<tr>
<td>targetId</td><td>Target identifier referenced by the notification.</td>
</tr>
<tr>
<td>targetName</td><td>Human readable name of the target referenced item.</td>
</tr>
<tr>
<td>type</td><td>Document type marker used by design documents.</td>
</tr>
</table>
##### PostDocumentCreateUserSettings

Create user settings.
Initialises default user settings structures.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_c8oAcl</td><td>ACL metadata stored on the document.</td>
</tr>
<tr>
<td>_id</td><td>Identifier of the document to process.</td>
</tr>
<tr>
<td>_use_json_base</td><td>JSON base template used to build documents.</td>
</tr>
<tr>
<td>c8o_view_type_users</td><td>Flag identifying user documents.</td>
</tr>
<tr>
<td>displayName</td><td>Display name saved for the target entity.</td>
</tr>
<tr>
<td>editing_rights</td><td>Editing rights object merged into the document.</td>
</tr>
<tr>
<td>favorites</td><td>List of favourites associated with the user.</td>
</tr>
<tr>
<td>language</td><td>Language code stored on the document.</td>
</tr>
<tr>
<td>mail</td><td>Email address stored on the document.</td>
</tr>
<tr>
<td>name</td><td>Name of the entity written into the document.</td>
</tr>
<tr>
<td>picture</td><td>Binary or base64 picture payload.</td>
</tr>
<tr>
<td>provider</td><td>Name of the identity or external provider.</td>
</tr>
<tr>
<td>published_First</td><td>Flag used during first publication of a form.</td>
</tr>
<tr>
<td>surname</td><td>Surname stored on the user document.</td>
</tr>
</table>
##### PostDocumentFromAclKey

Post from ACL key.
Creates a document using ACL information as base JSON.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_c8oAcl</td><td>ACL metadata stored on the document.</td>
</tr>
<tr>
<td>_id</td><td>Identifier of the document to process.</td>
</tr>
<tr>
<td>_use_merge</td><td>Merge policy instructions applied during bulk uploads.</td>
</tr>
<tr>
<td>actions</td><td>Array of actions executed by the connector call.</td>
</tr>
<tr>
<td>c8oGrp</td><td>Group membership map attached to the document.</td>
</tr>
<tr>
<td>creator</td><td>Creator identifier tied to the document.</td>
</tr>
<tr>
<td>descform</td><td>Long description of the form.</td>
</tr>
<tr>
<td>descformPosition</td><td>Display order for the form description.</td>
</tr>
<tr>
<td>formulaire</td><td>Serialized form definition payload.</td>
</tr>
<tr>
<td>name</td><td>Name of the entity written into the document.</td>
</tr>
<tr>
<td>namePosition</td><td>Display order for the name field.</td>
</tr>
<tr>
<td>pages</td><td>Serialized page definitions for the form.</td>
</tr>
<tr>
<td>parentId</td><td>Parent document identifier in the hierarchy.</td>
</tr>
<tr>
<td>parentRev</td><td>Parent revision reference used during migration.</td>
</tr>
<tr>
<td>respNameRequired</td><td>Flag making response name mandatory.</td>
</tr>
<tr>
<td>version</td><td>Version string of the migrated document.</td>
</tr>
<tr>
<td>wallpaper</td><td>Wallpaper metadata or payload stored with the document.</td>
</tr>
</table>
##### PostDocumentFromAclKeyMerge

Merge from ACL key.
Merges ACL-based JSON into an existing document.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_c8oAcl</td><td>ACL metadata stored on the document.</td>
</tr>
<tr>
<td>_id</td><td>Identifier of the document to process.</td>
</tr>
<tr>
<td>_use_merge</td><td>Merge policy instructions applied during bulk uploads.</td>
</tr>
<tr>
<td>actions</td><td>Array of actions executed by the connector call.</td>
</tr>
<tr>
<td>c8oGrp</td><td>Group membership map attached to the document.</td>
</tr>
<tr>
<td>creator</td><td>Creator identifier tied to the document.</td>
</tr>
<tr>
<td>descform</td><td>Long description of the form.</td>
</tr>
<tr>
<td>descformPosition</td><td>Display order for the form description.</td>
</tr>
<tr>
<td>formulaire</td><td>Serialized form definition payload.</td>
</tr>
<tr>
<td>name</td><td>Name of the entity written into the document.</td>
</tr>
<tr>
<td>namePosition</td><td>Display order for the name field.</td>
</tr>
<tr>
<td>pages</td><td>Serialized page definitions for the form.</td>
</tr>
<tr>
<td>parentId</td><td>Parent document identifier in the hierarchy.</td>
</tr>
<tr>
<td>parentRev</td><td>Parent revision reference used during migration.</td>
</tr>
<tr>
<td>respNameRequired</td><td>Flag making response name mandatory.</td>
</tr>
<tr>
<td>version</td><td>Version string of the migrated document.</td>
</tr>
<tr>
<td>wallpaper</td><td>Wallpaper metadata or payload stored with the document.</td>
</tr>
</table>
##### PostDocumentJSONBASE

Post JSON base.
Posts documents using json_base template expansion.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_c8oAcl</td><td>ACL metadata stored on the document.</td>
</tr>
<tr>
<td>_use_json_base</td><td>JSON base template used to build documents.</td>
</tr>
</table>
##### PostDocumentJsonBaseKeepACL

Post JSON base keep ACL.
Posts documents while preserving existing ACL metadata.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_json_base</td><td>JSON base template used to build documents.</td>
</tr>
<tr>
<td>_use_merge</td><td>Merge policy instructions applied during bulk uploads.</td>
</tr>
</table>
##### PostDocumentJsonBaseOverride

Post JSON base override.
Posts documents overriding fields defined in the merge template.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_json_base</td><td>JSON base template used to build documents.</td>
</tr>
<tr>
<td>_use_merge</td><td>Merge policy instructions applied during bulk uploads.</td>
</tr>
</table>
##### PostDocumentMigrationAll

Migration - all docs.
Pushes migration results for draft, published and response artifacts.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_id</td><td>Identifier of the document to process.</td>
</tr>
<tr>
<td>subTag</td><td>Secondary tag set on the document.</td>
</tr>
<tr>
<td>tag</td><td>Tag label applied to the form.</td>
</tr>
</table>
##### PostDocumentMigrationDraft

Migration - drafts.
Writes migrated draft documents generated by scripts.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_id</td><td>Identifier of the document to process.</td>
</tr>
<tr>
<td>c8o_view_type_drafts_form</td><td>Flag identifying draft form documents.</td>
</tr>
</table>
##### PostDocumentMigrationPublished

Migration - published.
Stores migrated published documents for legacy upgrade.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_id</td><td>Identifier of the document to process.</td>
</tr>
<tr>
<td>c8o_view_type_published_form</td><td>Flag identifying published form documents.</td>
</tr>
</table>
##### PostDocumentMigrationPublished11

Migration - published v11.
Applies published-form adjustments for version 11 upgrade.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_id</td><td>Identifier of the document to process.</td>
</tr>
<tr>
<td>c8o_view_type_published_form</td><td>Flag identifying published form documents.</td>
</tr>
</table>
##### PostDocumentMigrationUsers

Migration - users.
Migrates user records into the new structure.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_id</td><td>Identifier of the document to process.</td>
</tr>
<tr>
<td>c8o_view_type_users</td><td>Flag identifying user documents.</td>
</tr>
</table>
##### PostDocumentMigrationUsersModif

Migration - user updates.
Stores incremental changes for migrated user records.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_id</td><td>Identifier of the document to process.</td>
</tr>
<tr>
<td>c8o_view_type_usersModif</td><td>Flag identifying user modification documents.</td>
</tr>
</table>
##### PostDocumentPolicyMerge

Post with merge policy.
Posts documents enforcing the merge policy supplied in variables.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_id</td><td>Identifier of the document to process.</td>
</tr>
<tr>
<td>sharedAnonymous</td><td>Flag enabling anonymous sharing on the form.</td>
</tr>
</table>
##### PostDocumentPublicFormJSONbase

Post public form template.
Creates public form documents using a JSON base.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_json_base</td><td>JSON base template used to build documents.</td>
</tr>
</table>
##### PostDocumentSetDone

Mark document done.
Updates checklist status on migration helper documents.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_id</td><td>Identifier of the document to process.</td>
</tr>
<tr>
<td>done</td><td>Boolean flag marking the record as completed.</td>
</tr>
</table>
##### PostDocumentSetPWAEnabled

Toggle PWA enabled.
Sets the pwa_enabled flag and derived metadata.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_id</td><td>Identifier of the document to process.</td>
</tr>
<tr>
<td>pwa_enabled</td><td>Flag enabling PWA generation for the form.</td>
</tr>
<tr>
<td>pwa_subPath</td><td>Sub-path used to host the generated PWA.</td>
</tr>
</table>
##### PostDocumentSetStatus

Update form status.
Writes the status field for workflow transitions.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_id</td><td>Identifier of the document to process.</td>
</tr>
<tr>
<td>status</td><td>Workflow status value of the form.</td>
</tr>
</table>
##### PostDocumentUpdateRights

Update rights document.
Stores ACL changes and collaborator rights.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_c8oAcl</td><td>ACL metadata stored on the document.</td>
</tr>
<tr>
<td>_id</td><td>Identifier of the document to process.</td>
</tr>
<tr>
<td>editing_rights</td><td>Editing rights object merged into the document.</td>
</tr>
</table>
##### PostFind

Run Mango query.
Executes a Mango query with custom selector and bookmark.

##### PurgeDatabase

Purge database.
Issues purge calls to permanently remove deleted revisions.

##### PutDocumentAttachment

Put attachment (merge).
Uploads or replaces an attachment with merge policy awareness.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_attname</td><td>Attachment name to read or write.</td>
</tr>
<tr>
<td>_use_attpath</td><td>File system path used to fetch attachment content.</td>
</tr>
<tr>
<td>_use_docid</td><td>Identifier of the document targeted by the transaction.</td>
</tr>
</table>
##### PutDocumentAttachmentFromBase64

Put attachment from base64.
Uploads an attachment supplied as base64 content.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_attbase64</td><td>Base64 encoded payload for attachment upload.</td>
</tr>
<tr>
<td>_use_attcontent_type</td><td>MIME type applied to the attachment.</td>
</tr>
<tr>
<td>_use_attname</td><td>Attachment name to read or write.</td>
</tr>
<tr>
<td>_use_docid</td><td>Identifier of the document targeted by the transaction.</td>
</tr>
</table>
##### PutDocumentAttachmentFromFile

Put attachment from file.
Uploads an attachment from a server-side file path.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_attcontent_type</td><td>MIME type applied to the attachment.</td>
</tr>
<tr>
<td>_use_attname</td><td>Attachment name to read or write.</td>
</tr>
<tr>
<td>_use_attpath</td><td>File system path used to fetch attachment content.</td>
</tr>
<tr>
<td>_use_docid</td><td>Identifier of the document targeted by the transaction.</td>
</tr>
</table>
##### PutDocumentAttachmentOK

Confirm attachment update.
Finalizes attachment upload returning metadata.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_attcontent_type</td><td>MIME type applied to the attachment.</td>
</tr>
<tr>
<td>_use_attname</td><td>Attachment name to read or write.</td>
</tr>
<tr>
<td>_use_attpath</td><td>File system path used to fetch attachment content.</td>
</tr>
<tr>
<td>_use_docid</td><td>Identifier of the document targeted by the transaction.</td>
</tr>
</table>
##### SetLanguage

Set language doc.
Updates the language settings document stored in c8oforms_fs.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_id</td><td>Identifier of the document to process.</td>
</tr>
<tr>
<td>language</td><td>Language code stored on the document.</td>
</tr>
</table>
### c8oforms_response_fs

Responses fullsync store.
CouchDB FullSync connector storing submitted responses and related attachments.

#### Transactions

##### AllDocs

List all response docs.
Lists response documents in bulk using _all_docs.

##### Generic_GetView

Generic response view.
Runs arbitrary response design views with provided identifiers.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_ddoc</td><td>Design document identifier to query.</td>
</tr>
<tr>
<td>_use_key</td><td>Single key used to filter view results.</td>
</tr>
<tr>
<td>_use_view</td><td>Name of the view to execute.</td>
</tr>
</table>
##### GetDocument

Get response document.
Retrieves a response document by id.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_docid</td><td>Identifier of the document targeted by the transaction.</td>
</tr>
</table>
##### GetDocumentAttachment

Get response attachment.
Streams attachments stored with a response.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_attname</td><td>Attachment name to read or write.</td>
</tr>
<tr>
<td>_use_attpath</td><td>File system path used to fetch attachment content.</td>
</tr>
<tr>
<td>_use_docid</td><td>Identifier of the document targeted by the transaction.</td>
</tr>
</table>
##### GetDocumentRev

Get response revision.
Fetches a response document by id and revision.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_docid</td><td>Identifier of the document targeted by the transaction.</td>
</tr>
<tr>
<td>_use_rev</td><td>Revision token of the targeted document.</td>
</tr>
</table>
##### GetResponseByFormId

Responses by form id.
Queries responsesByFormId view for a given form.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_key</td><td>Single key used to filter view results.</td>
</tr>
</table>
##### GetServerInfo

Get server info.
Retrieves CouchDB server details for diagnostics.

##### GetView

Run response view.
Runs Design_document/view for broad queries.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_key</td><td>Single key used to filter view results.</td>
</tr>
</table>
##### GetView1

Run response view1.
Runs Design_document/view1 for filtered queries.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_key</td><td>Single key used to filter view results.</td>
</tr>
</table>
##### GetView1_multiple

Run response view1 multiple.
Runs view1_multiple to load aggregated rows.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_key</td><td>Single key used to filter view results.</td>
</tr>
</table>
##### GetView1Pretty

Run response view1 pretty.
Runs view1_Pretty returning formatted rows.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_key</td><td>Single key used to filter view results.</td>
</tr>
</table>
##### GetViewNotOnMapOnly

Run response view custom.
Executes dynamic view lookups with grouping options.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_ddoc</td><td>Design document identifier to query.</td>
</tr>
<tr>
<td>_use_descending</td><td>Return view rows in descending key order when true.</td>
</tr>
<tr>
<td>_use_group</td><td>Whether to group reduced view results.</td>
</tr>
<tr>
<td>_use_group_level</td><td>Group level used when reducing view rows.</td>
</tr>
<tr>
<td>_use_reduce</td><td>Whether to apply the reduce function on the view.</td>
</tr>
<tr>
<td>_use_view</td><td>Name of the view to execute.</td>
</tr>
</table>
##### PostBulkDocumentsMergeOverrideGrp

Bulk merge responses.
Merges response documents with override-capable policy.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_json_base</td><td>JSON base template used to build documents.</td>
</tr>
<tr>
<td>_use_merge</td><td>Merge policy instructions applied during bulk uploads.</td>
</tr>
</table>
##### PostDocument

Post response document.
Creates or updates a response document with merge policy.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_c8oAcl</td><td>ACL metadata stored on the document.</td>
</tr>
<tr>
<td>_id</td><td>Identifier of the document to process.</td>
</tr>
<tr>
<td>_use_json_base</td><td>JSON base template used to build documents.</td>
</tr>
<tr>
<td>c8oGrp</td><td>Group membership map attached to the document.</td>
</tr>
<tr>
<td>resp</td><td>Response document payload handled by the transaction.</td>
</tr>
</table>
##### PostDocumentAttachmentB64IntoField

Store attachment in field.
Uploads base64 attachments into a document field.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_id</td><td>Identifier of the document to process.</td>
</tr>
<tr>
<td>_use_json_base</td><td>JSON base template used to build documents.</td>
</tr>
<tr>
<td>_use_merge</td><td>Merge policy instructions applied during bulk uploads.</td>
</tr>
</table>
##### PostDocumentJBASE

Post JSON base response.
Posts responses built from json_base template.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_id</td><td>Identifier of the document to process.</td>
</tr>
<tr>
<td>_use_json_base</td><td>JSON base template used to build documents.</td>
</tr>
</table>
##### PostDocumentOverride

Post response override.
Posts responses overriding specified fields.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_id</td><td>Identifier of the document to process.</td>
</tr>
<tr>
<td>_use_json_base</td><td>JSON base template used to build documents.</td>
</tr>
<tr>
<td>_use_merge</td><td>Merge policy instructions applied during bulk uploads.</td>
</tr>
</table>
##### PurgeDatabase

Purge response database.
Purges deleted revisions from the responses database.

##### PutDocumentAttachment

Upload response attachment.
Uploads attachments associated with a response id.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_attbase64</td><td>Base64 encoded payload for attachment upload.</td>
</tr>
<tr>
<td>_use_attcontent_type</td><td>MIME type applied to the attachment.</td>
</tr>
<tr>
<td>_use_attname</td><td>Attachment name to read or write.</td>
</tr>
<tr>
<td>_use_attpath</td><td>File system path used to fetch attachment content.</td>
</tr>
<tr>
<td>_use_docid</td><td>Identifier of the document targeted by the transaction.</td>
</tr>
</table>
##### PutDocumentAttachmentFromFile

Upload response attachment file.
Uploads attachments from server-side files.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>_use_attcontent_type</td><td>MIME type applied to the attachment.</td>
</tr>
<tr>
<td>_use_attname</td><td>Attachment name to read or write.</td>
</tr>
<tr>
<td>_use_attpath</td><td>File system path used to fetch attachment content.</td>
</tr>
<tr>
<td>_use_docid</td><td>Identifier of the document targeted by the transaction.</td>
</tr>
</table>
### c8ofullsyncgrp

#### Transactions

##### GetGroupsDistinct

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

#### adminDashboardDetail

Admin Dashboard Detail stats

#### adminDashboardHome

Home Admin Dashboard

#### adminDashboardUsers

Admin Dashboard Users

#### adminDashboardUsersWithinGroups

Admin Dashboard Users

#### aiChat

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

#### ModalEditImage

#### modalVideo

#### NetworkStatus

#### Page

#### PopOverInputs

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
<td>custom</td><td></td>
</tr>
<tr>
<td>elems</td><td></td>
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
#### checkAndRegister

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>item</td><td></td>
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
<td>custom</td><td></td>
</tr>
<tr>
<td>elems</td><td></td>
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
#### popOverTransferOwnerShip

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
<td>index</td><td></td>
</tr>
<tr>
<td>pOwner</td><td></td>
</tr>
<tr>
<td>published</td><td></td>
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
<tr>
<td>performCheckMandatory</td><td></td>
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

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>call</td><td></td>
</tr>
</table>
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
#### syncAndUpdateGetOnPull

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

#### addGroupForm

#### addUserForm

#### addUserToGroupForm

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
<td>item</td><td></td>
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
<td>form</td><td></td>
</tr>
<tr>
<td>i</td><td></td>
</tr>
<tr>
<td>typeVisible</td><td></td>
</tr>
</table>
**events**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>delete</td><td></td>
</tr>
<tr>
<td>save</td><td></td>
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
<td>condVisible</td><td></td>
</tr>
<tr>
<td>current</td><td></td>
</tr>
<tr>
<td>i</td><td></td>
</tr>
<tr>
<td>visible</td><td></td>
</tr>
</table>
#### datasource

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>explicitTarget</td><td></td>
</tr>
<tr>
<td>isSource</td><td></td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
<tr>
<td>loop</td><td></td>
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
<td>displayName</td><td></td>
</tr>
<tr>
<td>dragging</td><td></td>
</tr>
<tr>
<td>explicitTarget</td><td></td>
</tr>
<tr>
<td>height</td><td></td>
</tr>
<tr>
<td>isSource</td><td></td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
<tr>
<td>loop</td><td></td>
</tr>
<tr>
<td>path</td><td></td>
</tr>
<tr>
<td>sources</td><td></td>
</tr>
<tr>
<td>subIndex</td><td></td>
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
#### dataSourceEditor_GridRow_GridColSourcePicker_Group

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
<td>apiCurrentFor</td><td></td>
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
<td>c8oforms_monacoeditor</td><td></td>
</tr>
<tr>
<td>currentObject</td><td></td>
</tr>
<tr>
<td>loop</td><td></td>
</tr>
<tr>
<td>sources</td><td></td>
</tr>
<tr>
<td>type</td><td></td>
</tr>
</table>
#### dataSourceEditorDescription

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>additionalTextKey</td><td></td>
</tr>
<tr>
<td>copyContent</td><td></td>
</tr>
<tr>
<td>isText</td><td></td>
</tr>
</table>
#### dataviz

Display an apex chart comp. or an ag-grid comp.

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>data</td><td>(Object) - The data object for charts and grids comp</td>
</tr>
<tr>
<td>defaultHeight</td><td>(Number) - A card content default height</td>
</tr>
<tr>
<td>fullpage</td><td>(Boolean) - The comp. is expanded (true)</td>
</tr>
<tr>
<td>isLoading</td><td>(Boolean) - A boolean flag used for skeleton</td>
</tr>
<tr>
<td>subtitle</td><td>(String) - A subtitle/description for the component card</td>
</tr>
<tr>
<td>subtitleIcon</td><td>(String) - A subtitle icon for the component card</td>
</tr>
<tr>
<td>title</td><td>(String) - A title for the component card</td>
</tr>
<tr>
<td>type</td><td>(String) - A component type that could be one of the following values : "grid" | 'pie' | 'area' | 'line'</td>
</tr>
<tr>
<td>zoomEnd</td><td>(String) - An end date zoom in the YYYY-MM-DD format</td>
</tr>
<tr>
<td>zoomStart</td><td>(String) - A start date zoom in the YYYY-MM-DD format</td>
</tr>
</table>
**events**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>onClickOnDataGridRow</td><td>When fullpage mode have been changed</td>
</tr>
</table>
#### datavizHolder

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>currentBreakPoint</td><td>(String) - The current breakpoint (sm, xs, ...)</td>
</tr>
<tr>
<td>data</td><td>(Object) - Data object to display in the components</td>
</tr>
<tr>
<td>defaultHeight</td><td>(Number) - A card content default height</td>
</tr>
<tr>
<td>fullpage</td><td>(Boolean) - The comp. is expanded (true)</td>
</tr>
<tr>
<td>isExpanded</td><td>(Boolean) - The flag that set the card to fullpage mode</td>
</tr>
<tr>
<td>isHidden</td><td>(Boolean) - The flag that set to visible or not visible a card</td>
</tr>
<tr>
<td>isLoading</td><td>(Boolean) - The flag that set loading skeleton animation</td>
</tr>
<tr>
<td>responsiveChildColumnSize</td><td>(Array) - Size on sm, md, lg, xl between 1 and 12 : {sm: 12, md: '6', lg: 7, xl: 8}</td>
</tr>
<tr>
<td>sequence</td><td>(Object) - An object of configuration component</td>
</tr>
<tr>
<td>sequenceVars</td><td>(Object) - An object of configuration component</td>
</tr>
<tr>
<td>subtitle</td><td>(String) - A subtitle icon for the component card</td>
</tr>
<tr>
<td>subtitleIcon</td><td>(String) - A subtitle icon for the component card</td>
</tr>
<tr>
<td>title</td><td>(String) - A title for the component card</td>
</tr>
<tr>
<td>types</td><td>(String) - A component type that could be one of the following values : "grid" | 'pie' | 'area' | 'line'</td>
</tr>
</table>
**events**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>onChangeExpandedValue</td><td>When fullpage mode have been changed</td>
</tr>
<tr>
<td>onChangeHiddenValue</td><td>When fullpage mode have been changed</td>
</tr>
<tr>
<td>onClickOnDataGridRow</td><td>When fullpage mode have been changed</td>
</tr>
</table>
#### documentationPanel

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>mdContent</td><td></td>
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
<td>isDisabled</td><td></td>
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
#### getApplicationDetail

#### getUserGroupsDetail

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
<td>form</td><td></td>
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
**events**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>save</td><td></td>
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
<td>action</td><td></td>
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
<td>action</td><td></td>
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
#### itemAddRowToLocalGridActionEditor

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
#### itemAddRowToLocalGridActionViewer

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
#### itemButtonEditor

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
#### itemButtonViewer

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
#### itemCardEditor_Elem

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>child</td><td></td>
</tr>
<tr>
<td>idselectedC</td><td></td>
</tr>
<tr>
<td>indexItem</td><td></td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
<tr>
<td>item1730737782207</td><td></td>
</tr>
<tr>
<td>j</td><td></td>
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
#### itemCardEditorViewer_Elem

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>child</td><td></td>
</tr>
<tr>
<td>indexItem</td><td></td>
</tr>
<tr>
<td>item1730734017789</td><td></td>
</tr>
<tr>
<td>j</td><td></td>
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
#### itemCardViewer_Elem

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
<tr>
<td>item1730739256405</td><td></td>
</tr>
<tr>
<td>j</td><td></td>
</tr>
<tr>
<td>model</td><td></td>
</tr>
<tr>
<td>redList</td><td></td>
</tr>
</table>
#### itemChartEditor

The Chart Widget configuration panel

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
#### itemChartViewer

The Chart Widget viewer

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
#### itemConditionEditor

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
<td>idselectedC</td><td></td>
</tr>
<tr>
<td>indexItem</td><td></td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
</table>
#### itemConditionEditor_Elem

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>child</td><td></td>
</tr>
<tr>
<td>idselectedC</td><td></td>
</tr>
<tr>
<td>indexItem</td><td></td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
<tr>
<td>item1730737782207</td><td></td>
</tr>
<tr>
<td>j</td><td></td>
</tr>
<tr>
<td>targetCardChild</td><td></td>
</tr>
</table>
**events**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>focused</td><td></td>
</tr>
<tr>
<td>unfocused</td><td></td>
</tr>
</table>
#### itemConditionEditorViewer

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
#### itemConditionViewer_Elem

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>child</td><td></td>
</tr>
<tr>
<td>indexItem</td><td></td>
</tr>
<tr>
<td>item1730734017789</td><td></td>
</tr>
<tr>
<td>j</td><td></td>
</tr>
<tr>
<td>targetCardChild</td><td></td>
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
#### itemForLoopEditor1

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
#### itemForLoopEditor_Elem1

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>child</td><td></td>
</tr>
<tr>
<td>idselectedC</td><td></td>
</tr>
<tr>
<td>indexItem</td><td></td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
<tr>
<td>item1730737782207</td><td></td>
</tr>
<tr>
<td>j</td><td></td>
</tr>
</table>
#### itemForLoopEditorViewer1

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
#### itemForLoopEditorViewer_Elem1

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>child</td><td></td>
</tr>
<tr>
<td>indexItem</td><td></td>
</tr>
<tr>
<td>item1730734017789</td><td></td>
</tr>
<tr>
<td>j</td><td></td>
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
#### itemLayoutConfigCols

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>cols</td><td></td>
</tr>
</table>
#### itemLayoutEditor

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
<td>idselectedC</td><td></td>
</tr>
<tr>
<td>indexItem</td><td></td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
</table>
#### itemLayoutEditor_Elem

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>child</td><td></td>
</tr>
<tr>
<td>idselectedC</td><td></td>
</tr>
<tr>
<td>indexItem</td><td></td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
<tr>
<td>item1730737782207</td><td></td>
</tr>
<tr>
<td>j</td><td></td>
</tr>
<tr>
<td>showGrab</td><td></td>
</tr>
</table>
#### itemLayoutEditor_Params

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>colScheme</td><td></td>
</tr>
<tr>
<td>defaultValue</td><td></td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
<tr>
<td>main_icn</td><td></td>
</tr>
<tr>
<td>main_title</td><td></td>
</tr>
<tr>
<td>target</td><td></td>
</tr>
<tr>
<td>tooltip</td><td></td>
</tr>
</table>
**events**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>colsChange</td><td></td>
</tr>
</table>
#### itemLayoutEditorViewer

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
#### itemLayoutViewer

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
#### itemLayoutViewer_Elem

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
<tr>
<td>item1730739256405</td><td></td>
</tr>
<tr>
<td>j</td><td></td>
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
#### itemMapEditor

The Chart Widget configuration panel

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
#### itemMapViewer

The Chart Widget viewer

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
#### itemNavigateAppActionEditor

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
#### itemNavigateAppActionViewer

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
#### itemNavigatePageActionEditor

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
#### itemNavigatePageActionViewer

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
#### itemRadioViewver_Tag_Div_RadioList_Directive2_Directive2

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>disabled</td><td></td>
</tr>
<tr>
<td>item</td><td></td>
</tr>
</table>
#### itemRefreshGridActionEditor

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
#### itemRefreshGridActionViewer

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
#### itemRemoveRowFromLocalGridActionEditor

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
#### itemRemoveRowFromLocalGridActionViewer

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
<tr>
<td>name</td><td></td>
</tr>
</table>
#### itemToastActionEditor

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
#### itemToastActionViewer

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
<tr>
<td>loop</td><td></td>
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
#### moveUserToGroupForm

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
#### PopoverFilters

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>settings</td><td></td>
</tr>
</table>
#### PopoverListPagesAndFlows

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>flows</td><td></td>
</tr>
<tr>
<td>idSelected</td><td></td>
</tr>
<tr>
<td>pages</td><td></td>
</tr>
</table>
#### PopoverSort

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>settings</td><td></td>
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
<td>flow</td><td></td>
</tr>
<tr>
<td>for_loop</td><td></td>
</tr>
<tr>
<td>formulas</td><td></td>
</tr>
<tr>
<td>hideText</td><td></td>
</tr>
<tr>
<td>i</td><td></td>
</tr>
<tr>
<td>id</td><td></td>
</tr>
<tr>
<td>if_else</td><td></td>
</tr>
<tr>
<td>targetCardChild</td><td></td>
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
<tr>
<td>fromGrp</td><td></td>
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
<td>fileLabel</td><td></td>
</tr>
<tr>
<td>image</td><td></td>
</tr>
<tr>
<td>isFile</td><td></td>
</tr>
<tr>
<td>label</td><td></td>
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
<td>other</td><td></td>
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
<td>doTranslate</td><td></td>
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
<td>other</td><td></td>
</tr>
<tr>
<td>total</td><td></td>
</tr>
<tr>
<td>value</td><td></td>
</tr>
</table>
#### SharedStyleMarginEditor

**variables**

<table
<tr>
<th>name</th><th>comment</th>
</tr>
<tr>
<td>config</td><td></td>
</tr>
<tr>
<td>target</td><td></td>
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
#### updateGroupAccessRights



