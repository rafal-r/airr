/* global device, Airr */

Airr.start({
    viewportConfig: {
        fromConfig: 'Viewport'
    },
    launcher: function () {
        if (window.cordova && window.device && device.platform === 'iOS') {
            document.body.setAttribute('ontouchstart', "");
        }
    }
});