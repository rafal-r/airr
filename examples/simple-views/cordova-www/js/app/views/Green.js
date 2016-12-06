Airr.declareViewConfig('Green', {
    templateUrl: 'js/app/views/templates/green.html',
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
});