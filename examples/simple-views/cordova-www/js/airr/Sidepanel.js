var Sidepanel = function (cfg) {
    return this.init(cfg);
};
Airr.utils.inherit(Sidepanel, AbstractMVCObject);

Sidepanel.prototype.init = function (config) {
    Sidepanel.uber.init.call(this, config);

    this.addClass('sidepanel');
    //DOM objects
    this.dragCtn = document.createElement('div');
    this.hiddenVal;
    this.shownVal;
    this.currentVal;
    this.side = '';
    this.size;
    this.transformScheme = '';
    this.axis = '';
    this.sceneSize;
    this.lastTouch;
    this.dom.appendChild(this.dragCtn);

    var self = this;

    if (this.scene) {
        this.appendTo(this.scene);

        if (typeof config === 'object') {
            if (config.hasOwnProperty('side') && typeof config.side === "string" && ['left', 'right', 'top', 'bottom'].indexOf(config.side) !== -1) {
                this.side = config.side;
            }
            else {
                this.side = 'right';
            }
        }

        this.scene.whenRendered(function () {
            self.updateSide(self.side);
        });
    }
    else {
        throw new Error('Sidepanel requires its scene instance in config object!');
    }


    this.enable();

    return this;
};
Sidepanel.prototype.loadTemplate = function (callback) {
    var self = this;
    Airr.ajax({
        method: 'get',
        url: self.templateUrl,
        callback: function (responseText) {
            self.templateLoaded = true;
            self.dragCtn.innerHTML = responseText;
            self.triggerWhenTemplateLoadedQueue();
            
            if (typeof callback === 'function') {
                callback();
            }
        }
    });
};
Sidepanel.prototype.updateSide = function (side) {
    this.side = side;

    if (this.side === 'left' || this.side === 'right') {
        this.size = this.scene.getWidth() * 2 / 3;
        this.sceneSize = this.scene.getWidth();
        this.hiddenVal = this.side === 'left' ? -1 * this.size : this.scene.getWidth();
        this.transformScheme = 'translate3d(%vpx,0,0)';
        this.axis = 'X';

        this.dragCtn.style.width = this.size + 'px';
        this.dragCtn.style.height = '100%';
    }
    else { //top,bottom
        this.size = this.scene.getHeight() * 1 / 4;
        this.sceneSize = this.scene.getHeight();
        this.hiddenVal = this.side === 'top' ? -1 * this.size : this.scene.getHeight();
        this.transformScheme = 'translate3d(0,%vpx,0)';
        this.axis = 'Y';

        this.dragCtn.style.height = this.size + 'px';
        this.dragCtn.style.width = '100%';
    }

    if (this.side === 'top' || this.side === 'left') {
        this.shownVal = 0;
    }
    else {
        this.shownVal = this.sceneSize - this.size;
    }

    this.dragCtn.style.webkitTransform = this.transformScheme.replace('%v', this.hiddenVal);
    this.dragCtn.style.transform = this.transformScheme.replace('%v', this.hiddenVal);
};
Sidepanel.prototype.touchStartHandler = function (e, me) {
    var pos = e.changedTouches[0]['client' + me.axis];

    if (e.target !== me.dragCtn && ((['left', 'top'].indexOf(me.side) !== -1 && pos < 10)
            || (['right', 'bottom'].indexOf(me.side) !== -1 && pos > (me.hiddenVal - 10)))) { //corner touch, show moves

        me.dom.style.display = 'block';
        me.scene.on(Airr.eventsNames.touchMove, me.showTouchMoveHandler, false, [me]);
        me.scene.on(Airr.eventsNames.touchEnd, me.touchEndHandler, false, [me]);
        
        me.triggerCustom('showTouchStart');
        
        me.scene.once(Airr.eventsNames.touchEnd, function showmoveend() {
            me.scene.off(Airr.eventsNames.touchMove, me.showTouchMoveHandler);
            me.triggerCustom('showTouchEnd');
        }, false, [me]);
    }
    else if (me.currentVal === me.shownVal) { //fully visible, hide moves
        me.scene.on(Airr.eventsNames.touchMove, me.hideTouchMoveHandler, false, [me]);
        me.scene.on(Airr.eventsNames.touchEnd, me.touchEndHandler, false, [me]);
        
        me.triggerCustom('hideTouchStart');
        
        me.scene.once(Airr.eventsNames.touchEnd, function hidemoveend() {
            me.scene.off(Airr.eventsNames.touchMove, me.hideTouchMoveHandler);
            me.triggerCustom('hideTouchEnd');
        }, false, [me]);
    }

    if (e.target === me.dom) { //tap to hide
        if ((['left', 'top'].indexOf(me.side) !== -1 && me.currentVal === 0)
                || ['right', 'bottom'].indexOf(me.side) !== -1 && me.currentVal) {
            me.scene.once(Airr.eventsNames.touchEnd, function hidedragctn(e, me) {
                if (pos === e.changedTouches[0]['client' + me.axis]) {
                    me.hide();
                }
            }, false, [me]);
        }
    }

    me.lastTouch = e.changedTouches[0];
};
Sidepanel.prototype.hideTouchMoveHandler = function (e, me) {
    var move, progress, newVal, change, moveAxis;
    
    if (me.lastTouch) {
        if (Math.abs(me.lastTouch.clientX - e.changedTouches[0].clientX) >= Math.abs(me.lastTouch.clientY - e.changedTouches[0].clientY)) {
            if (e.changedTouches[0].clientX - me.lastTouch.clientX <= 0) {
                move = 'left';
                moveAxis = 'X';
            }
            else {
                move = 'right';
                moveAxis = 'X';
            }
        }
        else {
            if (e.changedTouches[0].clientY - me.lastTouch.clientY <= 0) {
                move = 'top';
                moveAxis = 'Y';
            }
            else {
                move = 'bottom';
                moveAxis = 'Y';
            }
        }
    }
    
    if (moveAxis === me.axis 
            && (
                (['left', 'top'].indexOf(me.side) !== -1 && e.changedTouches[0]['client' + moveAxis] < me.size) 
                || (['right', 'bottom'].indexOf(me.side) !== -1 && e.changedTouches[0]['client' + moveAxis] > (me.hiddenVal - me.size))
            )) {
        change = e.changedTouches[0]['client' + me.axis] - me.lastTouch['client' + me.axis];
        newVal = me.currentVal + change;
        
        if (me.side === 'left' || me.side === 'top') {

            if (newVal < me.hiddenVal) {
                newVal = me.hiddenVal;
            }
            else if (newVal > me.shownVal) {
                newVal = me.shownVal;
            }
            
            progress = 1 - Math.abs(newVal / me.size);
        }
        else {
            
            if (newVal > me.hiddenVal) {
                newVal = me.hiddenVal;
            }
            else if (newVal < me.shownVal) {
                newVal = me.shownVal;
            }
            
            progress = (me.sceneSize - newVal) / me.size;
        }

        if (newVal !== me.currentVal) {
            me.currentVal = newVal;
            progress = parseFloat(progress);
            progress = progress > 1 ? 1 : progress < 0 ? 0 : progress;
            me.dom.style.backgroundColor = 'rgba(0,0,0,' + (0.7 * progress) + ')';
            me.dragCtn.style.webkitTransform = me.transformScheme.replace('%v', me.currentVal);
            me.dragCtn.style.transform = me.transformScheme.replace('%v', me.currentVal);
        }
    }

    me.lastTouch = e.changedTouches[0];
    e.preventDefault();
};
Sidepanel.prototype.showTouchMoveHandler = function (e, me) {
    var pos = e.changedTouches[0]['client' + me.axis];
    var newVal, progress;

    if (['left', 'top'].indexOf(me.side) !== -1) {
        if (pos <= (-1 * me.hiddenVal)) {
            newVal = me.hiddenVal + pos;
        }
        else {
            newVal = me.shownVal;
        }
        progress = pos / me.size;
    }
    else {
        if (me.hiddenVal - pos <= me.size) {
            newVal = pos;
        }
        else {
            newVal = me.shownVal;
        }
        progress = (me.sceneSize - pos) / me.size;
    }

    if (newVal !== me.currentVal) {
        me.currentVal = newVal;
        progress = parseFloat(progress);
        progress = progress > 1 ? 1 : progress < 0 ? 0 : progress;
        me.dom.style.backgroundColor = 'rgba(0,0,0,' + (0.7 * progress) + ')';
        me.dragCtn.style.webkitTransform = me.transformScheme.replace('%v', me.currentVal);
        me.dragCtn.style.transform = me.transformScheme.replace('%v', me.currentVal);
    }

    me.lastTouch = e.changedTouches[0];
    e.preventDefault();
};
Sidepanel.prototype.touchEndHandler = function (e, me) {
    var val = null;
    
    if (me.currentVal !== me.shownVal && me.currentVal !== me.hiddenVal) {
        if (['left', 'top'].indexOf(me.side) !== -1) {
            if (me.currentVal >= (me.hiddenVal / 2)) {
                val = me.shownVal;
            }
            else {
                val = me.hiddenVal;
            }

        }
        else {
            if (me.currentVal < me.hiddenVal - (me.size / 2)) {
                val = me.shownVal;
            }
            else {
                val = me.hiddenVal;
            }
        }
    }
    else if (me.currentVal === me.hiddenVal) {
        me.dom.style.display = 'none';
    }

    if (val !== null) {
        me.translateTo(val);
    }

    me.scene.off(Airr.eventsNames.touchEnd, me.touchEndHandler);
};
Sidepanel.prototype.hide = function () {
    return this.translateTo(this.hiddenVal);
};
Sidepanel.prototype.show = function () {
    return this.translateTo(0);
};
Sidepanel.prototype.enable = function () {
    this.scene.on(Airr.eventsNames.touchStart, this.touchStartHandler, false, [this]);
};
Sidepanel.prototype.disable = function () {
    this.scene.off(Airr.eventsNames.touchStart, this.touchStartHandler);
};
Sidepanel.prototype.translateTo = function (finishVal) {
    var self = this;

    this.dom.style.webkitTransition = 'background-color 0.2s ease-in';
    this.dom.style.transition = 'background-color 0.2s ease-in';

    this.dom.offsetHeight;
    if (finishVal === this.shownVal) {
        this.dom.style.backgroundColor = 'rgba(0,0,0,0.7)';
    }
    else if (finishVal === this.hiddenVal) {
        this.dom.style.backgroundColor = 'rgba(0,0,0,0.0)';
    }
    this.dom.offsetHeight;
    this.dom.style.webkitTransition = 'initial';
    this.dom.style.transition = 'initial';

    this.dragCtn.style.webkitTransition = '-webkit-transform 0.2s ease-out';
    this.dragCtn.style.webkitTransition = 'transform 0.2s ease-out';
    this.dragCtn.style.transition = 'transform 0.2s ease-out';

    this.dragCtn.offsetHeight;
    this.dragCtn.style.webkitTransform = this.transformScheme.replace('%v', finishVal);
    this.dragCtn.style.transform = this.transformScheme.replace('%v', finishVal);
    this.dragCtn.offsetHeight;

    this.dragCtn.style.webkitTransition = 'initial';
    this.dragCtn.style.transition = 'initial';

    setTimeout(function () {
        self.currentVal = finishVal;
        if (finishVal === self.hiddenVal) {
            self.dom.style.display = 'none';
        }
    }, 200);
};
    