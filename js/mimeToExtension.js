const getExtensionForMimeType = (mimeType) => {
	return ((org.apache.tika.mime.MimeTypes.getDefaultMimeTypes()).forName(mimeType)).getExtension();
}