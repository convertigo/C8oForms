const mv = require('mv');

let sources = ['../../DisplayObjects/template-pwa/scripts/index.html', '../../DisplayObjects/template-pwa/scripts/manifest.webmanifest', '../../DisplayObjects/template-pwa/scripts/ngsw-worker.js', '../../DisplayObjects/template-pwa/scripts/ngsw.json', '../../DisplayObjects/template-pwa/scripts/assets', '../../DisplayObjects/template-pwa/scripts/svg'];
let destinations = ['../../DisplayObjects/template-pwa/index.html', '../../DisplayObjects/template-pwa/manifest.webmanifest', '../../DisplayObjects/template-pwa/ngsw-worker.js', '../../DisplayObjects/template-pwa/ngsw.json','../../DisplayObjects/template-pwa/assets', '../../DisplayObjects/template-pwa/svg'];
let promises = [];
for(let i = 0; i < sources.length; i++) {
	promises.push(new Promise((resolve, reject) => {
		mv(sources[i], destinations[i], { mkdirp: true }, function (err) {
			if (err) {
				console.error('Error moving the file: '+sources[i], err);
			} else {
				console.log('File moved successfully! '+sources[i]);
			}
			resolve();
		});
	}));
}

const fs = require('fs');
Promise.all(promises).then(()=>{
	// Lire un fichier de manière synchrone
	try {
		var ngswJson = fs.readFileSync('../../DisplayObjects/template-pwa/ngsw.json', 'utf8');
//		console.log('Contenu du fichier:', ngswJson);
		ngswJson = JSON.parse(ngswJson);
		ngswJson.assetGroups[0].urls = ngswJson.assetGroups[0].urls.map(function(url){
			if(url.endsWith(".js")){
				return url.replace("DisplayObjects/mobile/", "DisplayObjects/mobile/scripts/");
			}
			return url;
		});
		// now re write the file
		fs.writeFileSync('../../DisplayObjects/template-pwa/ngsw.json', JSON.stringify(ngswJson, null, 2));
	} catch (err) {
	  console.error('Erreur lors de la lecture du fichier:', err);
	}
});


