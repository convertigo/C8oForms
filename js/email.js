/* re write smtp step */

/** symbols */
//var smtpAuthType = "lib.actions.c8oforms.smtp.security";
//var sSender = "lib.actions.c8oforms.smtp.sender"
//var smtpUsername ="lib.actions.c8oforms.smtp.user";
//var smtpPassword = "lib.actions.c8oforms.smtp.password.secret";
//var smtpServer = "lib.actions.c8oforms.smtp.server";
//var smtpPort = "lib.actions.c8oforms.smtp.port";
//var sslProtocols = "lib.actions.c8oforms.smtp.sslProtocols"


/* define "enum" for auth type */ 
var SmtpAuthType = {
	none: "None",
	basic: "Basic",
	startTls: "STARTTLS",
	sslTls: "SSL/TLS"
}

/* define build mail function */
var buildMail = (message, log, sRecipients, sSender, sSubject, sMessageText, sContentType, bodyParts)=>{
	var ret = message;
	try {
		var replies = [];
		replies[0] = new javax.mail.internet.InternetAddress(sSender);
		var recipients = sRecipients.split(/,|;/)
		// Adding sender
		ret.setFrom(new javax.mail.internet.InternetAddress(sSender));
		ret.setSender(new javax.mail.internet.InternetAddress(sSender));
		ret.setReplyTo(replies);
		log.debug("(Sequence SmtpStep) list of recipients: "+ JSON.stringify(recipients));
		//Adding recipients
		// when there is just 1 reciepent
		if (recipients[0].indexOf(":") != -1) {
			ret.addRecipient(javax.mail.Message.RecipientType.TO, new javax.mail.internet.InternetAddress(recipients[0].split(":")[1]));
		} else {
			ret.addRecipient(javax.mail.Message.RecipientType.TO, new javax.mail.internet.InternetAddress(recipients[0]));
		}
		for (var i = 1; i < recipients.length; i++) {
			if (recipients[i].indexOf(":") != -1) {
				var sRecipientType  = recipients[i].split(":")[0];
				var sRecipientAddress  = recipients[i].split(":")[1];
				if(sRecipientAddress != "" && /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(sRecipientAddress)){
					log.debug("(Sequence SmtpStep) valid email adress : "+ sRecipientAddress+ " we will add it to recipients");
					if ("TO".toUpperCase() === sRecipientType.toUpperCase()) {
						ret.addRecipient(javax.mail.Message.RecipientType.TO, new javax.mail.internet.InternetAddress(sRecipientAddress));
					} else if ("BCC".toUpperCase() === sRecipientType.toUpperCase()) {
						ret.addRecipient(javax.mail.Message.RecipientType.BCC, new javax.mail.internet.InternetAddress(sRecipientAddress));
					} else {
						ret.addRecipient(javax.mail.Message.RecipientType.CC, new javax.mail.internet.InternetAddress(sRecipientAddress));
					}
				}
				else{
					log.warn("(Sequence SmtpStep) invalid email adress : "+ sRecipientAddress+ " we will ignore it");
				}
			} else {
				if(recipients[i] != ""){
					ret.addRecipient(javax.mail.Message.RecipientType.CC, new javax.mail.internet.InternetAddress(recipients[i]));
				}
			}
		}		
		//Adding mail subject
		ret.setSubject(sSubject);

		//Adding content
		if (bodyParts.size() > 0) {
			var multipart = new javax.mail.internet.MimeMultipart();
			var msgPart = new javax.mail.internet.MimeBodyPart();
			msgPart.setContent(sMessageText, sContentType);
			multipart.addBodyPart(msgPart);
			for(var i =0; i < bodyParts.size(); i++) {
				multipart.addBodyPart(bodyParts.get(i));
			}
			ret.setContent(multipart);
		} else {
			ret.setContent(sMessageText, sContentType);
		}
	} catch (e1) {
		log.error("(Sequence SmtpStep) An error occured while trying to build e-mail : " + e1);
	}
	return ret;
}

var findFileXsl = (xslFilepath, currentProjectName)=>{
	var fileXSL = null;
	if (xslFilepath.length > 0) {
		fileXSL = new java.io.File(com.twinsoft.convertigo.engine.Engine.theApp.filePropertyManager.getFilepathFromProperty(xslFilepath, currentProjectName));
		if (!fileXSL.exists()) {
			var cancelLog = false;
			if(xslFilepath.startsWith("./")){
				// split filePath with / to retrive project name
				var projectNameCustom = xslFilepath.split("/")[1];
				log.debug("projectNameCustom : " + projectNameCustom);
				// get project directory
				var projectDirectoryCustom = com.twinsoft.convertigo.engine.Engine.theApp.projectDir(projectNameCustom);
				log.debug("projectDirectoryCustom : " + projectDirectoryCustom);
				// get fullPath
				var fullPathCustom = projectDirectoryCustom + "/" + (xslFilepath.substring(projectNameCustom.length+2));
				log.debug("fullPathCustom : " + fullPathCustom);
				// normalize path ( \\ for windows os and / for linux os)
				fullPathCustom = com.twinsoft.convertigo.engine.Engine.resolveProjectPath(fullPathCustom);
				log.debug("fullPathCustom : " + fullPathCustom);
				// test again presence of file
				fileXSL = new java.io.File(fullPathCustom);
				if (fileXSL.exists()) {
					cancelLog = true;
					log.debug("fullPathCustom file exists");
				}
			}
			if(!cancelLog){
				log.error("(Sequence SmtpStep) SMTP step missing xsl file");
			}
		}
	}
	return fileXSL;
}

