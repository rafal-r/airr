Airr.declareSceneConfig('Viewport', {
    animation: 'overlay',
    sidepanel: 'Panel',
    views: [
        {fromConfig: 'Green'},
        {fromConfig: 'Blue'},
        {fromConfig: 'Red'}
    ],
    controller: {
        'Nav': {
            'Green': function() {
                this.changeActiveView('Green');
            },
            'Blue': function() {
                this.changeActiveView('Blue');
            },
            'Red': function() {
                this.changeActiveView('Red');
            }
        }
    },
    when: {
        rendered: function () {
            this.removeSplash();
        }
    },
    methods: {
        removeSplash: function () {
            var splash = document.getElementById('splash');
            splash.style.opacity = 0;
            setTimeout(function () {
                splash.parentNode.removeChild(splash);
            }, 1000);
        }
    },
    customEvents: {
        initialized: function () {
            var nav = new MVCObject({
                id: 'nav',
                name: 'Nav',
                templateUrl: 'js/app/views/templates/nav.html',
                autoload: true,
                scene: this,
                injectOnTplLoaded: true,
                style: {
                    zIndex: 104
                },
                shared: {
                    btn: [],
                    centerX: null,
                    translateX: null
                },
                when: {
                    templateLoaded: function () {
                        this.attachHandlers();
                    },
                    rendered: function () {
                        this.initShared();
                        this.updateTranslateValue();
                    }
                },
                methods: {
                    updateTranslateValue: function () {
                        this.dom.style.webkitTransform = 'translate3d(' + this.getTranslateValue() + 'px,0,0)';
                        this.dom.style.transform = 'translate3d(' + this.getTranslateValue() + 'px,0,0)';
                    },
                    initShared: function () {
                        this.shared.centerX = this.scene.getWidth() / 2;
                    },
                    getTranslateValue: function () {
                        var active = this.dom.querySelector('.active');
                        return this.shared.centerX - (active.offsetLeft + active.clientWidth / 2);
                    },
                    activateBtn: function (btn) {
                        btn.classList.add('active');

                        for (var i = 0; i < this.shared.btns.length; i++) {
                            if (this.shared.btns[i] !== btn) {
                                this.shared.btns[i].classList.remove('active');
                            }
                        }
                    },
                    attachHandlers: function () {
                        var self = this;

                        this.shared.btns = this.dom.querySelectorAll('div');
                        for (var i = 0; i < this.shared.btns.length; i++) {
                            this.shared.btns[i].addEventListener('click', function (e) {
                                if (!this.classList.contains('active')) {
                                    self.activateBtn(this);
                                    self.updateTranslateValue();
                                    self.reportAction(this.dataset.action);
                                }
                            });
                        }
                    }
                }
            });

            nav.appendTo(this);
        }
    },
});