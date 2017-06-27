/* global Airr */

Airr.declareSidepanelConfig('Panel', {
    templateUrl: 'app/view-model/sidepanel/tpl.html',
    autoload: true,
    id: 'panel',
    side: 'left',
    shared: {
        mapView: null
    },
    customEvents: {
        showTouchStart: function () {
            console.log('showTouchStart');
        },
        showTouchEnd: function () {
            console.log('showTouchEnd');
        }
    },
    when: {
        templateLoaded: function () {
            this.initCheckboxBehaviour();
            this.attachMayersHandlers();
        }
    },
    methods: {
        attachMayersHandlers: function () {
            var self = this;

            this.dom.querySelector('#two-btn').addEventListener('click', function () {
                self.scene.enableMayer("Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.", [
                    {
                        text: 'YES',
                        class: 'alert',
                        close: true,
                        handler: function () {
                        }
                    },
                    {
                        text: 'CANCEL',
                        class: 'success',
                        close: true,
                        handler: function () {
                        }
                    }
                ]);
            });

            this.dom.querySelector('#full-btn').addEventListener('click', function () {
                var mayerMVCObj = new MVCObject(Airr.getCommonConfig('LongContentMayer'));

                mayerMVCObj.whenResourcesLoaded(function () {
                    self.scene.enableMayer(mayerMVCObj);
                });
            });
            
            this.dom.querySelector('#menu-btn').addEventListener('click', function () {
                self.scene.showMenuInformation();
            });
        },
        initCheckboxBehaviour: function () {
            var checkboxCtn = this.dom.querySelector('.checkboxCtn');
            var checkboxesImmits = checkboxCtn.querySelectorAll('img.immit');
            var self = this;

            function uncheckAll() {
                for (var i = 0; i < checkboxesImmits.length; i++) {
                    checkboxesImmits[i].src = 'img/unchecked.png';
                }
            }
            function check(immitRef) {
                self.scene.updateAnimation(immitRef.dataset.anim);
                immitRef.src = 'img/checked.png';
            }


            for (var i = 0; i < checkboxesImmits.length; i++) {
                checkboxesImmits[i].addEventListener('click', function () {
                    if (this.src.indexOf('un') !== -1) { //checked
                        uncheckAll(this);
                        check(this);
                    }
                });
            }
        }
    }
});