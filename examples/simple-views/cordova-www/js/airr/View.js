var View = function (cfg) {
    return this.init(cfg);
};
Airr.utils.inherit(View, AbstractMVCObject);

View.prototype.init = function (config) {
    this.constructorName = 'View';
    View.uber.init.call(this, config);
    this._active = false;
    this.addClass('view');
    
    if (typeof config === 'object') {
        if (config.hasOwnProperty('active') && typeof config.active === 'boolean') {
            if (config.active) {
                this.activate();
            }
        }
    }
    else {
        throw new Error('View constructor is missing config object!');
    }

    if (this.constructorName === 'View') {
        this.triggerCustom('initialized');
    }

    return this;
};
View.prototype.deactivate = function () {
    this._active = false;
    this.removeClass('active');
    this.triggerCustom('deactivated');
    return this;
};
View.prototype.isActive = function () {
    return this._active;
};
View.prototype.activate = function (callback) {
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
    
    if (this.templateUrl && !this.templateLoaded) { 
        //this.autoload have already trigger loading just before this statement
        //to ensure no double load tries we cancel loading in here
        if (this.autoload) {
            this.whenTemplateLoaded(finishActivation);
        }
        else {
            this.loadTemplate(finishActivation);
        }
    }
    else {
        finishActivation();
    }

    return this;
};
View.prototype.whenReady = function (callback) { //mainly used by parent scene object to determine if child is ready to be appended
    if (this.templateUrl) {
        if (this.templateLoaded || (!this._active && !this.autoload)) {
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
//removes own dom object from parent scene
//removes parent scene reference
View.prototype.kill = function () {
    console.log('killing ' + this.name);
    
    if (this.scene) {
        this.scene.viewsRefs.splice(this.scene.getViewIndex(this.name), 1);
    }
    this.dom.parentNode.removeChild(this.dom);
};