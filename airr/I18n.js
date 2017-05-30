/* global LANG, Airr */

var I18N = (function () {
    var lang = null;
    var tplLang = null;
    var langList = {};

    this.getLang = function () {
        return lang;
    };
    this.setLang = function (newlang) {
        lang = newlang;
    };
    this.getLangList = function () {
        return langList;
    };
    this.setLangList = function (list) {
        langList = list;
    };
    this.getTplLang = function () {
        return tplLang;
    };
    this.setTplLang = function (newlang) {
        tplLang = newlang;
    };
    this.changeLang = function (newlang, callback) {
        lang = newlang;
        updateDictionary(callback);
    };

    this.updateDictionary = function (callback) {
        var dictionary_script = document.getElementById('airr-lang-dictionary');

        //console.log('updating Dictionary');

        if (dictionary_script) {
            dictionary_script.parentNode.removeChild(dictionary_script);
            LANG = null;
        }

        dictionary_script = document.createElement('script');
        dictionary_script.id = 'airr-lang-dictionary';
        dictionary_script.type = 'text/javascript';
        dictionary_script.onload = function () {
            //console.log('Dictionary script loaded');
            translateDocument();

            if (typeof callback === 'function') {
                callback();
            }
        };
        dictionary_script.src = 'lang/' + (lang ? lang : tplLang) + '.js';
        document.body.appendChild(dictionary_script);
    };

    function translateDocument() {
        var elements = document.querySelectorAll('[data-lang-prop]');

        for (var i = 0; i < elements.length; i++) {
            if (LANG.hasOwnProperty(elements[i].getAttribute('data-lang-prop'))) {
                if (elements[i].hasAttribute('placeholder')) {
                    elements[i].setAttribute('placeholder', LANG[elements[i].getAttribute('data-lang-prop')]);
                }
                else {
                    elements[i].childNodes[0].textContent = LANG[elements[i].getAttribute('data-lang-prop')];
                }
            }
        }
    }
    ;

    this.translate = function (text) {
        var tmp = document.createElement('div');
        tmp.innerHTML = text;
        var elements = tmp.querySelectorAll('[data-lang-prop]');

        for (var i = 0; i < elements.length; i++) {
            if (LANG.hasOwnProperty(elements[i].getAttribute('data-lang-prop'))) {
                if (elements[i].hasAttribute('placeholder')) {
                    elements[i].setAttribute('placeholder', LANG[elements[i].getAttribute('data-lang-prop')]);
                }
                else {
                    elements[i].childNodes[0].textContent = LANG[elements[i].getAttribute('data-lang-prop')];
                }
            }
        }

        return tmp.innerHTML;
    };

    return this;
}());