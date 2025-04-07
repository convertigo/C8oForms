// Imports and helpers functions

// Importing necessary resources from the 'com.twinsoft.convertigo.engine' library.
var theApp = com.twinsoft.convertigo.engine.Engine.theApp;
var fsclient = theApp.couchDbManager.getFullSyncClient();
var InternalHttpServletRequest = com.twinsoft.convertigo.engine.requesters.InternalHttpServletRequest;
var XmlToJson = com.twinsoft.convertigo.engine.util.XMLUtils.XmlToJson;
var jsonToXml = com.twinsoft.convertigo.engine.util.XMLUtils.jsonToXml;
var InternalRequester = com.twinsoft.convertigo.engine.requesters.InternalRequester;
var HashMap = java.util.HashMap;
var enums = com.twinsoft.convertigo.engine.enums;
var Files = java.nio.file.Files;
var Path = java.nio.file.Path;
var Paths = java.nio.file.Paths;
var FileUtils = org.apache.commons.io.FileUtils;
var File = java.io.File;


var isWindows = org.apache.commons.lang3.SystemUtils.IS_OS_WINDOWS;
var separator = isWindows ? "\\" : "/";
var projectPath = com.twinsoft.convertigo.engine.Engine.theApp.databaseObjectsManager.getOriginalProjectByName("C8Oforms").getDirPath();



let JsonToDomElement = function(json) {
	let DocumentBuilderFactory = javax.xml.parsers.DocumentBuilderFactory;
	let DocumentBuilder = javax.xml.parsers.DocumentBuilder;
	let Document = org.w3c.dom.Document;
	let Element = org.w3c.dom.Element;
	let XPathAPI = org.apache.xpath.XPathAPI;
	let txt = (typeof json == "string") ? json : JSON.stringify(json);
	json = new org.codehaus.jettison.json.JSONObject(txt);
	let factory = DocumentBuilderFactory.newInstance();
	let builder = factory.newDocumentBuilder();
	let document = builder.newDocument();
	let newElement = document.createElement("item");
	jsonToXml(json, newElement);
	let all = XPathAPI.selectNodeList(newElement, "./*");
	return all;
}

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
		if (parametersJS[keys[i]] != null) {
			parameters.put(keys[i], parametersJS[keys[i]]);
		}

	}
	var requester = new InternalRequester(parameters, context.httpServletRequest);
	let response = requester.processRequest();
	response = toJSON(XmlToJson(response.getDocumentElement(), true, true, enums.JsonOutput.JsonRoot.docNode));
	org.apache.log4j.MDC.put("ContextualParameters", context.logParameters);
	var ctx2 = requester.getContext();
	theApp.contextManager.remove(ctx2);
	return response;
}

/**
 * Calls a sequence within a project into a duplicated session and returns its response.
 * 
 * @param {string} project - The project name.
 * @param {string} sequence - The sequence name.
 * @param {Object} parametersJS - The parameters for the sequence.
 * @param {Object} parametersJS - The http session attributes to to be set in current session. Null value is provided we will get from current session
 * @returns {Object} The response from the sequence call.
 */
var callSequenceInDuplicateSession = function (project, sequence, parametersJS, httpSessionAttributes) {
	let session;
	let response;
	try{
		var parameters = new HashMap();
		var __project = java.lang.reflect.Array.newInstance(java.lang.String, 1);
		__project[0] = project;
		parameters.put("__project", __project);
		parameters.put("__sequence", sequence);
		parameters.put("__context", "syncContext_" + java.lang.System.currentTimeMillis());
		let keys = Object.keys(parametersJS);
		for (var i = 0; i < keys.length; i++) {
			if (parametersJS[keys[i]] != null) {
				parameters.put(keys[i], parametersJS[keys[i]]);
			}
		}
		var request = new InternalHttpServletRequest();
		// copy session attributes for the inner call if not already provided
		session = request.getSession(true);
		if(httpSessionAttributes == null){
			httpSessionAttributes = getCurrentHttpSessionAttributes();
		}
		let session_keys = Object.keys(httpSessionAttributes);
		for(let i = 0; i < session_keys.length; i++){
			session.setAttribute(session_keys[i], httpSessionAttributes[session_keys[i]]);
		}
		requester = new InternalRequester(parameters, request);
		response = requester.processRequest();
		response = toJSON(XmlToJson(response.getDocumentElement(), true, true, enums.JsonOutput.JsonRoot.docNode));
		org.apache.log4j.MDC.put("ContextualParameters", context.logParameters);
		var ctx2 = requester.getContext();
		theApp.contextManager.remove(ctx2);
		return response;
	}
	catch(e){
		console.log("An error occured while running callSequenceInDuplicateSession", e, "warn");
	}
	finally{
		session.invalidate();
		return response;
	}	
}

/**
 * Gets current http session attributes
 * 
 * @param {string} project - The project name.
 * @param {string} sequence - The sequence name.
 * @param {Object} parametersJS - The parameters for the sequence.
 * @returns {Object} The response from the sequence call.
 */
