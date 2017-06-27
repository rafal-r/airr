/* global Airr */

var cfg = {
    templateUrl: 'app/view-model/templates/blue.html',
    style: {
        backgroundColor: '#1766a3'
    },
    shared: {
    },
    when: {
        templateLoaded: function () {
            console.log('Blue template loaded');
        }
    },
    methods: {
    }
};
Airr.declareViewConfig('Blue', cfg);