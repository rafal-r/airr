var AbstractMVCObject = function () {
    throw new Error('AbstractMVCObject cannot be instantiated!');
};

AbstractMVCObject.prototype.init = function (config) {
    this.dom = document.createElement('div');
    this.id = null;
    this.name = '';
    this.defaultName = '';
    //
    this.autoload = false;
    this.templateLoaded = false;
    this.templateUrl = '';
    //
    this.injectOnTplLoaded = false; //if set to true append dom node after tpl is loaded //TODO check if this variable wouldn't simplefie Scene waiting for Views ready procedures
    this.isInjected = false; //changes when appended to other dom object, not rendered!
    this.isRendered = false; //changes when appended
    this.resourcesLoaded = false;
    //
    this.i18n = false; //should loadTemplate method translate text using I18N object
    //
    this.scene = null; //parent scene instance
    //
    this.whenReadyQueue = []; //functions array to call when ready, check whenReady method for descritpion of `ready` state
    this.whenRenderedQueue = []; //functions array to call when rendered, check whenRendered method for descritpion of `rendered` state
    this.whenTemplateLoadedQueue = []; //functions array to call when tpl loaded, check whenTemplateLoaded method for descritpion of `tpl loaded` state
    this.whenResourcesLoadedQueue = []; //functions array to call when resurces loaded, check whenResourcesLoaded method for descritpion of `resources loaded` state
    this.whenable = ['whenReady', 'whenRendered', 'whenTemplateLoaded', 'whenResourcesLoaded'];
    this.when = {};
    //
    this.domEventsMap = {};
    //
    this.customEvents = {};
    //
    this.shared = {};
    //
    this.controller = {};

    if (typeof config === 'object') {
        if (config.hasOwnProperty('name') && typeof config.name === 'string') {
            this.name = config.name;
        }
        else {
            throw new Error('Every instance of MVCObject requires its name property.');
        }

        if (config.hasOwnProperty('scene') && config.scene instanceof Scene) {
            this.scene = config.scene;
        }
        if (config.hasOwnProperty('id') && typeof config.id === 'string') {
            this.id = config.id;
            this.dom.id = config.id;
        }
        if (config.hasOwnProperty('autoload') && typeof config.autoload === 'boolean') {
            this.autoload = config.autoload;
        }
        if (config.hasOwnProperty('injectOnTplLoaded') && typeof config.injectOnTplLoaded === 'boolean') {
            this.injectOnTplLoaded = config.injectOnTplLoaded;
        }
        if (config.hasOwnProperty('style') && typeof config.style === 'object') {
            for (var prop in config.style) {
                this.dom.style[prop] = config.style[prop];
            }
        }
        if (config.hasOwnProperty('templateUrl') && typeof config.templateUrl === 'string') {
            this.templateUrl = config.templateUrl;
            if (this.autoload) {
                this.loadTemplate();
            }
        }
        if (config.hasOwnProperty('when') && typeof config.when === 'object') {
            for (var name in config.when) {
                var fname = 'when' + Airr.utils.capitalizeFirstLetter(name);
                if (config.when.hasOwnProperty(name)
                        && typeof config.when[name] === 'function'
                        && this.whenable.indexOf(fname) !== -1) {
                    this[fname](config.when[name]);
                }
            }
        }
        if (config.hasOwnProperty('methods') && typeof config.methods === 'object') {
            for (var name in config.methods) {
                if (config.methods.hasOwnProperty(name)
                        && typeof config.methods[name] === 'function') {
                    this[name] = config.methods[name];
                }
            }
        }
        if (config.hasOwnProperty('customEvents') && typeof config.customEvents === 'object') {
            for (var name in config.customEvents) {
                if (config.customEvents.hasOwnProperty(name)
                        && typeof config.customEvents[name] === 'function') {
                    this.onCustom(name, config.customEvents[name]);
                }
            }
        }
        if (config.hasOwnProperty('shared') && typeof config.shared === 'object') {
            this.shared = config.shared;
        }
        if (config.hasOwnProperty('controller') && typeof config.controller === 'object') {
            this.controller = config.controller;
        }
        if (config.hasOwnProperty('i18n') && typeof config.i18n === 'boolean') {
            this.i18n = config.i18n;
        }
        if (config.hasOwnProperty('mayerButtons') && config.mayerButtons instanceof Array) {
            this.mayerButtons = config.mayerButtons;
        }
    }

    return this;
};
AbstractMVCObject.prototype.loadTemplate = function (callback) {
    var self = this;

    if (this.templateUrl) {
        Airr.ajax({
            method: 'get',
            url: self.templateUrl,
            callback: function (responseText) {
                if (!self.templateLoaded) { //load template only once **remember that check in here is required in face of async
                    self.templateLoaded = true;
                    
                    if (self.i18n) {
                        self.dom.innerHTML = I18N.translate(responseText);
                    }
                    else {
                        self.dom.innerHTML = responseText;
                    }
                    
                    self.triggerWhenTemplateLoadedQueue(); //must be before whenReadyQueue because latter invokes scenes callback functions that waits for readiness
                    self.triggerWhenReadyQueue();

                    var resources = self.dom.querySelectorAll('img');
                    if (resources) {
                        var loaded = 0;
                        for (var i = 0; i < resources.length; i++) {
                            if (resources[i].complete) {
                                loaded++;
                                if (loaded === resources.length) {
                                    self.resourcesLoaded = true;
                                    self.triggerWhenResourcesLoadedQueue();
                                }
                            }
                            else {
                                resources[i].onload = function() {
                                    loaded++;
                                    if (loaded === resources.length) {
                                        self.resourcesLoaded = true;
                                        self.triggerWhenResourcesLoadedQueue();
                                    }
                                };
                            }
                        }
                    }
                    
                    if (typeof callback === 'function') {
                        callback();
                    }
                }
            }
        });
    }
};
AbstractMVCObject.prototype.whenResourcesLoaded = function (callback) { //called when template is loaded and all images completed loading
    if (this.resourcesLoaded) {
        callback.call(this);
    }
    else {
        this.whenResourcesLoadedQueue.push(callback);
    }
};
AbstractMVCObject.prototype.whenTemplateLoaded = function (callback) { //called when template is loaded and signed to self.dom.innerHtml
    if (this.templateLoaded) {
        callback.call(this);
    }
    else {
        this.whenTemplateLoadedQueue.push(callback);
    }
};
AbstractMVCObject.prototype.whenReady = function (callback) {//mainly used by parent scene object to determine if child is ready to be appended
    if (this.templateUrl) {
        if (this.templateLoaded || !this.autoload) {
            callback.call(this);
        }
        else {
            this.whenReadyQueue.push(callback);
        }
    }
    else {
        callback.call(this);
    }
};
AbstractMVCObject.prototype.whenRendered = function (callback) { //when rendered means that is added to document DOM tree
    if (this.isRendered) {
        callback.call(this);
    }
    else {
        this.whenRenderedQueue.push(callback);
    }
};
AbstractMVCObject.prototype.triggerWhenReadyQueue = function () {
    for (var i = 0; i < this.whenReadyQueue.length; i++) {
        if (typeof this.whenReadyQueue[i] === 'function') {
            this.whenReadyQueue[i].call(this);
        }
    }

    this.whenReadyQueue = [];
};
AbstractMVCObject.prototype.triggerWhenRenderedQueue = function () {
    for (var i = 0; i < this.whenRenderedQueue.length; i++) {
        if (typeof this.whenRenderedQueue[i] === 'function') {
            this.whenRenderedQueue[i].call(this);
        }
    }

    this.whenRenderedQueue = [];
};
AbstractMVCObject.prototype.triggerWhenTemplateLoadedQueue = function () {
    for (var i = 0; i < this.whenTemplateLoadedQueue.length; i++) {
        if (typeof this.whenTemplateLoadedQueue[i] === 'function') {
            this.whenTemplateLoadedQueue[i].call(this);
        }
    }

    this.whenTemplateLoadedQueue = [];
};
AbstractMVCObject.prototype.triggerWhenResourcesLoadedQueue = function () {
    for (var i = 0; i < this.whenResourcesLoadedQueue.length; i++) {
        if (typeof this.whenResourcesLoadedQueue[i] === 'function') {
            this.whenResourcesLoadedQueue[i].call(this);
        }
    }

    this.whenResourcesLoadedQueue = [];
};
AbstractMVCObject.prototype.removeClass = function (className) {
    this.dom.classList.remove(className);
    return this;
};
AbstractMVCObject.prototype.addClass = function (className) {
    this.dom.classList.add(className);
    return this;
};
AbstractMVCObject.prototype.getWidth = function () {
    return this.dom.clientWidth ? this.dom.clientWidth : parseFloat(this.dom.style.width);
};
AbstractMVCObject.prototype.getHeight = function () {
    return this.dom.clientHeight ? this.dom.clientHeight : parseFloat(this.dom.style.height);
};
AbstractMVCObject.prototype.appendTo = function (parent) {
    var self = this;

    function go() {
        if (parent instanceof Scene) {
            if (self instanceof View) {
                parent.container.appendChild(self.dom);
            }
            else {
                parent.dom.appendChild(self.dom);
            }

            parent.whenRendered(function () {
                self.isRendered = true;
                self.triggerWhenRenderedQueue();
            });
        }
        else if (parent instanceof HTMLElement) {
            parent.appendChild(self.dom);

            if (self.performRenderedCheckReccursion(parent)) {
                self.isRendered = true;
                self.triggerWhenRenderedQueue();
            }
            else {
                self.isRendered = false;
            }
        }

        this.isInjected = true;
    }

    if (this.injectOnTplLoaded) {
        this.whenTemplateLoaded(go);
    }
    else {
        go();
    }

    return this;
};
AbstractMVCObject.prototype.insertBefore = function (parent, beforeElement) {
    var self = this;

    function go() {
        if (parent instanceof Scene) {
            if (self instanceof View) {
                parent.container.insertBefore(self.dom, beforeElement);
            }
            else {
                parent.dom.insertBefore(self.dom, beforeElement);
            }

            parent.whenRendered(function () {
                self.isRendered = true;
                self.triggerWhenRenderedQueue();
            });
        }
        else if (parent instanceof HTMLElement) {
            parent.insertBefore(self.dom, beforeElement);

            if (self.performRenderedCheckReccursion(parent)) {
                self.isRendered = true;
                self.triggerWhenRenderedQueue();
            }
            else {
                self.isRendered = false;
            }
        }

        this.isInjected = true;
    }

    if (this.injectOnTplLoaded) {
        this.whenTemplateLoaded(go);
    }
    else {
        go();
    }

    return this;
};
AbstractMVCObject.prototype.performRenderedCheckReccursion = function (node) {
    if (node.parentNode) {
        if (node.parentNode.tagName && (node.parentNode.tagName === "BODY" || node.parentNode.tagName === "HTML")) {
            return true;
        }
        else {
            return AbstractMVCObject.prototype.performRenderedCheckReccursion.call(this, node.parentNode);
        }
    }
    else {
        return false;
    }
};
/**
 * Remove DOM event listener.
 * @param {string} eventName
 * @param {function} handler
 */
