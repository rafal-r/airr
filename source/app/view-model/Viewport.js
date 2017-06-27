/* global Airr */

var cfg = {
    animation: 'overlay',
    sidepanel: 'Panel',
    views: [
        {fromConfig: 'Green'},
        {fromConfig: 'Blue'},
        {fromConfig: 'Red'}
    ],
    controller: {
        'SlideSceneNav': {
            'Green': function () {
                this.changeActiveView('Green');
            },
            'Blue': function () {
                this.changeActiveView('Blue');
            },
            'Red': function () {
                this.changeActiveView('Red');
            }
        }
    },
    when: {
        rendered: function () {
            this.removeSplash();
            if (!window.localStorage.getItem('menuInfo')) {
                this.showMenuInformation();
            }
        }
    },
    methods: {
        showMenuInformation: function () {
            window.localStorage.setItem('menuInfo', true);

            var html = '<div>Swipe from left corner to show app menu</div><img class="swipe-to-right" src="img/swipe-right.svg" style="width: 80px;"/>';

            Airr.viewport.enableMayer(html, [{
                    text: 'Let me try',
                    close: true,
                    handler: function () {
                    }
                }]);
        },
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
            var self = this;
            document.addEventListener("backbutton", function () {
                if (self.sidepanel.isShown()) {
                    self.sidepanel.hide();
                } else {
                    if (self.shared.mainMenuUsed) {
                        self.sidepanel.show();
                    }
                }
            }, false);


            var cfg = Airr.getCommonConfig('SlideSceneNav');
            cfg.scene = this;
            var nav = new MVCObject(cfg);
            nav.appendTo(this);
        }
    }
};
Airr.declareSceneConfig('Viewport', cfg);