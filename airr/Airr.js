/* global I18N */

var Airr = (function () {
    var self = {
        //
        viewport: null,
        //
        eventsNames: {},
        //
        viewConfig: {},
        sidepanelConfig: {},
        sceneConfig: {},
        i18n: null, //I18N object - use internationalization ? default null - initialize if Airr::start config.lang attribute is passed
        supportsPassive: false // assume the feature isn't supported
    };


    // create options object with a getter to see if its passive property is accessed
    var opts = Object.defineProperty && Object.defineProperty({}, 'passive', {get: function () {
            self.supportsPassive = true;
        }});
    // create a throwaway element & event and (synchronously) test out our options
    document.addEventListener('test', function () {}, opts);

    function createViewport(config) {
        var cfg = config;
        cfg.active = true;

        if (config.hasOwnProperty('fromConfig') && Airr.sceneConfig.hasOwnProperty(config.fromConfig)) {
            cfg = Airr.utils.mergeObjects(Airr.sceneConfig[config.fromConfig], cfg);
        }
        self.viewport = new Scene(cfg);

        if (document.body.children.length > 0) {
            self.viewport.insertBefore(document.body, document.body.children[0]);
        } else {
            self.viewport.appendTo(document.body);
        }
    }

    function initEventsNames() {
        self.eventsNames.touchMove = 'touchmove';
        self.eventsNames.touchStart = 'touchstart';
        self.eventsNames.touchEnd = 'touchend';
    }

    //config
    //.url
    //.method
    //.body
    //.headers
    self.ajax = function (config) {
        var req = new XMLHttpRequest();
        req.open(config.method, config.url, true);


        req.onreadystatechange = function (aEvt) {
            if (req.readyState === 4) {
//                if (req.status === 200) {
                    config.callback(req.responseText);
//                }
            }
        };

        if (config.headers) {
            for (var name in config.headers) {
                if (config.headers.hasOwnProperty(name)) {
                    req.setRequestHeader(name, config.headers[name]);
                }
            }
        }

        req.send(config.body || null);
    };

    self.declareViewConfig = function (name, config) {
        config.name = name;
        self.viewConfig[name] = config;
    };

    self.declareSidepanelConfig = function (name, config) {
        config.name = name;
        self.sidepanelConfig[name] = config;
    };

    self.declareSceneConfig = function (name, config) {
        config.name = name;
        self.sceneConfig[name] = config;
    };

    self.initAppI18N = function (config, callback) {
        self.i18n = I18N;

        if (config.tplLang) {
            I18N.setTplLang(config.tplLang);
        }

        if (config.langList) {
            I18N.setLangList(config.langList);
        }

        if (config.lang) {
            I18N.setLang(config.lang);
            I18N.updateDictionary(callback);
        } else {
            if (typeof cordova !== 'undefined') {
                if (config.langList && navigator && navigator.globalization) {
                    navigator.globalization.getPreferredLanguage(function (data) {
                        if (config.langList.hasOwnProperty(data.value)) {
                            I18N.setLang(config.langList[data.value]);
                        }
                        else {
                            I18N.setLang(I18N.getTplLang());
                        }
                        
                        I18N.updateDictionary(callback);
                    });
                }
            } else { //desktop browser preview
                I18N.updateDictionary(callback);
            }
        }
    };

    self.start = function (config) {

        initEventsNames();

        function ignition() {
            createViewport(config.hasOwnProperty('viewportConfig') ? config.viewportConfig : null);
            config.launcher.call(self);
        }

        if (typeof cordova !== 'undefined') {
            document.addEventListener('deviceready', function () {

                if (config.i18n) {
                    self.initAppI18N(config.i18n, ignition);
                } else {
                    ignition();
                }

            }, false);
        } else {
            if (document.readyState === "complete"
                    || document.readyState === "loaded"
                    || document.readyState === "interactive") {
                // document has at least been parsed
                if (config.i18n) {
                    self.initAppI18N(config.i18n, ignition);
                } else {
                    ignition();
                }
            } else {
                document.addEventListener('DOMContentLoaded', function () {
                    if (config.i18n) {
                        self.initAppI18N(config.i18n, ignition);
                    } else {
                        ignition();
                    }
                }, false);
            }
        }
    };

    return self;
})();
