import { Injectable } from "@angular/core";

import { sha256 } from 'js-sha256';

@Injectable({
  providedIn: 'root'
})
export class FormsService {
  // global regex to find $$ expressions:  support both $$standalone and $$start$$end expressions
  private regex = /\$\$(?:START)?(\d+)(.*?)(?:END)?(?:\d+)?\$\$/;
  private page: any = null;

  constructor() {
  }

  /**
   * walk a given item to find enabled sources within it 
   * 
   * @param item item of the form for which we are searching for sources
   * @param path the path to find sources within item
   * @param isSource define if its a source or an action
   * @param noEval define weither this source should be evaluated at the end
   * @returns {findVars: Object, findName: string, ObjectThatHaveToCallFunc: Array, sha: string, fullSyncArgs: Object } findVars are the computed variables found, findName is the source name, ObjectThatHaveToCallFunc holds objects id that will update value of current source, sha make a unique reference for this source : a sha of its name and arguments, fullSyncArgs if it's a fullsync source, then holds fullsync arguments
   */
  public searchForSources(item: any, path: string, isSource: boolean = true, noEval: boolean = false): Object {
    // name of the source to be find
    let sourceName = "";
    // vars of the source to be find
    let vars = {};
    // fullsync arguments of the source to be find
    let fullSyncArgs = {};
    // an array that holds objects id that will update value of current source
    let ObjectThatHaveToCallFunc = [];

    // itterates over current items sources to find which one is enabled
    for (let w in item[path]) {
      // if current source is enabled
      if (item[path][w].enabled === true) {
        // iterrate over each vars of the source to find theirs value and store them
        for (const [key, value] of (<any>Object).entries(item[path][w]["vars"])) {
          vars[key] = value;
        }
        // if it's a fullsync source, then fill fullsync arguments
        if (item[path][w]["fullsync"] == true) {
          fullSyncArgs["isFullsync"] = true;
          sourceName = "fs://" + item[path][w]["connectorName"] + ".view";
          let viewName = item[path][w]["viewName"].split("/");
          fullSyncArgs["ddoc"] = viewName[0];
          fullSyncArgs["view"] = viewName[1];
          fullSyncArgs["__live"] = w;
          fullSyncArgs["connectorName"] = item[path][w]["connectorName"]
          fullSyncArgs["viewName"] = item[path][w]["viewName"];
        }
        // if it's a standard source, just save its name
        else {
          sourceName = w;
        }
      }
    }

    // make a unique reference for this source : a sha of its name and arguments
    const sha = sha256(JSON.stringify(sourceName) + JSON.stringify(vars));

    // if this source should no be evaluated then set its vars to empty
    if (noEval) {
      for (let va in vars) {
        vars[va] = "";
      }
    }
    // if this source should be evaluated
    else {
      // itterate over each vars
      for (let va in vars) {
        // if current var is the native select filter
        if (isSource && va == "forms_filter") {
          // add a ternary which evaluates the native select filter
          vars[va] = "page.local.filters_elems['" + item.id + "'] == undefined ? '': page.local.filters_elems['" + item.id + "']";
          // indicate that item has to be update when its value change
          ObjectThatHaveToCallFunc.push(item.id);
        }
        else {
          // if current var is an attachment there is nothing to be evaluated
          if (vars[va].from_attachment != undefined && vars[va].from_attachment == true) { }
          // otherwise
          else {
            // if its a convertigo x baserow builtin compatible var, then formate it  
            if (vars[va]["type"] == "filter") {
              // prepare the expected format
              let res = { filters: [], mode: null };
              // evaluate if its a "AND" or a "OR" filter
              res.mode = vars[va].condVisible.toUpperCase();
              // foreach var add an entry
              for (let cond of vars[va].conds) {
                res.filters.push({
                  "field": cond.val1.name,
                  "op": cond.operator,
                  "value": this.stringOf$$ToCode(cond.val2.str, cond.val2.type, ObjectThatHaveToCallFunc, this.regex)
                })
              }
              // store the result
              vars[va] = res;
            }
            else {
              // otherwise
              let str = this.stringOf$$ToCode(vars[va].str, vars[va].type, ObjectThatHaveToCallFunc, this.regex);
              vars[va] = str;
            }
          }
        }
      }
    }
    return { findVars: vars, findName: sourceName, ObjectThatHaveToCallFunc: ObjectThatHaveToCallFunc, sha: sha, fullSyncArgs: fullSyncArgs }
  }


