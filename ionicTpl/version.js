// Author Charles GRIMONT
/**
 * Allow us to set package.json version number into c8osdk
 */
const jq = require('node-jq');
const fs = require('fs')
const path = require('path');
const yaml = require('js-yaml');

const filter = ':version'
const pathVersion = path.join(
    __dirname, '..', '..', 'c8oProject.yaml'
)
const regex0 = /__C80__REPLACE__DATA__VERSION/g
const c8ofile = "./projects/c8osdkangular/src/lib/c8o.service.ts"
const filePathAng = [{
        path: path.join(
            __dirname, '..', '..', 'DisplayObjects', 'mobile', 'assets', 'i18n', 'en.json'
        ),
        type: "i18n"
    },
    {
        path: path.join(
            __dirname, '..', '..', 'DisplayObjects', 'mobile', 'assets', 'i18n', 'fr.json'
        ),
        type: "i18n"
    },
    {
        path: path.join(
            __dirname, '..', '..', 'DisplayObjects', 'mobile', 'assets', 'i18n', 'es.json'
        ),
        type: "i18n"
    },
    {
        path: path.join(
            __dirname, '..', '..', 'DisplayObjects', 'mobile', 'assets', 'i18n', 'it.json'
        ),
        type: "i18n"
    },
    {
        path: path.join(
            __dirname, 'ngsw-config-sub-pwa.json'
        ),
        type: "ngsw"
    },
     {
        path: path.join(
            __dirname, '..', '..', 'ngswForPWA', 'ngsw-config-sub-pwa.json'
        ),
        type: "ngsw"
    },
    {
        path: path.join(
            __dirname, 'ngsw-config.json'
        ),
        type: "ngsw"
    }
];

// get c8oforms version from c8oProject.yaml
let version = "";
try {
    let fileContents = fs.readFileSync(pathVersion, 'utf8');
    version = yaml.load(fileContents)["↓C8Oforms [core.Project]"].version;
    console.log("Current c8oforms version is: " + version);
} catch (e) {
    console.log("An error ocurred while getting c8oforms version \n" + e);
}

// get all i18n files and write version into it
for (let { path, type }
    of filePathAng) {
    try {
        let i18Json = JSON.parse(fs.readFileSync(path));
        if (type == "i18n") {
            i18Json.version_c8o = version;
        } else {
            i18Json.appData.version = version;
        }
        console.log(path + " read and parsed successfully");
        fs.writeFileSync(path, JSON.stringify(i18Json, null, 4));
        console.log("Successfully written version: " + version + " to " + path);

    } catch (e) {
        console.log("An error ocurred while overrifing i18n \n" + e);
    }
}