// Imports and helpers functions
include("js/common.js");

var isAdmin = com.twinsoft.convertigo.engine.Engine.authenticatedSessionManager.hasRole(context.httpServletRequest.getSession(), com.twinsoft.convertigo.engine.AuthenticatedSessionManager.Role.TEST_PLATFORM_PRIVATE);
if(!isAdmin){
	var authenticatedUserID = context.getAuthenticatedUser();
	var currentUserDoc = (callSequence("C8Oforms", "APIV2_getDocument", { id: "C8Oreserved_" + authenticatedUserID})).document.res;
	if(currentUserDoc.admin == true){
		isAdmin = true;
	}
}
if(!isAdmin){
	throw new java.lang.Exception("You are not a server admin");
}