/* global Airr */

var cfg = {
    templateUrl: 'app/view-model/templates/green.html',
    style: {
        backgroundColor: '#6cd158'
    },
    shared: {
    },
    when: {
        templateLoaded: function () {
            console.log('Green template loaded');
        }
    },
    methods: {
    }
};
Airr.declareViewConfig('Green', cfg);