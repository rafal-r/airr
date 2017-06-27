/* global device */

/* global device, NodeList */

if (NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = function (callback) {
        for (var i = 0; i < this.length; i++) {
            callback(this.item(i));
        }
    };
}

document.addEventListener('deviceready', function () {
    if (window.cordova && window.device && device.platform === 'Android' && device.version.indexOf('4') === 0) {
        var css = '.mayer.full .btns { \
                position: static !important; \
                padding: 1rem 0 0 0 !important; \
                background: transparent !important;    \
            } \
            .mayer.full .ctn > div.text { \
                padding-bottom: 1rem !important; \
            }',
                head = document.head || document.getElementsByTagName('head')[0],
                style = document.createElement('style');

        style.type = 'text/css';
        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }

        head.appendChild(style);
    }
});