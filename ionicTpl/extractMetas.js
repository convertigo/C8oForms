const fs = require('fs');
const path = require('path');

function findProjectRoot(fromDir) {
  let current = path.resolve(fromDir);
  while (current !== path.dirname(current)) {
    if (
      fs.existsSync(path.join(current, 'c8oProject.yaml')) &&
      fs.existsSync(path.join(current, '_c8oProject'))
    ) {
      return current;
    }
    current = path.dirname(current);
  }
  return path.resolve(fromDir, '..');
}

const projectRoot = findProjectRoot(__dirname);
const yamlFilePath = path.join(projectRoot, '_c8oProject/mobilePages/editorPage.yaml');
const PaletteFile = path.join(projectRoot, 'DisplayObjects/mobile/assets/components/Palette.json');
let fileOutput = path.join(projectRoot, 'DisplayObjects/mobile/assets/components/AllTypes.json');

const boxStyleShape = {
  margin: "",
  padding: "",
  backgroundColor: "",
  textColor: "",
  textColorMode: "",
  border: "",
  borderWidth: "",
  borderStyle: "",
  borderColor: "",
  borderRadius: "",
  borderTop: "",
  borderRight: "",
  borderBottom: "",
  borderLeft: "",
  verticalAlign: ""
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function hasOwn(value, key) {
  return value != null && Object.prototype.hasOwnProperty.call(value, key);
}

function ensureObject(target, key, defaults) {
  if (target[key] == null || typeof target[key] !== "object" || Array.isArray(target[key])) {
    target[key] = clone(defaults);
    return;
  }
  for (const defaultKey of Object.keys(defaults)) {
    if (!hasOwn(target[key], defaultKey)) {
      target[key][defaultKey] = clone(defaults[defaultKey]);
    }
  }
}

function emptyVisibleIfGroup(type) {
  return {
    type: type,
    condVisible: "and",
    conds: [],
    groups: []
  };
}

function emptyConditions() {
  const buttonStateIf = emptyVisibleIfGroup("visibleIf");
  buttonStateIf.__uiMode = "button_state_always_enabled";
  buttonStateIf.__legacyConds = [];
  const visibleIf = emptyVisibleIfGroup("visibleIf");
  visibleIf.__legacyConds = [];
  return {
    visibleIf: visibleIf,
    goToPageIf: emptyVisibleIfGroup("goToPageIf"),
    buttonStateIf: buttonStateIf
  };
}

function isFormComponent(topic, objToInsert) {
  const topicType = topic == null ? "" : topic.type;
  return objToInsert != null && objToInsert.cat !== "action" && topicType !== "actions" && topicType !== "background_process";
}

function enrichFormComponentContract(objToInsert, topic) {
  if (!isFormComponent(topic, objToInsert)) {
    return objToInsert;
  }
  if (objToInsert.config == null || typeof objToInsert.config !== "object" || Array.isArray(objToInsert.config)) {
    objToInsert.config = {};
  }
  if (!hasOwn(objToInsert.config, "componentDisabled")) {
    objToInsert.config.componentDisabled = false;
  }
  ensureObject(objToInsert.config, "boxStyle", boxStyleShape);
  if (objToInsert.type !== "button" && objToInsert.type !== "description") {
    ensureObject(objToInsert.config, "questionBoxStyle", boxStyleShape);
    ensureObject(objToInsert.config, "componentBoxStyle", boxStyleShape);
  }
  if (objToInsert.type === "layout" || objToInsert.type === "ion-card") {
    ensureObject(objToInsert.config, "layoutChildrenStyle", {
      default: clone(boxStyleShape),
      first: clone(boxStyleShape),
      last: clone(boxStyleShape)
    });
  }
  ensureObject(objToInsert, "conditions", emptyConditions());
  return objToInsert;
}

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
            allTypes.push(enrichFormComponentContract(obj.getObjToInsert(components.type, new Date().getTime(), "PAGE1"), elem));
            
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
