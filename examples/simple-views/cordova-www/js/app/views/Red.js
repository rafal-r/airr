Airr.declareViewConfig('Red', {
    templateUrl: 'js/app/views/templates/red.html',
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
});