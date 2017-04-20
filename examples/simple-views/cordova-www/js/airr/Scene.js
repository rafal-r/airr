/* global HTMLElement */

var Scene = function (config) {
    return this.init(config);
};
Airr.utils.inherit(Scene, View);

Scene.prototype.init = function (config) {
    this.viewsRefs = []; //prop might be needed in overwritten ::activate method so defined before ::init call
    Scene.uber.init.call(this, config);
    this.constructorName = 'Scene'; //must be here to overwrite Scene.uber.init
    

    this.container = document.createElement('div');
    this.container.classList.add('container');
    this.dom.appendChild(this.container);
    this.addClass('scene');
    //
    this.animation = '';
    //DOM objects
    this.blankmask = null;
    //
    //MVCObjects
    this.sidepanel = null;
    this._activeView = null;
    //
    this.readyViewsCount = 0;
    this.viewsQueueLength = 0;
    this.allViewsReady = true;

    if (typeof config === 'object') {
        if (config.hasOwnProperty('animation') && typeof config.animation === 'string') {
            this.updateAnimation(config.animation);
        }
        if (config.hasOwnProperty('sidepanel')) {
            this.initSidepanel(config.sidepanel);
        }
        if (config.hasOwnProperty('views') && Array.isArray(config.views)) {
            this.addViews(config.views);
        }
    }

    if (this.constructorName === 'Scene') {
        this.attachDefaultCustomEvents();
    }

    return this;
};

Scene.prototype.attachDefaultCustomEvents = function () {
    var self = this;
    
    this.onCustom('beforeShown', function () {
        if (self._activeView) {
            self._activeView.triggerCustom('beforeShown');
        }
    });

    this.onCustom('beforeHidden', function () {
        if (self._activeView) {
            self._activeView.triggerCustom('beforeHidden');
        }
    });
    
    this.onCustom('activated', function () {
        if (self._activeView) {
            self._activeView.triggerCustom('activated');
        }
    });
    
    this.onCustom('deactivated', function () {
        if (self._activeView) {
            self._activeView.triggerCustom('deactivated');
        }
    });
};
Scene.prototype.initSidepanel = function (config) {
    if (typeof config === 'string' && Airr.sidepanelConfig.hasOwnProperty(config)) {
        var cfg = Airr.sidepanelConfig[config];
        cfg.scene = this;
        
        if (!cfg.hasOwnProperty('i18n')) {
            cfg.i18n = Airr.i18n ? true : false;
        }
        
        this.sidepanel = new Sidepanel(cfg);
    } else if (typeof config === 'object') {
        config.scene = this;
        
        if (!config.hasOwnProperty('i18n')) {
            config.i18n = Airr.i18n ? true : false;
        }
        
        this.sidepanel = new Sidepanel(cfg);
    } else {
        throw new Error('Incorrect initSidepanel config argument!');
    }
};

Scene.prototype.updateAnimation = function (animation) {
    var self = this;

    if (animation !== this.animation) {
        if (this.animation) {
            this.container.classList.remove(this.animation + '-animation');
        }

        this.animation = animation;
        this.container.classList.add(this.animation + '-animation');

        if (this.animation === 'slide') {
            this.whenRendered(function () {
                self.container.style.width = self.dom.clientWidth ? self.dom.clientWidth * 2 + 'px' : parseFloat(self.dom.style.width) * 2 + 'px';
            });
        }
    }
};

Scene.prototype.createBlankMask = function () {
    this.blankmask = document.createElement('div');
    this.blankmask.className = 'blank-mask';
};

Scene.prototype.appendAllViews = function () {
    for (var i = 0; i < this.viewsRefs.length; i++) {
        this.viewsRefs[i].appendTo(this);
    }
};
Scene.prototype.initView = function (config) {
    var view = {};
    var self = this;

    if (typeof config === 'object') {
        var type = config.scene ? 'scene' : 'view';
        var cfg = config;
        cfg.scene = this;
        
        if (!cfg.hasOwnProperty('i18n')) {
            cfg.i18n = Airr.i18n ? true : false;
        }
        
        if (config.hasOwnProperty('fromConfig') && typeof config.fromConfig === 'string') {
            var fromConfig = Airr.utils.cloneObject(Airr[type + 'Config'][config.fromConfig]);
            cfg = Airr.utils.mergeObjects(fromConfig, cfg);
        }

        view = type === 'view' ? new View(cfg) : new Scene(cfg);
    } else {
        throw new Error('Config parameter must be an object!');
    }

    this.whenRendered(function () {
        var width, height;

        if (self.dom.clientWidth && self.dom.clientHeight) {
            width = self.dom.clientWidth + 'px';
            height = self.dom.clientHeight + 'px';
        } else {
            width = self.dom.style.width;
            height = self.dom.style.height;
        }

        view.dom.style.width = width;
        view.dom.style.height = height;
    });

    return view;
};

