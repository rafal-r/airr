Airr.declareViewConfig('Blue', {
    templateUrl: 'js/app/views/templates/blue.html',
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
});