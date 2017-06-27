/* global Airr */

var cfg = {
    templateUrl: 'app/view-model/templates/red.html',
    style: {
        backgroundColor: '#c43711'
    },
    shared: {
    },
    when: {
        templateLoaded: function () {
            console.log('Red template loaded');
        }
    },
    methods: {
    }
};
Airr.declareViewConfig('Red', cfg);