Scene.prototype.addViews = function (viewsArray, callback) {
    var self = this;
    self.readyViewsCount = 0;
    self.viewsQueueLength = viewsArray.length;
    self.allViewsReady = false;

    if (!(viewsArray instanceof Array)) {
        throw new Error('addViews method first argument must be an array');
    }

    if (this.isActive()) { //active view check
        var anyActive = false;
        for (var i = 0; i < viewsArray.length; i++) {
            if (viewsArray[i].active) {
                anyActive = true;
            }
        }
        if (!anyActive && viewsArray.length) {
            viewsArray[0].active = true; //in config object we have active prop. But in View object we have _active prop;
        }
    }

    for (var i = 0; i < viewsArray.length; i++) {
        var view = this.initView(viewsArray[i]);
        this.viewsRefs.push(view);

        view.whenReady(function () {
            self.readyViewsCount++;

            if (self.readyViewsCount === self.viewsQueueLength) {
                self.allViewsReady = true;
                self.appendAllViews();
                self.triggerWhenReadyQueue();

                if (typeof callback === 'function') {
                    callback();
                }
            }
        });
    }

    return this;
};
//depracated - to deletion
Scene.prototype.checkActiveViewTemplateLoaded = function (viewsRefs, callback) {
    for (var i = 0; i < viewsRefs.length; i++) {
        if (viewsRefs[i]._active) {
            if (viewsRefs[i] instanceof Scene) {
                return this.checkActiveViewTemplateLoaded(viewsRefs[i].viewsRefs, callback);
            } else {
                if (viewsRefs[i].templateUrl && !viewsRefs[i].templateLoaded) {
                    return viewsRefs[i].loadTemplate(callback);
                } else if (typeof callback === 'function') {
                    return callback();
                }
            }
        }
    }
};
Scene.prototype.whenReady = function (callback) {
    if (this.allViewsReady === true) {
        callback();
    } else {
        this.whenReadyQueue.push(callback);
    }
};
Scene.prototype.changeActiveView = function (which, onEndCallback, disableViewportGUI) { //which - index number or name string
    var self = this;

    if (disableViewportGUI) {
        Airr.viewport.disableGUI();
    } else {
        this.disableGUI();
    }

    var newActiveView;

    if (typeof which === 'number') {
        if (which > this.viewsRefs.length - 1 || which < 0) {
            throw new Error('Given index is out of viewRefs array length');
        }
        newActiveView = this.viewsRefs[which];
    } else if (typeof which === 'string') {

        for (var i = 0; i < this.viewsRefs.length; i++) {
            if (this.viewsRefs[i].name === which) {
                newActiveView = this.viewsRefs[i];
            }
        }

        if (!newActiveView) {
            throw new Error('Couldn\'t find view with `name`: ' + which);
        }
    }


    if (this._activeView === newActiveView) {
        if (disableViewportGUI) {
            Airr.viewport.enableGUI();
        } else {
            this.enableGUI();
        }
        return;
    }

    this._activeView.triggerCustom('beforeHidden');
    newActiveView.triggerCustom('beforeShown');

    function continueChange() {
        if (self.animation) {
            return self['do' + Airr.utils.capitalizeFirstLetter(self.animation) + 'Animation'](newActiveView, function () {
                if (disableViewportGUI) {
                    Airr.viewport.enableGUI();
                } else {
                    self.enableGUI();
                }

                if (typeof onEndCallback === 'function') {
                    onEndCallback();
                }
            });
        } else {
            newActiveView.activate();

            if (disableViewportGUI) {
                Airr.viewport.enableGUI();
            } else {
                self.enableGUI();
            }
        }
    }

    if (newActiveView instanceof Scene) {
        if (!newActiveView._activeView && newActiveView.viewsRefs.length > 0) {
            newActiveView.viewsRefs[0].activate(continueChange);
        } else {
            continueChange();
        }
    } else if (newActiveView instanceof View) {
        if (newActiveView.templateUrl && !newActiveView.templateLoaded) {
            newActiveView.loadTemplate(continueChange);
        } else {
            continueChange();
        }
    }
};

