// Imports and helpers functions

// Importing necessary resources from the 'com.twinsoft.convertigo.engine' library.
var theApp = com.twinsoft.convertigo.engine.Engine.theApp;
var fsclient = theApp.couchDbManager.getFullSyncClient();
var InternalHttpServletRequest = com.twinsoft.convertigo.engine.requesters.InternalHttpServletRequest;
var XmlToJson = com.twinsoft.convertigo.engine.util.XMLUtils.XmlToJson;
var InternalRequester = com.twinsoft.convertigo.engine.requesters.InternalRequester;
var HashMap = java.util.HashMap;
var enums = com.twinsoft.convertigo.engine.enums;
var Files = java.nio.file.Files;
var Path = java.nio.file.Path;
var Paths = java.nio.file.Paths;

/**
 * Parse a JSON string into a JavaScript object.
 * 
 * @param {string} json - The JSON string to parse.
 * @returns {Object} The parsed JavaScript object.
 */
var toJSON = function (json) {
	return JSON.parse(json.toString());
}

/**
 * Convert a JavaScript object or string into a Jettison JSONObject or JSONArray.
 * 
 * @param {(Object|string)} json - The JavaScript object or string to convert.
 * @returns {org.codehaus.jettison.json.JSONObject|org.codehaus.jettison.json.JSONArray} The resulting JSONObject or JSONArray.
 */
var toJettison = function (json) {
	var txt = (typeof json == "string") ? json : JSON.stringify(json);
	return txt.startsWith("{") ? new org.codehaus.jettison.json.JSONObject(txt) : new org.codehaus.jettison.json.JSONArray(txt);
}

/**
 * Calls a sequence within a project and returns its response.
 * 
 * @param {string} project - The project name.
 * @param {string} sequence - The sequence name.
 * @param {Object} parametersJS - The parameters for the sequence.
 * @returns {Object} The response from the sequence call.
 */
var callSequence = function (project, sequence, parametersJS) {
	var parameters = new HashMap();
	var __project = java.lang.reflect.Array.newInstance(java.lang.String, 1);
	__project[0] = project;
	parameters.put("__project", __project);
	parameters.put("__sequence", sequence);
	parameters.put("__context", "syncContext_" + java.lang.System.currentTimeMillis());
	let keys = Object.keys(parametersJS);
	for (var i = 0; i < keys.length; i++) {
		if(parametersJS[keys[i]] != null){
			parameters.put(keys[i], parametersJS[keys[i]]);
		}
		
	}
	var request = new InternalHttpServletRequest();
	// copy session attributes for the inner call
	var session = request.getSession(true);
	var names = context.httpSession.getAttributeNames();
	while (names.hasMoreElements()) {
		var name = names.nextElement();
		session.setAttribute(name, context.httpSession.getAttribute(name));
	}
	var requester = new InternalRequester(parameters, request);
	let response = requester.processRequest();
	response = toJSON(XmlToJson(response.getDocumentElement(), true, true, enums.JsonOutput.JsonRoot.docNode));
	org.apache.log4j.MDC.put("ContextualParameters", context.logParameters);
	var ctx2 = requester.getContext();
	theApp.contextManager.remove(ctx2);
	return response;
}

/**
 * Create a hashed user name for an anonymous user based on an ID using SHA-256.
 * 
 * @param {string} id - The ID to be hashed.
 * @returns {string} The resulting hashed username.
 */
var createUserNameForAnonymous = function (id) {
	// sha256 cypher
	var digest = java.security.MessageDigest.getInstance("SHA-256");
	var encodedhash = digest.digest(new java.lang.String(id).getBytes(java.nio.charset.StandardCharsets.UTF_8));

	// sha256 to hex
	var hexString = new java.lang.StringBuilder(2 * encodedhash.length);
	for (var i = 0; i < encodedhash.length; i++) {
		var hex = java.lang.Integer.toHexString(0xff & encodedhash[i]);
		if (hex.length() == 1) {
			hexString.append('0');
		}
		hexString.append(hex);
	}
	return hexString.toString();
}

/**
 * Retrieve a document based on its ID and revision.
 * 
 * @param {string} id - The ID of the document.
 * @param {string} [rev] - The revision of the document. (optional)
 * @returns {Object} The retrieved document.
 */
let getDoc = function (id, rev) {
	// get non published form
	var parameters = new HashMap();
	if (rev) {
		parameters.put("rev", new java.lang.String(rev));
	}
	let doc = toJSON(fsclient.getDocument("c8oforms_fs", id, parameters));
	return doc;
}

// A simple console object for logging purposes with predefined format and levels.
var console = {
	/**
	 * Logs a message with an optional associated object and specified log level.
	 * 
	 * @param {string} message - The main message to log.
	 * @param {Object} [obj=null] - Optional associated object to log with the message.
	 * @param {string} [level="none"] - The logging level, e.g., "warn", "error". Default is "none".
	 */
	log: function (message, obj, level) {
		obj = obj || null;
		level = level || "none";
		if (level == "warn") {
			log.warn("[APIV2_Publish] " + message + (obj != null ? " : " + JSON.stringify(obj) : ""));
		}
		else if (level == "error") {
			log.error("[APIV2_Publish] " + message + (obj != null ? " : " + JSON.stringify(obj) : ""));
		}
	}
}

/**
 * Determines if the given value is an array.
 * 
 * @param {*} value - The value to check.
 * @returns {boolean} True if the value is an array, false otherwise.
 */
let isArray = function (value) {
	return Object.prototype.toString.call(value) === '[object Array]';
}

/**
 * Determines if the given value is an object but not an array.
 * 
 * @param {*} value - The value to check.
 * @returns {boolean} True if the value is an object and not an array, false otherwise.
 */
let isObject = function (value) {
	return value !== null && typeof value === 'object' && !isArray(value);
}

let getContentType = function(pathToFile){
	//try{
		path = Paths.get(pathToFile);
		log.warn("tttt path " +path.toString());
		let mimeType = Files.probeContentType(path);
		log.warn("tttt " +mimeType.toString());
		return mimeType;
	/*}
	catch(e){
		console.log("eeee", JSON.stringify(e), "warn");
		return enums.MimeType.OctetStream.value();
	}*/
}