var defineContentType = (sContentType, fileXSL)=>{
	if (sContentType.length == 0) {
		sContentType = fileXSL != null ? "text/html; charset=UTF-8" : "text/plain; charset=UTF-8";
	}
	return sContentType;
}


/** sendMail function
 * @param attachments: array of attachments (path, name)
 */
var sendMail = (sRecipients, sSubject, xslFilepath, sContentType, body, currentProjectName, attachments)=>{
	var fileXSL = findFileXsl(xslFilepath, currentProjectName);
	sContentType = defineContentType(sContentType, fileXSL);
	var transformer = fileXSL != null ? com.twinsoft.convertigo.engine.util.XMLUtils.getNewTransformer(new javax.xml.transform.stream.StreamSource(fileXSL)) : com.twinsoft.convertigo.engine.util.XMLUtils.getNewTransformer();
	transformer.setOutputProperty(javax.xml.transform.OutputKeys.INDENT, "yes");
	transformer.setOutputProperty("{http://xml.apache.org/xslt}indent-amount", "4");
	transformer.setOutputProperty(javax.xml.transform.OutputKeys.OMIT_XML_DECLARATION, "yes");
	var sw = new java.io.StringWriter();
	context.addTextNodeUnderRoot("tableBody", body);
	
	transformer.transform(new javax.xml.transform.dom.DOMSource(context.outputDocument), new javax.xml.transform.stream.StreamResult(sw));
	sMessageText = sw.toString();
	var bodyParts = new java.util.LinkedList();
	bodyParts.clear();
	for (var i in attachments) {
		var attachment = attachments[i];
		var filepath = attachment["path"];
		try {
			
			filepath = filepath == undefined  ? "" : filepath;
			if (filepath.length > 0) {
				var file = new java.io.File(com.twinsoft.convertigo.engine.Engine.theApp.filePropertyManager.getFilepathFromProperty(filepath, com.twinsoft.convertigo.engine.Engine.theApp.databaseObjectsManager.getOriginalProjectByName(currentProjectName).getName()));
				if (file.exists()) {
					if (file.isFile()) {
						var filename = attachment["name"];
						filename = filename == undefined ? file.getName() : filename;
						var bodyPart = new javax.mail.internet.MimeBodyPart();
						bodyPart.attachFile(file);
						var index = filename.indexOf("_");
						index = index == -1 ? 0 : index + 1
						bodyPart.setFileName(filename.substring(index));
						//bodyPart.setContentID("some-image-cid");
						//bodyPart.setDisposition(javax.mail.internet.MimeBodyPart.INLINE);
						bodyParts.add(bodyPart);
					} else {
						log.info("(Sequence SmtpStep) Unable attach a directory : " + file.getAbsolutePath());
					}
				} else {
					log.info("(Sequence SmtpStep) attach an unexisting file : " + file.getAbsolutePath());
				}
			} else {
				log.info("(Sequence SmtpStep) Unable attach an empty filepath");
			}
		} catch (e) {
			log.info("(Sequence SmtpStep) Unable attach " + filepath + " error: "+JSON.stringify(e));
		}							
	}
	var running = false;
	var r = new java.lang.Runnable() {
		run: () => {
			// copy variables before their deletion from scope
			var logRunnable = log;
			var SmtpAuthTypeRunnable = SmtpAuthType;
			var smtpAuthTypeRunnable = smtpAuthType;
			var smtpServerRunnable = smtpServer;
			var smtpPortRunnable = smtpPort;
			var smtpSslProtocolsRunnable = sslProtocols;
			var smtpUsernameRunnable = smtpUsername;
			var smtpPasswordRunnable = smtpPassword;
			var attachmentsRunnable = attachments;
			var currentProjectNameRunnable = currentProjectName;
			// create deleteAttachmentsAfterEmail to execute after sending email
			var deleteAttachmentsAfterEmail = ()=>{
				for(var i in attachmentsRunnable){
					try{
						var current = attachmentsRunnable[i];
						var filepath = current == undefined || current["path"] == undefined ? "": current["path"];
						var file = new java.io.File(com.twinsoft.convertigo.engine.Engine.theApp.filePropertyManager.getFilepathFromProperty(filepath, com.twinsoft.convertigo.engine.Engine.theApp.databaseObjectsManager.getOriginalProjectByName(currentProjectNameRunnable).getName()));
						if(file.exists()){
							if(file.delete()){
								logRunnable.info("(Sequence SmtpStep) Attachment file '"+current["name"]+"' has been succesfully deleted");
							}
							else{
								logRunnable.warn("(Sequence SmtpStep) Can't delete attachment file '"+current["name"]+"'");
							}
						}
					}
					catch(e){
						logRunnable.warn("(Sequence SmtpStep) An error occured wile deleting attachment file '"+current["name"]+"' " + JSON.stringify(e));
					}
				}
			}
			
			logRunnable.info("(Sequence SmtpStep): starting async Thread");
			// equivalent to sendMess
			var mailcapCommandMap = null;
			var props = new java.util.Properties();
			try {
				if (mailcapCommandMap == null) {
					var mc = javax.activation.CommandMap.getDefaultCommandMap();
					if (mailcapCommandMap == null) {
						mc.addMailcap("text/html;; x-java-content-handler=com.sun.mail.handlers.text_html");
						mc.addMailcap("text/xml;; x-java-content-handler=com.sun.mail.handlers.text_xml");
						mc.addMailcap("text/plain;; x-java-content-handler=com.sun.mail.handlers.text_plain");
						mc.addMailcap("multipart/*;; x-java-content-handler=com.sun.mail.handlers.multipart_mixed");
						mc.addMailcap("multipart/mixed;; x-java-content-handler=com.sun.mail.handlers.multipart_mixed");
						mc.addMailcap("message/rfc822;; x-java-content- handler=com.sun.mail.handlers.message_rfc822");
					}
					mailcapCommandMap = mc;
				}
				// define auth properties
				var smtpKind = smtpAuthTypeRunnable == SmtpAuthTypeRunnable.sslTls ? "smtps" : "smtp";
				props.put("mail."+smtpKind+".host", ""+smtpServerRunnable);
				props.put("mail."+smtpKind+".port", ""+smtpPortRunnable);
				props.put("mail.transport.protocol", smtpKind);
				props.put("mail."+smtpKind+".auth", ""+(smtpAuthTypeRunnable != SmtpAuthTypeRunnable.none));
				if(smtpAuthTypeRunnable == SmtpAuthTypeRunnable.sslTls){
					props.put("mail."+smtpKind+".ssl.protocols", ""+smtpSslProtocolsRunnable);
				}
				else if(smtpAuthTypeRunnable == SmtpAuthTypeRunnable.startTls){
					props.put("mail."+smtpKind+".ssl.protocols", ""+smtpSslProtocolsRunnable);
					props.put("mail.smtp.starttls.enable", ""+(smtpAuthTypeRunnable == SmtpAuthTypeRunnable.startTls));
					props.put("mail.smtp.starttls.required", "true");
				}
				var auth = null;
				if(smtpAuthTypeRunnable == SmtpAuthTypeRunnable.sslTls){
					auth = new javax.mail.Authenticator({
						// override java 
						getPasswordAuthentication: function() {
							var username = smtpUsernameRunnable;
							var password = smtpPasswordRunnable;
							return new javax.mail.PasswordAuthentication(username, password);
						}
					});
				}
				
				var mailSession = javax.mail.Session.getInstance(props, auth);
				var message = new javax.mail.internet.MimeMessage(mailSession);
			
				// Building message
				message = buildMail(message, logRunnable, sRecipients, sSender, sSubject, sMessageText, sContentType, bodyParts);
			
				//Sending e-mail
				logRunnable.info("(Sequence SmtpStep) Sending e-mail with "+smtpAuthTypeRunnable);
				var transport = mailSession.getTransport(smtpKind);
				running = true;
				if(smtpAuthTypeRunnable == SmtpAuthTypeRunnable.sslTls || smtpAuthTypeRunnable == SmtpAuthTypeRunnable.basic){
					transport.connect(smtpServerRunnable, +smtpPortRunnable, smtpUsernameRunnable, smtpPasswordRunnable);
				}
				else if(smtpAuthTypeRunnable == SmtpAuthTypeRunnable.startTls){
					transport.connect(smtpServerRunnable, smtpUsernameRunnable, smtpPasswordRunnable);
				}
				if(smtpAuthTypeRunnable == SmtpAuthTypeRunnable.none){
					javax.mail.Transport.send(message);
				}
				else{
					transport.sendMessage(message, message.getAllRecipients());
				}
				transport.close();
				logRunnable.info("(Sequence SmtpStep) E-mail has been sent");
				deleteAttachmentsAfterEmail();
				
			} catch (e) {
				logRunnable.error("(Sequence SmtpStep) An error occured while trying to send e-mail : " + e + (e.javaException != undefined ? "\n"+e.javaException : ""));
				
				deleteAttachmentsAfterEmail();
			}
			logRunnable.info("(Sequence SmtpStep): ending async Thread");
		}
	};
	new java.lang.Thread(r).start();
	var cpt = 500;
	while(running != true && --cpt){
		java.lang.Thread.sleep(50);
	}
}