AbstractMVCObject.prototype.off = function (eventName, handler) {
    var name = eventName + '-' + handler.name;
    if (this.domEventsMap[name]) {
        this.dom.removeEventListener(eventName, this.domEventsMap[name]);
        this.domEventsMap[name] = null;
    }
    else {
//        throw new Error('This object doesn\'t posses such handler. Event: ' + eventName + '. Handler: ' + handler.name);
        console.error('This object doesn\'t posses such handler. Event: ' + eventName + '. Handler: ' + handler.name);
    }
};
/**
 * Attach DOM event listener.
 * @param {string} eventName
 * @param {function} handler
 * @param {bool|object} useCaptureOrOpt
 * @param {array} extraParams
 */
AbstractMVCObject.prototype.on = function (eventName, handler, useCaptureOrOpt, extraParams) {
    var self = this;
    var name = eventName + '-' + handler.name;
    var obj = {};

    if (typeof handler.name === 'undefined') {
        throw new Error('Can\'t register an anoymous function as handler!');
    }

    obj[name] = function (e) {
        var params = [e];
        if (Array.isArray(extraParams) && extraParams.length > 0) {
            params = params.concat(extraParams);
        }
        handler.apply(self, params);
    };
    this.domEventsMap[name] = obj[name];
    this.dom.addEventListener(eventName, obj[name], useCaptureOrOpt);
};
AbstractMVCObject.prototype.once = function (eventName, handler, useCaptureOrOpt, extraParams) {
    var self = this;
    var name = eventName + '-' + handler.name;
    var obj = {};

    if (typeof handler.name === 'undefined') {
        throw new Error('Can\'t register an anoymous function as handler!');
    }

    obj[name] = function (e) {
        var params = [e];
        if (Array.isArray(extraParams) && extraParams.length > 0) {
            params = params.concat(extraParams);
        }

        self.off(eventName, handler);
        handler.apply(self, params);
    };
    this.domEventsMap[name] = obj[name];
    this.dom.addEventListener(eventName, obj[name], useCaptureOrOpt);
};

AbstractMVCObject.prototype.reportAction = function (actionName, params) {
    if (this.scene) {
        return this.scene.controller[this.name][actionName].apply(this.scene, params);
    }
};
AbstractMVCObject.prototype.offCustom = function (customEventName, handler) {
    if (Array.isArray(this.customEvents[customEventName])) {
        for (var i = 0; i < this.customEvents[customEventName]; i++) {
            if (this.customEvents[customEventName][i] === handler) {
                this.customEvents[customEventName].splice(i, 1);
            }
        }
    }
};
AbstractMVCObject.prototype.onCustom = function (customEventName, handler) {
    if (!Array.isArray(this.customEvents[customEventName])) {
        this.customEvents[customEventName] = [];
    }
    if (typeof handler === 'function') {
        this.customEvents[customEventName].push(handler);
    }
};
AbstractMVCObject.prototype.triggerCustom = function (customEventName) {
    if (Array.isArray(this.customEvents[customEventName])) {
        for (var i = 0; i < this.customEvents[customEventName].length; i++) {
            this.customEvents[customEventName][i].call(this);
        }
    }
};

