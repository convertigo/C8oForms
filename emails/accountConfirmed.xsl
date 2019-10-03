<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:lxslt="http://xml.apache.org/xslt"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:output encoding="UTF-8" indent="no"
		media-type="text/html" method="html" />
	<xsl:template match="document">
		<html>
			<head>
				<meta name="viewport" content="width=device-width" />
				<meta http-equiv="Content-Type"
					content="text/html; charset=UTF-8" />
				<title>Simple Transactional Email</title>
				<style>
					/* -------------------------------------
					INLINED WITH
					htmlemail.io/inline
					------------------------------------- */
					/*
					-------------------------------------
					RESPONSIVE AND MOBILE FRIENDLY
					STYLES
					------------------------------------- */
					@media only screen
					and (max-width: 620px) {
					table[class=body] h1 {
					font-size: 28px
					!important;
					margin-bottom: 10px !important;
					}
					table[class=body] p,
					table[class=body] ul,
					table[class=body] ol,
					table[class=body] td,
					table[class=body] span,
					table[class=body] a {
					font-size: 16px
					!important;
					}
					table[class=body] .wrapper,
					table[class=body] .article {
					padding: 10px !important;
					}
					table[class=body] .content {
					padding: 0
					!important;
					}
					table[class=body] .container {
					padding: 0 !important;
					width: 100% !important;
					}
					table[class=body] .main {
					border-left-width: 0 !important;
					border-radius: 0 !important;
					border-right-width: 0 !important;
					}
					table[class=body] .btn table {
					width: 100% !important;
					}
					table[class=body] .btn a {
					width: 100%
					!important;
					}
					table[class=body] .img-responsive {
					height: auto
					!important;
					max-width: 100% !important;
					width: auto !important;
					}
					}

					/*
					-------------------------------------
					PRESERVE THESE STYLES IN THE
					HEAD
					------------------------------------- */
					@media all {
					.ExternalClass {
					width: 100%;
					}
					.ExternalClass,
					.ExternalClass p,
					.ExternalClass span,
					.ExternalClass font,
					.ExternalClass td,
					.ExternalClass div {
					line-height: 100%;
					}
					.apple-link a {
					color:
					inherit !important;
					font-family: inherit !important;
					font-size:
					inherit !important;
					font-weight: inherit !important;
					line-height:
					inherit !important;
					text-decoration: none !important;
					}
					.btn-primary
					table td:hover {
					background-color: #34495e !important;
					}
					.btn-primary
					a:hover {
					background-color: #34495e !important;
					border-color: #34495e
					!important;
					}
					}
				</style>
			</head>


			<body class=""
				style="background-color: #f6f6f6; font-family: sans-serif; -webkit-font-smoothing: antialiased; font-size: 14px; line-height: 1.4; margin: 0; padding: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">
				<table class="body"
					style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; background-color: #f6f6f6;"
					border="0" cellspacing="0" cellpadding="0">
					<tbody>
						<tr>
							<td
								style="font-family: sans-serif; font-size: 14px; vertical-align: top;">&#160; </td>
							<td class="container"
								style="font-family: sans-serif; font-size: 14px; vertical-align: top; display: block; margin: 0 auto; max-width: 580px; padding: 10px; width: 580px;">
								<div class="content"
									style="box-sizing: border-box; display: block; margin: 0 auto; max-width: 580px; padding: 10px;">
									<table class="main"
										style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; background: #ffffff; border-radius: 3px;"><!-- START MAIN CONTENT AREA -->
										<tbody>
											<tr>
												<td class="wrapper"
													style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;">
													<table
														style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;"
														border="0" cellspacing="0" cellpadding="0">
														<tbody>
															<tr>
																<td
																	style="font-family: sans-serif; font-size: 14px; vertical-align: top;">
																	<img
																		style="display: block; margin-left: auto; margin-right: auto;"
																		src="https://www.convertigo.com/wp-content/themes/EightDegree/images/logo_convertigo.png"
																		width="145" height="46" />
																	<h1 style="text-align: center;">Convertigo Forms Builder</h1>
																	
																	
																	<p
																		style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Nouvelle réponse dans votre formulaire <b> <xsl:value-of select="//formName" ></xsl:value-of></b></p>
																	
																	<p
																		style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Pour télécharger les réponses au format csv, veuillez cliquer <a href="{//linkCsv}">ici</a></p>
																	<p
																		style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Vous pouvez vous désabonner aux notifications en cliqant sur ce <a href="www.google.com">lien.</a></p>


																</td>
															</tr>
														</tbody>
													</table>
												</td>
											</tr>
										</tbody>
									</table>

									<br /><br /><br />

									<div class="footer"
										style="clear: both; margin-top: 10px; text-align: center; width: 100%;">
										<table
											style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; background-color: black;"
											border="0" cellspacing="0" cellpadding="0">
											<tbody>
												<tr>
													<td class="content-block"
														style="font-family: sans-serif; vertical-align: top; padding-bottom: 10px; padding-top: 10px; font-size: 12px; color: #999999; text-align: center; width: 556px;">
														<span class="apple-link"
															style="color: #ffffff; font-size: 12px; text-align: center;">Convertigo form builder is brought to you by Convertigo.SA</span>
													</td>
												</tr>
												<tr>
													<td class="content-block powered-by"
														style="font-family: sans-serif; vertical-align: top; padding-bottom: 10px; padding-top: 10px; font-size: 12px; color: #999999; text-align: center; width: 556px;">
														<span style="color: #ffffff;">
															Please visit
															<a style="color: #ffffff;"
																href="http://www.convertigo.com">www.convertigo.com</a>
															&#160;for
															details
														</span>
													</td>
												</tr>
											</tbody>
										</table>
									</div>
									<!-- END FOOTER --> <!-- END CENTERED WHITE CONTAINER -->
								</div>
							</td>
							<td
								style="font-family: sans-serif; font-size: 14px; vertical-align: top;">&#160; </td>
						</tr>
					</tbody>
				</table>

			</body>
		</html>
	</xsl:template>
</xsl:stylesheet>
		