var Airr = (function () {
    var self = {
        //
        viewport: null,
        //
        eventsNames: {},
        //
        viewConfig: {},
        sidepanelConfig: {},
        sceneConfig: {}
    };


    function createViewport(config) {
        var cfg = config;
        cfg.active = true;
        
        if (config.hasOwnProperty('fromConfig') && Airr.sceneConfig.hasOwnProperty(config.fromConfig)) {
            cfg = Airr.utils.mergeObjects(Airr.sceneConfig[config.fromConfig], cfg);
        }
        self.viewport = new Scene(cfg);

        if (document.body.children.length > 0) {
            self.viewport.insertBefore(document.body, document.body.children[0]);
        }
        else {
            self.viewport.appendTo(document.body);
        }
    }
    
    function initEventsNames() {
        self.eventsNames.touchMove = 'touchmove';
        self.eventsNames.touchStart = 'touchstart';
        self.eventsNames.touchEnd = 'touchend';
    }

    self.ajax = function (config) {
        var req = new XMLHttpRequest();
        req.open(config.method, config.url, true);

        req.onreadystatechange = function (aEvt) {
            if (req.readyState == 4) {
                if (req.status == 200) {
                    config.callback(req.responseText);
                }
            }
        };

        req.send(null);
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


    self.start = function (config) {
        self = Airr;

        initEventsNames();

        if (typeof cordova !== 'undefined') {
            document.addEventListener('deviceready', function () {
                createViewport(config.hasOwnProperty('viewportConfig') ? config.viewportConfig : null);
                config.launcher.call(self);
            }, false);
        }
        else {
            document.addEventListener('DOMContentLoaded', function () {
                createViewport(config.hasOwnProperty('viewportConfig') ? config.viewportConfig : null);
                config.launcher.call(self);
            }, false);
        }
    };

    return self;
})();
