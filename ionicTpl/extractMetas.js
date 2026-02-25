const yamlFilePath = '../../_c8oProject/mobilePages/editorPage.yaml';
const PaletteFile = '../../DisplayObjects/mobile/assets/components/Palette.json';
let fileOutput = '../../DisplayObjects/mobile/assets/components/AllTypes.json';
const fs = require('fs');

function extractFunction(filename, functionName) {

  try {
    const data = fs.readFileSync(filename, 'utf8');
    const lines = data.split('\n');
      let functionCode = '';
      let capture = false;
      let openBraces = 0;

      for (let line of lines) {
        if (!capture && line.includes(`public ${functionName}(`)) {
          capture = true;
        }
        if (capture) {
          functionCode += line + '\n';
          openBraces += (line.match(/{/g) || []).length;
          openBraces -= (line.match(/}/g) || []).length;
          if (openBraces === 0 && capture) {
            capture = false;
            break;
          }
        }
      }

      if (functionCode) {
        return functionCode;
      } else {
        return null;
      }
  } catch (err) {
    console.error(`Erreur de lecture du fichier: ${err}`);
  }
}

function PerformAnalysis() {
  let jsFunction = extractFunction(yamlFilePath, 'getObjToInsert');
  if (jsFunction != null) {
    let funcParsed = jsFunction
      .replace("public getObjToInsert(typ, id, page = this.local.currentPage, nameDispo = null, customMeta= null) {", "obj.getObjToInsert = function(typ, id, page = this.local.currentPage, nameDispo = null, customMeta= null) {")
      .replace(/(\r\n|\n|\r)/gm, "")
      .replace(/''/g, "'");

    let obj = {
      getNameDispo: (prefix, obj = null, manual = null) => {
        return prefix + new Date().getTime();
      },
      local: {
        question: "Exemple de question",
        placeholder_label: "Exemple de placeholder",
        placeholder_label2: "Exemple de label",
        placeholder: "Exemple de placeholder",
        placeholder_resp: "Exemple de réponse",
        placeholderFile: "Exemple de fichier",
        labelBtn: "Action",
        title: "Titre"
      },
      translate: {
        instant: (key) => key
      },
      form: {
        flows: []
      }
    };
    eval(funcParsed);
    let allTypes = [];
    try {
      let typesDone = [];
      var palette = fs.readFileSync(PaletteFile, 'utf8');
      palette = JSON.parse(palette);
      for(let elem of palette){
        if(elem.objects){
          for(let components of elem.objects){
            if(typesDone.includes(components.type)){
              continue;
            }
            typesDone.push(components.type);
            allTypes.push(obj.getObjToInsert(components.type, new Date().getTime(), "PAGE1"));
            
          }
        }
      }
    }
    catch(e){
      console.log(e);
    }
    finally{
      try {
        fs.writeFileSync(fileOutput, JSON.stringify(allTypes, null, 2), 'utf8');
        console.log('Écriture réussie dans le fichier');
      } catch (err) {
        console.error(`Erreur d'écriture : ${err}`);
      }
    }
  }
}

PerformAnalysis();