var getCurrentHttpSessionAttributes = function() {
	let httpSessionAttributes = {};
	var names = context.httpSession.getAttributeNames();
	while (names.hasMoreElements()) {
		var name = names.nextElement();
		if(name != "__c8o:contexts__"){
			httpSessionAttributes[name] = context.httpSession.getAttribute(name);
		}
	}
	return httpSessionAttributes;
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
let getDoc = function (id, parametersJS, db) {
	if (!db) {
		db = "c8oforms_fs";
	}
	// get non published form
	var parameters = new HashMap();
	// legacy before, parametersJS was string rev
	if (typeof parametersJS == "string") {
		parameters.put("rev", new java.lang.String(parametersJS));
	}
	else if (parametersJS != null) {
		for (let i in parametersJS) {
			parameters.put(i, new java.lang.String(parametersJS[i]));
		}
	}
	let doc = toJSON(fsclient.getDocument(db, id, parameters));
	return doc;
}

let deleteDoc = function(id, rev, db) {
	if (!db) {
		db = "c8oforms_fs";
	}
	var doc;
	if(rev != null){
		 doc = toJSON(fsclient.deleteDocument(db, id, rev));
	}
	else{
		docRev = getDoc(id, null, db);
		doc = toJSON(fsclient.deleteDocument(db, id, docRev._rev));
	}
	return doc;
}

let postBulkDocs = function(db, docs, all_or_nothing, new_edits, policy, mergeRules, useHash) {
	let result = fsclient.postBulkDocs(db, docs, all_or_nothing, new_edits, policy, mergeRules, useHash);
	try{
		return JSON.parse(result);
	}
	catch(e){
		return {error: true};
	}
	
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

let getContentType = function (pathToFile) {
	//try{
	path = Paths.get(pathToFile);
	log.warn("tttt path " + path.toString());
	let mimeType = Files.probeContentType(path);
	log.warn("tttt " + mimeType.toString());
	return mimeType;
	/*}
	catch(e){
		console.log("eeee", JSON.stringify(e), "warn");
		return enums.MimeType.OctetStream.value();
	}*/
}

let getIsWindows = function () {
	return org.apache.commons.lang3.SystemUtils.IS_OS_WINDOWS;
}

let getSeparator = function (_isWindows) {
	return _isWindows ? "\\" : "/";
}

let getProjectPath = function (_projectName) {
	return com.twinsoft.convertigo.engine.Engine.theApp.databaseObjectsManager.getOriginalProjectByName(_projectName).getDirPath();
}

let createArray = function (value) {
	return Array.from({ length: +value }, (_, i) => i + 1);
}

let encodeFileToBase64Binary = function (file) {
	try{
		fileContent = Files.readAllBytes(file.toPath());
		return java.util.Base64.getEncoder().encodeToString(fileContent);
	}
	catch(e){
		log.warn(e);
		console.log("encodeFileToBase64Binary", e, "warn");
	}
	
}

let encodeTxtToBase64Binary = function (text){
	let val = new java.lang.String(text).getBytes('utf8')
	return java.util.Base64.getEncoder().encodeToString(val);
}

let deleteDir = function(dirName) {
	FileUtils.deleteDirectory(new File(dirName));
}

// This function writes an array of data to a CSV file.
let writeArrayToCsvFile = function(data, options, filePath) {
    // Create an OutputStreamWriter with the specified encoding.
    var outputStreamWriter = new java.io.OutputStreamWriter(
        new java.io.FileOutputStream(filePath),
        options.encoding
    );

    // Set the field separator. If not provided in options, default to ','.
    var fieldSeparator = options.fieldSeparator || ',';

    // Set the string delimiter. If not provided in options, default to '"'.
    var stringDelimiter = options.stringDelimiter || '"';

    // Set the line separator. This is currently hardcoded to '\r\n'.
    var lineSeparator = '\r\n';

    // Iterate over each row in the data array.
    data.forEach(function(row) {
        // Map each field in the row to a CSV-compliant string.
        var csvLine = row.map(function(field) {
            if (typeof field === 'string') {
                // If the field is a string, escape the string delimiter if it is present in the field.
                field = field.replace(new RegExp(stringDelimiter, 'g'), stringDelimiter + stringDelimiter);
                // Enclose the field with the string delimiter.
                return stringDelimiter + field + stringDelimiter;
            }
            // If the field is not a string, return it as is.
            return field;
        }).join(fieldSeparator) + lineSeparator; // Join all fields with the field separator and append the line separator.
        
        // Write the CSV line to the file.
        outputStreamWriter.write(csvLine);
    });
    
    // Flush the OutputStreamWriter to ensure all data is written to the file.
    outputStreamWriter.flush();

    // Close the OutputStreamWriter.
    outputStreamWriter.close();
}

let getFormattedDate = function(date){
		var year = date.getFullYear();
		var month = (date.getMonth() + 1).toString();
		var formatedMonth = (month.length === 1) ? ("0" + month) : month;
		var day = date.getDate().toString();
		var formatedDay = (day.length === 1) ? ("0" + day) : day;
		var hour = date.getHours().toString();
		var formatedHour = (hour.length === 1) ? ("0" + hour) : hour;
		var minute = date.getMinutes().toString();
		var formatedMinute = (minute.length === 1) ? ("0" + minute) : minute;
		var second = date.getSeconds().toString();
		var formatedSecond = (second.length === 1) ? ("0" + second) : second;
        return formatedDay + "-" + formatedMonth + "-" + year + " " + formatedHour + ':' + formatedMinute + ':' + formatedSecond;
}
try{
	Object.defineProperty(Array.prototype, 'flatMap', {
		enumerable: false,
		value: function (f, ctx) {
			return this.reduce
				((r, x, i, a) =>
					r.concat(f.call(ctx, x, i, a))
					, []
				)
		}
	});
}
catch(e){
	
}
