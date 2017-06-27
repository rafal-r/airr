/* global io, WAY, Airr, USER, device, LANG, google, I18N, MARKER_PATHS */

var cfg = {
    templateUrl: 'app/view-model/mayer/content.html',
    autoload: true,
    style: {
    },
    shared: {
       
    },
    mayerButtons: [
        {
            text: 'OK',
            close: true,
            handler: function (e) {

            },
            class: 'success'
        },
        {
            text: 'CANCEL',
            close: true
        }
    ],
    customEvents: {
    },
    when: {
    },
    methods: {
    }
};

Airr.declareCommonConfig('LongContentMayer', cfg);