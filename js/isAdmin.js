// Imports and helpers functions
include("js/common.js");
if(!("__accept_admin_readonly" in this)){
	__accept_admin_readonly = false;
}
var isAdmin = com.twinsoft.convertigo.engine.Engine.authenticatedSessionManager.hasRole(context.httpServletRequest.getSession(), com.twinsoft.convertigo.engine.AuthenticatedSessionManager.Role.TEST_PLATFORM_PRIVATE);
var isAdminRead = false;
if(!isAdmin){
	var authenticatedUserID = context.getAuthenticatedUser();
	var currentUserDoc = getDoc("C8Oreserved_" + authenticatedUserID, null, "c8oforms_fs");
	// now check if doc is authorized for currentUser
	//var currentUserDoc = (callSequence("C8Oforms", "APIV2_getDocument1", { id: "C8Oreserved_" + authenticatedUserID})).document.res;
	if(currentUserDoc.admin == true){
		isAdmin = true;
	}
	if(currentUserDoc.admin_readonly == true){
		isAdminRead = true
	}	
	var __groups = callSequence("lib_FullSyncGrp", "GroupsOf", { user: authenticatedUserID }).document.group;
	if(__groups != undefined){
		if(!Array.isArray(__groups)){
			__groups = [__groups];
		}
		query = new HashMap();
		query.put('reduce', 'false');
		query.put('include_docs', 'true');
		keys = toJettison(__groups);
		__groups = toJSON(fsclient.postView("c8oforms_fs", 'groups', 'rightsByUser', query, keys)).rows;
		console.log("my groups :", __groups, "warn");
		if(__groups != undefined){
			for(var __group of __groups){
				if(__group.doc.admin){
					isAdmin = true;
					break;
				}
				if(__group.doc.admin_readonly){
					isAdminRead = true
				}
			}
		}
	}
}
if(!isAdmin && __accept_admin_readonly !== true){
	throw new java.lang.Exception("You are not a server admin");
}
if(__accept_admin_readonly === true && !isAdmin && !isAdminRead){
	throw new java.lang.Exception("You are not a server admin");
}