  /**
   * transforms a string of $$ to a c8oforms code compatible expression
   * 
   * @param str entry string of $$ to be computed to code
   * @param type type of entry string "Aa" or "ts"
   * @param ObjectThatHaveToCallFunc holds objects id that will update value of current source
   * @param regex regex to find $$ expressions:  support both $$standalone and $$start$$end expressions
   * @returns string
   */
  public stringOf$$ToCode(stringOf$$: string, type: string, ObjectThatHaveToCallFunc: Array<any>, regex) {
    // if stringOf$$ is null undefined or an empty string there is nothing to transform
    if (stringOf$$ == undefined || stringOf$$ == "") {
      return "";
    }
    // if it's a "ts" expression escape backquotes
    if (!(type != undefined && type == "ts")) {
      stringOf$$ = "`" + stringOf$$.replace(/`/g, "\\`") + "`";
    }

    let match;
    while ((match = regex.exec(stringOf$$)) != null) {
      // start index of current match - we have to save it to be able to replace actual $$ expression by it's computed value at the end
      let iStart = match.index;
      // end index of current match - we have to save it to be able to replace actual $$ expression by it's computed value at the end
      let iEnd = match.index + match[0].length;
      // if it's a simple $$ expression, with no args (legacy support) such as $$123456789$$
      if (match[2] == undefined) {
        // get target id
        let id = match[1];
        // indicate that parent item has to be update when its value change
        ObjectThatHaveToCallFunc.push(id);
        // get raw path of the target 
        let path = this.getPathById(+id);
        // current value will be stored there
        let currentVal;
        // if it's a "ts" expression
        if (type != undefined && type == "ts") {
          currentVal = path;
        }
        // if it's an "Aa" expression
        else {
          currentVal = "`+(" + path + " instanceof Object ? JSON.stringify(" + path + ") : " + path + ")+`"
        }
        // replace the match string by computed value
        stringOf$$ = stringOf$$.substring(0, iStart) + currentVal + stringOf$$.substring(iEnd);
      }
      // if it's a modern $$ expression, with args such as $$START{args: args}END$$
      else {
        // get target id
        let id = match[1];
        // indicate that parent item has to be update when its value change
        ObjectThatHaveToCallFunc.push(id);
        // get the definition of this element (base structure)
        let defElem = this.getItemById(id);
        // get the runtime value of this element (value)
        let valElem = this.getPathById(+id);
        // get metadata 
        let meta = JSON.parse(match[2].replace(/\\/g, ""));
        // if it's a "ts" expression
        if (type != undefined && type == "ts") {
          stringOf$$ = this.$$toVal(defElem, meta, stringOf$$, iStart, valElem, iEnd, id, true)
        }
        // if it's an "Aa" expression
        else {
          stringOf$$ = this.$$toVal(defElem, meta, stringOf$$, iStart, valElem, iEnd, id, false)
        }
      }
    }
    return stringOf$$;
  }

  /**
   * compute a given $$ expresion to it's value code
   * @param defElem the definition of target element (base structure)
   * @param meta metadata arround the current expression
   * @param str expression to be evaluated
   * @param iStart start index of current match - we have to save it to be able to replace actual $$ expression by it's computed value at the end
   * @param valElem 
   * @param iEnd end index of current match - we have to save it to be able to replace actual $$ expression by it's computed value at the end
   * @param id the id of target element
   * @param ts if its a "ts" expression
   * @returns string 
   */
  public $$toVal(defElem: any, meta: any, str: string, iStart: number, valElem: any, iEnd: number, id: any, ts: boolean): string {
    // if defElem is null or undefined there is nothing to compute
    if (defElem == null) {
      return "";
    }
    // if it's not a path expression or it's a graphic formatting expression then generate adequate expression
    if ((defElem != null && meta.c8otype != "path") || (meta.c8obuiltin && meta.c8opath.split(".")[1] == "graphic_formatting")) {
      str = str.substring(0, iStart) + "`+this.getBadge(" + id + ", " + JSON.stringify(defElem) + ", " + valElem + ", " + JSON.stringify(meta) + ", false, 'html')+`" + str.substring(iEnd);
      return str;
    }
    // for any other kind of expression
    else {
      // current value will be stored there
      let currentVal = "";
      // get raw path of the target 
      let path = this.getPathById(+id);
      // switch type of target
      switch (defElem.type) {
        case "grid":
        case "checkbox":
        case "radio_group":
        case "checkbox_group":
        case "radio":
        case "slider":
        case "select":
        case "datetime":
        case "time":
          // if no path is specified and it's not "ts" expression
          if (meta.c8opath == "" && !ts) {
            currentVal = "`+" + this.selected_data_c8o_separated_by_coma(path, defElem.type, "TEXT_format") + "+`";
          }
          // if path is specified or if it's "ts" expression
          else {
            // split path
            let splitted = meta.c8opath.split(".");
            // if it's a grid or a path
            if (defElem.type == "grid" && meta.c8otype == "path") {
              // default base path is :
              let basePath = "page.local.techGrid";
              let indexBased = false;
              // if returned value is either all_the_data or nothing, we will use local source value
              if (defElem.config.returned_value == "all_the_data" || defElem.config.returned_value == "nothing") {
                basePath = "this.local.sourceValue";
                indexBased = true;
              }
              let diffUndefined = " != undefined";
              let st = "(" + ("" + basePath) + diffUndefined + " && ";
              let splittedLen = splitted.length - 1;
              splitted.forEach((value, index) => {
                // if user first configured it's grid returned_value to all_the_data or nothing and then changed it, ignore index key
                if (index == 1 && !isNaN(+value) && !indexBased) {
                  // do nothing and ignore first value key index
                }
                // if user first configured it's grid returned_value to cell_selected or row_selected and then changed it, include index key
                else if (index == 1 && isNaN(+value) && indexBased) {
                  // add default 0 index key
                  basePath += "['" + 0 + "']";
                  st += ("" + basePath) + diffUndefined + (splittedLen != index ? " && " : " ");
                  // then add the current key value
                  basePath += "['" + value + "']";
                  st += ("" + basePath) + diffUndefined + (splittedLen != index ? " && " : " ");
                }
                // nominal case everything has been confired correctly
                else {
                  basePath += "['" + value + "']";
                  st += ("" + basePath) + diffUndefined + (splittedLen != index ? " && " : " ");
                  // if experssion is not indexed based, we need to search into data key
                  if (index == 0) {
                    basePath += "['data']";
                    st += ("" + basePath) + diffUndefined + (splittedLen != index ? " && " : " ");
                  }
                }
              })
              st += "? " + basePath + " : ''" + ")";
              if (ts) {
                currentVal = st;
              }
              else {
                currentVal = "`+" + st + "+`";
              }
            }
            // if it's a builtin expression
            else if (meta.c8obuiltin == "true") {
              //{c8otype: 'path', c8opath: 'select1.value', c8oPrettyPath: '', c8obuiltin: 'false'}
              //{c8otype: 'path', c8opath: 'select1.TEXT_format', c8oPrettyPath: '', c8obuiltin: 'true'}
              let typeTargeted = splitted[1];
              let verb = splitted[2];
              if (verb == null) {
                verb = typeTargeted;
              }
              currentVal = "`+" + this[verb](path, defElem.type, typeTargeted) + "+`";
            }
            // in any other case
            else {
              // default base path is :
              let basePath = "page.local.techSelect";
              let diffUndefined = " != undefined";
              let st = "(" + ("" + basePath) + diffUndefined + " && ";
              let splittedLen = splitted.length - 1;
              splitted.forEach((value, index) => {
                basePath += "['" + value + "']";
                st += ("" + basePath) + diffUndefined + (splittedLen != index ? " && " : " ");

              })
              st += "? " + basePath + " : ''" + ")";
              if (ts) {
                currentVal = st;
              }
              else {
                currentVal = "`+" + st + "+`";
              }
            }
          }

          break;
        case "location":
          // default for str checkbox_grp
          if (meta.c8opath == "") {
            currentVal = "`+" + this.selected_data_c8o_separated_by_coma(path, defElem.type, "TEXT_format") + "+`";
          }
          else {
            let splitted = meta.c8opath.split(".");
            if (meta.c8obuiltin == "true" || meta.c8obuiltin == true) {
              let typeTargeted = splitted[1];
              let verb = splitted[2];
              if (verb == null) {
                verb = typeTargeted;
              }
              if (ts) {
                currentVal = this[typeTargeted](path, defElem.type, verb)
              }
              else {
                currentVal = "`+" + this[typeTargeted](path, defElem.type, verb) + "+`";
              }
            }
          }
          break;
        default:
          if (ts) {
            currentVal = path;
          }
          else {
            //currentVal = "`+(eval("+ path +"))+`"
            currentVal = "`+" + path + "+`";
          }
          break;
      }
      str = str.substring(0, iStart) + currentVal + str.substring(iEnd);
      return str;
    }
  }

  /**
   * return a raw path to any element value from it's id 
   * @param id id of the current target
   * @param fromComp executed from a component or not
   * @param formsSubmit formSubmit object
   * @param actions actions object
   * @returns 
   */
  public getPathById(id: any, fromComp: boolean = false): string {
    // default value for prefix page
    let prefixPage = "page.";
    // if its called from a component then update its prefix to pageOwner
    if (fromComp) {
      prefixPage += "pageOwner."
    }
    // get target name by it's id
    let name = this.getNameById(id);
    // iterrate over each key of formsSubmit object to find target comparing by key
    for (let key of Object.keys(this.page.formsSubmit)) {
      // if key equals name
      if (key == name) {
        // return path
        return prefixPage + "formsSubmit[\"" + name.replace(/"/g, '\\\"') + "\"][\"" + this.getKeyByType(this.page.formsSubmit[key].type) + "\"]";
      }
      // if it's a card then search into
      else if (this.page.formsSubmit[key].type == "ion-card") {
        // iterrate over each key of card object to find target comparing by key
        for (let keyChild of Object.keys(this.page.formsSubmit[key]["children"])) {
          // if key equals name
          if (keyChild == name) {
            // return path
            return prefixPage + "formsSubmit[\"" + key + "\"].children[\"" + name + "\"][\"" + this.getKeyByType(this.page.formsSubmit[key]["children"][keyChild].type) + "\"]";
          }
        }
      }
    }
    // iterrate over each key of actions object to find target comparing by key
    for (let key of Object.keys(this.page.actions)) {
      // if key equals name
      if (key == name) {
        // return path
        return prefixPage + "actions[\"" + name + "\"][\"" + this.getKeyByType(this.page.actions[key].type) + "\"]";;
      }
    }
    return "";
  }

  /**
   * search for element name by it's id or by a ValFieldObject
   * @param val 
   * @returns string
   */
  private getNameById(val: ValFieldObject | number): string {
    // concat both actions and formulaire object to browse in it
    var searchArray = this.page.form.formulaire.concat(this.page.form.actions);
    // iterrate over each key of searchArray object to find target comparing by id
    for (let elem of searchArray) {
      // if ids are equals
      if (elem.id == val || elem.id == (val as ValFieldObject).str) {
        // return name
        return elem.name;
      }
      // if it's a card then search into
      else if (elem.type == "ion-card") {
        // iterrate over each key of cards object to find target comparing by id
        for (let child of elem["children"]) {
          // if ids are equals
          if (child.id == val || child.id == (val as ValFieldObject).str) {
            // return name
            return child.name;
          }
        }
      }
    }
    return "";
  }

  /**
   * get subkey of any object according to it's type
   * @param type type of target
   * @returns string
   */
  public getKeyByType(type): string {
    // for checkbox, checkbox_group and radio_group subkey is children (legacy)
    if (type == "checkbox" || type == "checkbox_group" || type == "radio_group") {
      return 'children';
    }
    // othewise it's always value
    else {
      return 'value';
    }
  }

  /**
   * search an element by it's id
   * @param id id of the current target
   * @param search object to browse
   * @returns any
   */
  public getItemById(id, search = this.page.formsList): object {
    // cast id to number
    id = +id;
    // concat both actions and formulaire object to browse in it
    var searchArray = search.concat(this.page.form.actions);
    // iterrate over each key of searchArray object to find target comparing by id
    for (let obj of searchArray) {
      // if ids are equals
      if (id == obj.id) {
        // return element
        return obj;
      }
      // if it's a card then search into
      else if (obj.type == "ion-card") {
        // recursive call
        let val = this.getItemById(id, obj.children);
        // if found
        if (val != null) {
          // return element
          return val;
        }
      }
    }
    return null;
  }

  /**
   * Generates expressions that can extract data from a given target in a given format
   * @param path raw path of the target
   * @param targeType type of target
   * @param type can only be "TEXT_format"
   * @returns 
   */
  public selected_data_c8o_separated_by_coma(path, targeType, type) {
    if (type == "TEXT_format") {
      if (targeType == "checkbox_group") {
        return "Object.keys(" + path + ").filter(((x)=>{return Object.keys(" + path + "[x]).filter((y)=>{ return " + path + "[x][y].selected }).length > 0})).map((z)=>{ return " + path + "[z].filter((b)=>{return b.selected}).map((a, i)=>{var prefix = ''; if(i == 0){prefix = z + ' :' } return prefix + a.value}).join(', ') }).join('; ')";
      }
      else if (targeType == "radio_group") {
        return "Object.keys(" + path + ").filter((x)=>{return " + path + "[x] != ''}).map((y)=>{return y + ': ' +" + path + "[y]}).join(' ;')"
      }
      else if (targeType == "checkbox") {
        return path + ".filter((x)=>{return x.selected}).map((y)=>{return y.value})"
      }
      else if (targeType == "radio" || targeType == "slider" || targeType == "select" || targeType == "datetime" || targeType == "time") {
        return path;
      }
      else if (targeType == "location") {
        return "(" + path + ".addr != undefined && " + path + ".addr.FormattedAddress != undefined ? " + path + ".addr.FormattedAddress : '')";
      }
    }
  }


}

interface ValFieldObject {
  str: string;
  source: boolean;
  type: string;
  arr: Array<any>;
}
interface FieldObject {
  type: string;
  subject: string;
  operator: string;
  val1: ValFieldObject;
  val2: ValFieldObject;

}
interface FormObject {
  type: string;
  subject: string;
  operator: string;
  attribute: string;

}