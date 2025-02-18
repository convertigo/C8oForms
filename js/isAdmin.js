var isAdmin = com.twinsoft.convertigo.engine.Engine.authenticatedSessionManager.hasRole(context.httpServletRequest.getSession(), com.twinsoft.convertigo.engine.AuthenticatedSessionManager.Role.TEST_PLATFORM_PRIVATE);
if(!isAdmin){
	throw new java.lang.Exception("You are not a server admin");
}