Airr.declareSidepanelConfig('Panel', {
    templateUrl: 'js/app/views/sidepanel/tpl.html',
    autoload: true,
    id: 'panel',
    side: 'left',
    shared: {
        mapView: null
    },
    customEvents: {
        showTouchStart: function() {
            console.log('showTouchStart');
        },
        showTouchEnd: function() {
            console.log('showTouchEnd');
        }
    },
    when: {
        templateLoaded: function() {
            this.initCheckboxBehaviour();
        }
    },
    methods: {
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