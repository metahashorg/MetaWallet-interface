/**
 * @param {{
 *     app: App,
 *     selector: string|HTMLElement,
 *     spinnerTop: number,
 *     topThreshold: number,
 *     topCallback: Function,
 *     topCallbackTimeout: number=,
 *     bottomThreshold: number,
 *     bottomCallback: Function=,
 *     showGradient: boolean,
 *     fixBounce: Object<string, HTMLElement>=
 * }} config
 * @constructor
 */
class PullToRefresh {
    constructor (config) {
        /**
         * @type {Object}
         * @private
         */
        this._config = config;
        /** @type {App} */
        this.app = config.app;
        /** @type {number} */
        this.topThreshold = config.topThreshold || UI_PULLTOREFRESH_TOP_THRESHOLD;
        /** @type {Function} */
        this.topCallback = config.topCallback || function () {};
        /** @type {number} */
        this.topCallbackTimeout = config.topCallbackTimeout || 0;
        /** @type {number} */
        this.bottomThreshold = config.bottomThreshold || UI_PULLTOREFRESH_BOTTOM_THRESHOLD;
        /** @type {Function} */
        this.bottomCallback = config.bottomCallback || function () {};
        /** @type {Object<string, HTMLElement>} */
        this.fixBounceElements = config.fixBounce;
        /** @type {HTMLElement} */
        this.element = typeof config.selector === "string" ? document.querySelector(config.selector) : config.selector;
        /**
         * @type {number}
         * @private
         */
        this._spinnerTop = config.spinnerTop || UI_PULLTOREFRESH_TOP;
        /** @type {number} */
        this.spinnerValue = 0;
        /** @type {boolean} */
        this.spinnerRotating = false;
        /** @type {HTMLElement|xD} */
        this.spinnerElement = this.initSpinnerElement();
        /**
         * @type {number}
         * @private
         */
        this._scrollOffset = 2;
        /** @type {boolean} */
        this.showGradient = config.showGradient || false;
        /** @type {?HTMLElement} */
        this.gradientElement = this.showGradient ? this.initGradientElement() : null;
        this.element.onscroll = function () {
            this.onScroll();
        }.bind(this);
        this.element.ontouchend = function () {
            this.onTouchEnd();
        }.bind(this);
    }
    /**
     * @return {HTMLElement|xD}
     */
    initSpinnerElement () {
        let spinnerElement = xD(document.createElement("div"));
        spinnerElement.className = "pulltorefresh pulltorefresh--0";
        spinnerElement.style.top = this._spinnerTop + "px";
        for (let i = 0; i < PullToRefresh.STEPS; i++) {
            let div = document.createElement("div");
            spinnerElement.appendChild(div);
        }
        spinnerElement.hide();
        this.element.parentNode.insertBefore(spinnerElement, this.element);
        return spinnerElement;
    }
    /**
     * @return {HTMLElement|xD}
     */
    initGradientElement () {
        if (this.element.parentNode.querySelector(".pulltorefresh-gradient")) {
            return xD(this.element.querySelector(".pulltorefresh-gradient"));
        } else {
            let gradientElement = xD(document.createElement("div"));
            gradientElement.className = "pulltorefresh-gradient";
            this.element.parentNode.insertBefore(gradientElement, this.element);
            return gradientElement;
        }
    }
    onScroll () {
        let scrollTop = this.element.scrollTop + this._scrollOffset;
        // console.log("scrollTop", scrollTop);
        this.spinnerElement.style.top = Math.max(this._spinnerTop, ~~(this._spinnerTop - scrollTop / 1.5)) + "px";
        if (this.showGradient && this.gradientElement) {
            this.gradientElement.style.opacity = String((scrollTop >= 10) ? Math.min((scrollTop - 10) / 10, 1) : 0);
        }
        if (scrollTop + this.bottomThreshold >= (this.element.scrollHeight - this.element.offsetHeight)) {
            this.bottomCallback();
            return;
        }
        if (scrollTop >= 0) {
            this.spinnerElement.hide();
            return;
        }
        if (this.spinnerRotating) {
            return;
        }
        this.spinnerElement.show();
        this.spinnerValue = Math.max(1, Math.min(PullToRefresh.STEPS, Math.abs(Math.floor(scrollTop / (this.topThreshold / PullToRefresh.STEPS)))));
        this.spinnerElement.className = "pulltorefresh pulltorefresh--" + this.spinnerValue;
        if (this.spinnerValue < PullToRefresh.STEPS) {
            this.__feedback = 0;
        }
        if (this.spinnerValue === PullToRefresh.STEPS && !this.__feedback) {
            this.__feedback = 1;
            this.app.feedbackNotification(FEEDBACK_LIGHT);
        }
        // console.log(el.scrollTop, scrollTop, this.spinnerValue);
    }
    onTouchEnd () {
        if (this.spinnerValue === PullToRefresh.STEPS) {
            // this.app.feedbackNotification(FEEDBACK_LIGHT);
            this.spinnerValue = 0;
            this.spinnerRotating = true;
            this.spinnerElement.classList.add("pulltorefresh-waiting");
            setTimeout(function () {
                this.topCallback();
            }.bind(this), this.topCallbackTimeout);
        }
    }
    /**
     * Show loading animation
     */
    showAnim () {
        this.spinnerElement.classList.add("pulltorefresh-waiting");
        this.spinnerRotating = true;
        this.spinnerElement.show();
    }
    /**
     * Hide loading animation
     */
    hideAnim () {
        this.spinnerElement.classList.remove("pulltorefresh-waiting");
        this.spinnerRotating = false;
        this.spinnerElement.hide();
    }
    remove () {
        this.spinnerElement.parentNode.removeChild(this.spinnerElement);
        if (this._blankElement) {
            this._blankElement.parentNode.removeChild(this._blankElement);
        }
        if (this.gradientElement) {
            this.gradientElement.parentNode.removeChild(this.gradientElement);
        }
        this.element.onscroll = function () {};
        this.element.ontouchend = function () {};
    }
    /**
     * We need to make content height larger than block height to enable scroll and bouncing
     */
    fixBounce () {
        if (this._blankElement) {
            this._blankElement.parentNode.removeChild(this._blankElement);
        }
        let availHeight = this.fixBounceElements.pageElement.getBoundingClientRect().height -
            this.fixBounceElements.outerElement.getBoundingClientRect().top -
            this.fixBounceElements.outerElement.getBoundingClientRect().height;
        // console.log("availHeight", availHeight);
        if (availHeight >= 0) {
            this._blankElement = document.createElement("div");
            this._blankElement.style.height = (availHeight + 1) + "px";
            this.fixBounceElements.innerElement.appendChild(this._blankElement);
        }
    }
    resetScroll () {
        this.element.scrollTo(0, 0);
    }
    clearBottomCallback () {
        this.bottomCallback = function () {};
    }
    clearTopCallback () {
        this.topCallback = function () {};
    }
}

PullToRefresh.STEPS = 10;