Scene.prototype.doSlideAnimation = function (newView, onEndCallback) {
    var self = this;
    var direction = this.viewsRefs.indexOf(newView) > this.viewsRefs.indexOf(this._activeView) ? 1 : -1;

    newView.addClass('animated');

    if (direction === -1) {
        this.container.style.webkitTransform = 'translate3d(' + (-1 * this.dom.clientWidth) + 'px,0,0)';
        this.container.style.transform = 'translate3d(' + (-1 * this.dom.clientWidth) + 'px,0,0)';

        this.container.offsetHeight; // Trigger a reflow, flushing the CSS changes

        this.container.classList.add('animated');
        this.container.style.webkitTransform = 'translate3d(0,0,0)';
        this.container.style.transform = 'translate3d(0,0,0)';
    } else {
        this.container.classList.add('animated');
        this.container.style.webkitTransform = 'translate3d(' + (-1 * this.dom.clientWidth) + 'px,0,0)';
        this.container.style.transform = 'translate3d(' + (-1 * this.dom.clientWidth) + 'px,0,0)';
    }

    setTimeout(function () {
        newView.removeClass('animated');
        newView.activate();
        self.container.classList.remove('animated');
        self.container.style.webkitTransform = 'translate3d(0,0,0)';
        self.container.style.transform = 'translate3d(0,0,0)';

        if (typeof onEndCallback === 'function') {
            onEndCallback();
        }
    }, 300);
};
Scene.prototype.doOverlayAnimation = function (newView, onEndCallback) {
    newView.dom.style.webkitTransform = 'scale(0, 1) translate3d(0,' + this.dom.clientHeight + 'px,0)';
    newView.dom.style.transform = 'scale(0, 1) translate3d(0,' + this.dom.clientHeight + 'px,0)';

    newView.dom.offsetHeight; // Trigger a reflow, flushing the CSS changes

    newView.addClass('animated');

    newView.dom.style.webkitTransform = 'scale(1, 1) translate3d(0,0,0)';
    newView.dom.style.transform = 'scale(1, 1) translate3d(0,0,0)';

    setTimeout(function () {
        newView.activate();
        newView.dom.style.webkitTransform = 'initial';
        newView.dom.style.transform = 'initial';
        newView.removeClass('animated');

        if (typeof onEndCallback === 'function') {
            onEndCallback();
        }
    }, 1000);
};
Scene.prototype.hasMayer = function (id) {
    if (typeof id === 'string') {
        var mayer = this.dom.querySelector('#'+ id + '.mayer');
    }
    else {
        var mayer = this.dom.querySelector('.mayer');
    }
    
    if (mayer && mayer.parentNode === this.dom) {
        return true;
    }
    return false;
};
Scene.prototype.enableMayer = function (htmlContent, buttons, attrs) {
    var mask = document.createElement('div');
    var content = document.createElement('div');
    var text = document.createElement('div');
    var self = this;

    mask.classList.add('mayer');
    content.classList.add('ctn');
    text.classList.add('text');

    mask.style.visibility = 'hidden';
    
    if (htmlContent instanceof HTMLElement) {
        text.appendChild(htmlContent);
    }
    else {
        text.innerHTML = htmlContent;
    }

    content.appendChild(text);
    mask.appendChild(content);

    if (this.sidepanel && this.sidepanel.isEnabled()) {
        this.sidepanel.disable();
    }
    
    if (typeof attrs === 'object') {
        for (var name in attrs) {
            if (attrs.hasOwnProperty(name)) {
                mask[name] = attrs[name];
            }
        }
    }
    
    if (buttons && buttons.length) {
        var btns = document.createElement('div');
        btns.classList.add('btns');
        for (var i = 0; i < buttons.length; i++) {
            var btn = document.createElement('button');
            btn.classList.add('btn');
            btn.classList.add('text');

            if (buttons[i].text) {
                btn.innerText = buttons[i].text;
            }
            if (buttons[i].style) {
                btn.style.cssText = buttons[i].style;
            }
            if (buttons[i].class) {
                btn.classList.add(buttons[i].class);
            }
            if (buttons[i].handler) {
                btn.addEventListener('click', buttons[i].handler);
            }
            if (buttons[i].attrs) {
                for (var name in buttons[i].attrs) {
                    if (buttons[i].attrs.hasOwnProperty(name)) {
                        btn.setAttribute(name, buttons[i].attrs[name]);
                    }
                }
            }
            if (buttons[i].close) {
                btn.addEventListener('click', function () {
                    mask.parentNode.removeChild(mask);
                    self.onMayerCloseCheckSidepanel();
                });
            }

            btns.appendChild(btn);
        }
        content.appendChild(btns);
    }

    this.dom.appendChild(mask);

    var domHeight = this.getHeight();
    if (content.clientHeight >= domHeight) {
        content.style.position = 'static';
        content.style.height = domHeight + 'px';
        content.style.overflow = 'scroll';
    }

    mask.style.visibility = 'visible';
};
Scene.prototype.disableMayer = function (idOrElement) {
    if (idOrElement instanceof HTMLElement) {
            idOrElement.parentNode.removeChild(idOrElement);
        
    }
    else if (typeof idOrElement === 'string') {
        var mayer = this.dom.querySelector('#'+idOrElement + '.mayer');
        if (mayer) {
            mayer.parentNode.removeChild(mayer);
        }
    }
    
    this.onMayerCloseCheckSidepanel();
};
Scene.prototype.disableMayers = function () {
    var mayers = this.dom.querySelectorAll('.mayer');

    if (mayers && mayers.length) {
        for (var i = 0; i < mayers.length; mayers++) {
            mayers[i].parentNode.removeChild(mayers[i]);
        }
    }
    
    this.onMayerCloseCheckSidepanel();
};
Scene.prototype.onMayerCloseCheckSidepanel = function () {
    if (!this.hasMayer() && this.sidepanel && !this.sidepanel.isEnabled()) {
        this.sidepanel.enable();
    }
};
Scene.prototype.enableGUI = function () {
    if (this.dom.querySelector('.blank-mask')) {
        this.dom.removeChild(this.blankmask);
    }
};
Scene.prototype.disableGUI = function () {
    if (!this.blankmask) {
        this.createBlankMask();
    }

    if (this.blankmask.parentNode !== this.dom) {
        this.dom.appendChild(this.blankmask);
    }
};
Scene.prototype.activate = function (callback) {
    var self = this;

    this._active = true;
    if (this.scene) {
        if (this.scene._activeView) {
            this.scene._activeView.deactivate();
        }
        this.scene._activeView = this;
    }

    function finishActivation() {
        self.addClass('active');
        self.triggerCustom('activated');

        if (typeof callback === 'function') {
            callback();
        }
    }

    if (!this._activeView && this.viewsRefs.length > 0) {
        this.viewsRefs[0].activate(finishActivation);
    } else {
        finishActivation();
    }


    return this;
};
Scene.prototype.injectView = function (item, callback, disableViewportGUI) {
    var self = this;
    var view = this.initView(item);

    //dont wait for whenReady and changeActiveView disable gui - do it now
    if (disableViewportGUI) {
        Airr.viewport.disableGUI();
    } else {
        this.disableGUI();
    }

    view.whenReady(function () {
        view.appendTo(self.container);
        self.viewsRefs.push(view);
        self.changeActiveView(self.viewsRefs.length - 1, callback);
    });
};
Scene.prototype.getViewIndex = function (name) {
    for (var i = 0; i < this.viewsRefs.length; i++) {
        if (this.viewsRefs[i].name === name) {
            return i;
        }
    }
};
Scene.prototype.hasView = function (name) {
    for (var i = 0; i < this.viewsRefs.length; i++) {
        if (this.viewsRefs[i].name === name) {
            return true;
        }
    }

    return false;
};
Scene.prototype.findNestedView = function (name) {
    function find(viewsArray) {
        for (var i = 0; i < viewsArray.length; i++) {
            if (viewsArray[i].name === name) {
                return viewsArray[i];
            } else if (viewsArray[i] instanceof Scene) {
                return find(viewsArray[i].viewsRefs);
            }

            if (i === viewsArray.length - 1) {
                return false;
            }
        }
    }

    return find(this.viewsRefs);
};
Scene.prototype.getActiveViewName = function () {
    return this._activeView.name;
};
Scene.prototype.getActiveView = function () {
    return this._activeView;
};