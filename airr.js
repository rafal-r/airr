const fs = require('fs');
const uJS = require('uglify-js');
const appPath = 'source/';
const airrAppDirName = 'app/';
const airrLibPath = appPath + 'js/airr/';
const airrAppPath = appPath + airrAppDirName;
const airrConstsFilePath = appPath + airrAppDirName + 'const.js';
const path = require('path');
const airrLibStack = [
    airrLibPath + 'JSCompatibility.js',
    airrLibPath + 'Airr.js',
    airrLibPath + 'Utils.js',
    airrLibPath + 'AbstractMVCObject.js',
    airrLibPath + 'MVCObject.js',
    airrLibPath + 'Sidepanel.js',
    airrLibPath + 'View.js',
    airrLibPath + 'Scene.js',
    airrLibPath + 'I18n.js',
    airrLibPath + 'FX.js'
];
const outAppPath = 'www/';

let airrLibStackContent = {};
let index_html_content = "";

function createDir(dirPath) {
    if (!fs.existsSync(path.dirname(dirPath))) {
        createDir(path.dirname(dirPath));
    }

    fs.mkdirSync(dirPath, '0775');
}
function createFile(filePath, data) {
    if (!fs.existsSync(path.dirname(filePath))) {
        createDir(path.dirname(filePath));
    }

    fs.writeFileSync(filePath, data, {encoding: 'utf8', mode: '0775'});
}
function walkAppDir(dirpath) {
    let files = fs.readdirSync(dirpath);

    files.forEach(function (filename) {
        let fullpath = dirpath + '/' + filename;

        if (filename.indexOf('.') === -1) { //dir
            walkAppDir(fullpath);
        } else { //file
            if (filename !== 'app.js') {
                if (filename.indexOf('.js') !== -1) { //js file
                    //add to minify list
                    airrLibStack.push(fullpath);
                } else if (filename.indexOf('.html') !== -1) { //tpl file, copy with same path
                    let file_to_write = outAppPath + fullpath.replace(airrAppPath, airrAppDirName);
                    let data = fs.readFileSync(fullpath, {encoding: 'utf8'});
                    createFile(file_to_write, data);
                }
            }
        }
    });
}
function workImages() {
    let path = appPath + 'img/';
    let images = fs.readdirSync(path);
    let tag_tpl = '<img src="img/{filename}" />';
    let images_preloads_tags = "";

    if (!fs.existsSync(outAppPath + 'img/')) {
        createDir(outAppPath + 'img/');
    }
    images.forEach(function (name) {
        images_preloads_tags += tag_tpl.replace('{filename}', name);
        let inStr = fs.createReadStream(path + name);
        let outStr = fs.createWriteStream(outAppPath + 'img/' + name);
        inStr.pipe(outStr);
    });

    index_html_content = index_html_content.replace(/<!-- #AIRR-PRELOADS -->/, images_preloads_tags);
}
function workStyle() {
    let path = appPath + 'css/styles.css';
    if (!fs.existsSync(outAppPath + 'css/')) {
        createDir(outAppPath + 'css/');
    }
    let inStr = fs.createReadStream(path);
    let outStr = fs.createWriteStream(outAppPath + 'css/styles.css');
    inStr.pipe(outStr);
}
function workLang() {
    let path = appPath + 'lang/';
    let langs = fs.readdirSync(path);

    if (!fs.existsSync(outAppPath + 'lang/')) {
        createDir(outAppPath + 'lang/');
    }
    langs.forEach(function (name) {
        let inStr = fs.createReadStream(path + name);
        let outStr = fs.createWriteStream(outAppPath + 'lang/' + name);
        inStr.pipe(outStr);
    });
}
function workFont() {
    let path = appPath + 'fonts/';
    let fonts = fs.readdirSync(path);

    if (!fs.existsSync(outAppPath + 'fonts/')) {
        createDir(outAppPath + 'fonts/');
    }
    fonts.forEach(function (name) {
        let inStr = fs.createReadStream(path + name);
        let outStr = fs.createWriteStream(outAppPath + 'fonts/' + name);
        inStr.pipe(outStr);
    });
}
function workAirrScript() {
    index_html_content = index_html_content.replace(/<!-- #AIRR-SCRIPT -->(.|\s)+<!-- #AIRR-SCRIPT-END -->/, '<script type="text/javascript" src="airr.js"></script>');
}
function deleteReccur(path) {
    if (!fs.existsSync(path)) {
        return false;
    }

    let files = fs.readdirSync(path);


    files.forEach(function (filename) {
        let fullpath = path + '/' + filename;
        let stats = fs.statSync(fullpath);

        if (stats.isDirectory()) {
            deleteReccur(fullpath);
            fs.rmdirSync(fullpath);
        } else if (stats.isFile()) {
            fs.unlinkSync(fullpath);
        }
    });
}

index_html_content = fs.readFileSync(appPath + 'index.html', {encoding: 'utf8'});

if (!fs.existsSync('hooks/')) {
    fs.mkdirSync('hooks/', '0775');
}
if (!fs.existsSync('platforms/')) {
    fs.mkdirSync('platforms/', '0775');
}
if (!fs.existsSync('plugins')) {
    fs.mkdirSync('plugins/', '0775');
}
if (!fs.existsSync(outAppPath)) {
    fs.mkdirSync(outAppPath, '0775');
}

deleteReccur(outAppPath);
airrLibStack.push(airrConstsFilePath);
walkAppDir(airrAppPath);
airrLibStack.push(airrAppPath + '/app.js');
workImages();
workStyle();
workLang();
//workFont();
workAirrScript();

let minifyOpts = {
    compress: {
        keep_fnames: true
    },
    mangle: {
        keep_fnames: true
    }
};
let args = process.argv.slice(2);
let debug_code = false;
args.forEach(function (name) {
    switch (name) {
        case '-d':
        case '--debug':
            debug_code = true;
            break;
    }
});

let r;
if (!debug_code) {
    r = uJS.minify(airrLibStack, minifyOpts);
} else {
    r = {code: ''};
    airrLibStack.forEach(function (path) {
        if (r.code) {
            r.code += '\n';
        }
        r.code += fs.readFileSync(path);
    });
}
fs.writeFileSync(outAppPath + 'airr.js', r.code, {encoding: 'utf8', mode: '0775'});
fs.writeFileSync(outAppPath + 'main.html', fs.readFileSync(appPath + 'main.html', {encoding: 'utf8'}), {encoding: 'utf8', mode: '0775'});
fs.writeFileSync(outAppPath + 'index.html', index_html_content, {encoding: 'utf8', mode: '0775'});

