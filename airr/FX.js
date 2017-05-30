/* global Airr */
Airr.FX = {
    /**
     * 
     * @param {HTMLElement} animated
     * @param {HTMLElement} parent
     * @param {int} ts Timestamp
     * @param {string} headTo top,bottom,left,right
     * @param {function} finishCallback
     * @returns {void}
     */
    doOverlayAnimation: function (animated, parent, ts, headTo, finishCallback) {
        ts = ts || 300;
        headTo = headTo || 'top';

    animated.style.opacity = 0;
    animated.style.webkitBackfaceVisibility = 'hidden';    
    animated.style.backfaceVisibility = 'hidden';
    
        if (['top', 'bottom'].indexOf(headTo) !== -1) {
            if (headTo === 'top') {
                animated.style.webkitTransform = 'scale(0, 1) translate3d(0,' + parent.clientHeight + 'px,0)';
                animated.style.transform = 'scale(0, 1) translate3d(0,' + parent.clientHeight + 'px,0)';
            } else {
                animated.style.webkitTransform = 'scale(0, 1) translate3d(0,' + (-1 * parent.clientHeight) + 'px,0)';
                animated.style.transform = 'scale(0, 1) translate3d(0,' + (-1 * parent.clientHeight) + 'px,0)';
            }
        } else {
            if (headTo === 'left') {
                animated.style.webkitTransform = 'scale(1, 0) translate3d(' + parent.clientWidth + 'px,0,0)';
                animated.style.transform = 'scale(1, 0) translate3d(' + parent.clientWidth + 'px,0,0)';
            } else {
                animated.style.webkitTransform = 'scale(1, 0) translate3d(' + (-1 * parent.clientWidth) + 'px,0,0)';
                animated.style.transform = 'scale(1, 0) translate3d(' + (-1 * parent.clientWidth) + 'px,0,0)';
            }
        }

        animated.offsetHeight; // Trigger a reflow, flushing the CSS changes

        animated.style.webkitTransition = 'opacity ' + ts * 2 + 'ms ease-out, -webkit-transform ' + ts + 'ms ease-out';
        animated.style.webkitTransition = 'opacity ' + ts * 2 + 'ms ease-out, transform ' + ts + 'ms ease-out';
        animated.style.transition = 'opacity ' + ts * 2 + 'ms ease-out, -webkit-transform ' + ts + 'ms ease-out';
        animated.style.transition = 'opacity ' + ts * 2 + 'ms ease-out, transform ' + ts + 'ms ease-out';

        animated.style.zIndex = 102;
        animated.style.opacity = 1;
        animated.style.webkitTransform = 'scale(1, 1) translate3d(0,0,0)';
        animated.style.transform = 'scale(1, 1) translate3d(0,0,0)';

        setTimeout(function () {
            animated.style.webkitTransform = '';
            animated.style.transform = '';
            animated.style.webkitTransition = '';
            animated.style.transition = '';
            animated.style.zIndex = '';
            animated.style.opacity = '';

            if (typeof finishCallback === 'function') {
                finishCallback();
            }
        }, ts * 2);
    },
    /**
     * 
     * @param {HTMLElement} newElement
     * @param {HTMLElement} parent
     * @param {HTMLElement} container
     * @param {int} ts
     * @param {int} direction 1|-1
     * @param {function} finishCallback
     * @returns {void}
     */
    doSlideAnimation: function (newElement, parent, container, ts, direction, finishCallback) {
        ts = ts || 300;

        newElement.style.display = 'block';

        container.style.webkitBackfaceVisibility = 'hidden';
        container.style.backfaceVisibility = 'hidden';

        if (direction === -1) {
            container.style.webkitTransform = 'translate3d(' + (-1 * parent.clientWidth) + 'px,0,0)';
            container.style.transform = 'translate3d(' + (-1 * parent.clientWidth) + 'px,0,0)';

            container.offsetHeight; // Trigger a reflow, flushing the CSS changes

            container.style.webkitTransition = '-webkit-transform ' + ts + 'ms ease-out';
            container.style.transition = '-webkit-transform ' + ts + 'ms ease-out';
            container.style.transition = 'transform ' + ts + 'ms ease-out';

            container.style.webkitTransform = 'translate3d(0,0,0)';
            container.style.transform = 'translate3d(0,0,0)';
        } else {
            container.style.webkitTransition = '-webkit-transform ' + ts + 'ms ease-out';
            container.style.transition = '-webkit-transform ' + ts + 'ms ease-out';
            container.style.transition = 'transform ' + ts + 'ms ease-out';

            container.style.webkitTransform = 'translate3d(' + (-1 * parent.clientWidth) + 'px,0,0)';
            container.style.transform = 'translate3d(' + (-1 * parent.clientWidth) + 'px,0,0)';
        }

        setTimeout(function () {
//            newElement.classList.remove('animated');
//            container.classList.remove('animated');

            newElement.style.display = '';
            container.style.webkitTransform = 'translate3d(0,0,0)';
            container.style.transform = 'translate3d(0,0,0)';
            container.style.webkitTransition = '';
            container.style.transition = '';
            container.style.transition = '';
            container.style.webkitBackfaceVisibility = '';
            container.style.backfaceVisibility = '';

            if (typeof finishCallback === 'function') {
                finishCallback();
            }
        }, ts + 100);
    }
};

