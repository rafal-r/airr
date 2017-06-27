var MVCObject = function (config) {
    return this.init(config);
};
Airr.utils.inherit(MVCObject, AbstractMVCObject);

MVCObject.prototype.init = function (config) {
    this.constructorName = 'MVCObject';
    MVCObject.uber.init.call(this, config);

    if (this.constructorName === 'MVCObject') {
        this.triggerCustom('initialized');
    }

    return this;
};
