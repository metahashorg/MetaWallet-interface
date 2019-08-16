/**
 * @param {AppConfig} config
 * @constructor
 */
function App (config) {
    console.log("+App", config);

    /**
     * @private
     */
    this._config = config;

    /** @type {Array<Task>} */
    this.tasks = [];

    /** @type {Array<View>} */
    this.views = [];

    /** @type {?View} */
    this.activeView = null;

    /** @type {?View} */
    this.modalView = null;

    /**
     * @type {HTMLElement|xD}
     * @private
     */
    this._pagesWrapper = xD(document.querySelector(".pages"));

    /**
     * @type {HTMLElement|xD}
     * @private
     */
    this._settingsWrapper = xD(document.querySelector(".settings"));

    /**
     * @type {HTMLElement|xD}
     * @private
     */
    this._alertsWrapper = xD(document.querySelector(".alerts"));

    /**
     * @type {HTMLElement|xD}
     * @private
     */
    this._alerts2Wrapper = xD(document.querySelector(".bottom-menus"));

    /**
     * @type {HTMLElement|xD}
     * @private
     */
    this._notificationsWrapper = xD(document.querySelector(".notifications"));

    /**
     * @type {HTMLElement|xD}
     * @private
     */
    this._notificationTemplate = xD(document.querySelector(".notifications .notification"));

    /**
     * @type {boolean}
     * @private
     */
    this._firstView = true;

    /**
     * @type {HTMLElement|xD}
     * @private
     */
    this._blurWrapper = xD(document.querySelector(".main-wrapper"));

    /**
     * @type {number}
     * @private
     */
    this._lastInteraction = 0;
}

/**
 * @return {boolean}
 */
App.prototype.acceptInteraction = function () {
    if (this._lastInteraction > Date.now() - UI_INTERACTION_TIMEOUT) {
        return false;
    }
    this._lastInteraction = Date.now();

    return true;
};

/**
 * Switch to view
 * @param {View} view
 * @param {Function=} transition
 * @return {Promise<*>|void}
 */
App.prototype.switchView = function (view, transition) {
    console.log("App.switchView", view);

    // if (!this.acceptInteraction()) {
    //     return;
    // }

    for (let i = 0; i < this.views.length; i++) {
        if (i === this.views.length - 1) {
            TweenMax.fromTo(this.views[i].element, 0.1, {opacity: 1}, {opacity: 0, onComplete: function (/** @type {View} */ view) {
                    view.hide();
                    view.element.style.opacity = "1"; // resetting opacity after animation
                    view.stop();
                }.bind(this, this.views[i])
            });
        } else {
            // console.log("hide&stop view", this.views[i]);
            this.views[i].hide();
            this.views[i].stop();
        }
    }

    // this._pagesWrapper.classList.remove("pages--blurred");
    // this._settingsWrapper.classList.remove("settings--blurred");
    this._alertsWrapper.hide();
    this._alerts2Wrapper.hide();

    view.element.style.transform = "none";

    this.views = [view];
    this.activeView = view;

    return new Promise(function (resolve, reject) {
        this.activeView.start(resolve, reject);

        if (!transition) {
            if (this._firstView) {
                this._firstView = false;
                transition = function (/** @type {View} */ view) {
                    view.show();
                    TweenMax.fromTo(view.element, 0.5, {opacity: 0}, {opacity: 1});
                };
            } else {
                transition = function (/** @type {View} */ view) {
                    view.show();
                };
            }
        }
        transition(this.activeView);
    }.bind(this));
};

const FLAGS_APP_PUSHVIEW_MODAL_SHOW = 1;
const FLAGS_APP_PUSHVIEW_MODAL_FADEIN = 2;
const FLAGS_APP_PUSHVIEW_PAGE_FROM_ALERT = 4;
const FLAGS_APP_PREVVIEW_CLOSEALLALERTS = 8;

/**
 * Push view
 * @param {View} view
 * @param {number=} flags
 * @return {Promise<*>|void}
 */
App.prototype.pushView = function (view, flags) {
    // console.log("App.pushView", view);

    // if (!this.acceptInteraction()) {
    //     return;
    // }

    let curView = this.activeView;
    this.views.push(view);
    this.activeView = view;

    if (flags & FLAGS_APP_PUSHVIEW_PAGE_FROM_ALERT) {
        TweenMax.fromTo(this._alertsWrapper, UI_ALERTVIEW_TIME_R, {opacity: 1}, {opacity: 0, ease: Power0.easeNone, onComplete: function () {
                this._alertsWrapper.hide();
                // this._pagesWrapper.classList.remove("pages--blurred");
                // this._settingsWrapper.classList.remove("settings--blurred");
            }.bind(this)
        });
    }

    return new Promise(function (resolve, reject) {
        this.activeView.start(resolve, reject);
        if (flags & FLAGS_APP_PUSHVIEW_MODAL_SHOW || flags & FLAGS_APP_PUSHVIEW_MODAL_FADEIN) {
            let animDuration = flags & FLAGS_APP_PUSHVIEW_MODAL_SHOW ? 0 : UI_MODALVIEW_TIME;
            TweenMax.fromTo(this.activeView.element, animDuration, {opacity: 0, zIndex: parseInt(curView.element.style.zIndex || "100") + 1}, {opacity: 1, ease: Power0.easeNone, onComplete: function () {
                    this.activeView.show();
                }.bind(this)
            });
        } else {
            TweenMax.fromTo(this.activeView.element, UI_PUSHVIEW_TIME, {x: "100%", zIndex: parseInt(curView.element.style.zIndex || "100") + 1}, {x: "0%", display: "block", ease: Power2.easeNone, onComplete: function () {
                    this.activeView.show();
                }.bind(this)});
        }
    }.bind(this));
};

/**
 * Show popup
 * @param {View} view
 * @return {Promise<*>|void}
 */
App.prototype.alertView = function (view) {
    // console.log("App.alertView", view);

    // if (!this.acceptInteraction()) {
    //     return;
    // }

    if ([VIEW_ALERT, VIEW_ALERT_SLIDE].indexOf(this.activeView.type) !== -1) {
        this.activeView.hide();
    }

    this.views.push(view);
    this.activeView = view;

    // this._pagesWrapper.classList.add("pages--blurred");
    // this._settingsWrapper.classList.add("settings--blurred");

    return new Promise(function (resolve, reject) {
        this.activeView.start(resolve, reject);
        this.activeView.show();
        if (view.type === VIEW_ALERT) {
            this._alertsWrapper.show();
            TweenMax.fromTo(view.element, UI_ALERTVIEW_TIME, {opacity: 0}, {opacity: 1});
        } else if (view.type === VIEW_ALERT_SLIDE) {
            this._alerts2Wrapper.show();
            // this.__alerts2Wrapper = Date.now() + 100; // this._alerts2Wrapper clicks skip timeout
            TweenMax.fromTo(view.element, UI_ALERTSLIDEVIEW_TIME, {y: "100%"}, {y: "5%", onComplete: function () {
                    // view.element.style.bottom = "auto";
                    // view.element.style.top = (view.element.parentNode.getBoundingClientRect().height - view.element.getBoundingClientRect().height) + "px";
                }.bind(this)
            });
        }
    }.bind(this));
};

/**
 * Return to previous view
 * @param {number=} flags
 * @return {Promise<*>|void}
 */
App.prototype.prevView = function (flags) {
    // console.log("App.prevView");

    // if (!this.acceptInteraction()) {
    //     return;
    // }

    // if (this.__alerts2Wrapper > Date.now()) { // this._alerts2Wrapper clicks skip timeout
    //     return;
    // }

    if (this.views.length < 2) {
        return;
    }

    this.views.pop();

    /** @type {View} */
    let prevView = this.views[this.views.length - 1];

    while ((flags & FLAGS_APP_PREVVIEW_CLOSEALLALERTS) && prevView.type === VIEW_ALERT) {
        this.views.pop();
        prevView = this.views[this.views.length - 1];
    }

    return new Promise(function (resolve, reject) {
        if ([VIEW_ALERT, VIEW_ALERT_SLIDE].indexOf(this.activeView.type) !== -1) {
            let callback = function () {
                this.activeView.hide();
                this.activeView.stop();
                this.activeView = prevView;

                if ([VIEW_ALERT, VIEW_ALERT_SLIDE].indexOf(this.activeView.type) !== -1) { // if previous view wan an alert
                    this.activeView.show();
                    TweenMax.fromTo(this.activeView.element, UI_ALERTVIEW_TIME, {opacity: 0}, {opacity: 1});
                } else { // if previous view was a page
                    // this._pagesWrapper.classList.remove("pages--blurred");
                    // this._settingsWrapper.classList.remove("settings--blurred");
                    this._alertsWrapper.hide();
                    this._alerts2Wrapper.hide();
                }

                resolve();
            }.bind(this);

            var callbackWrapper = function () {
                if ([VIEW_ALERT, VIEW_ALERT_SLIDE].indexOf(prevView.type) === -1) { // if previous view was a page
                    // this._pagesWrapper.classList.remove("pages--blurred");
                    // this._settingsWrapper.classList.remove("settings--blurred");
                }
                callback();
            }.bind(this);

            if (this.activeView.type === VIEW_ALERT) {
                if ([VIEW_ALERT, VIEW_ALERT_SLIDE].indexOf(prevView.type) === -1) { // if previous view was a page
                    TweenMax.fromTo(this.activeView.element, UI_ALERTVIEW_TIME_R, {opacity: 1}, {opacity: 0, onComplete: callbackWrapper});
                } else {
                    this.activeView.hide();
                    callbackWrapper();
                }
            } else if (this.activeView.type === VIEW_ALERT_SLIDE) {
                let m = this.activeView.element.style.transform.match(/translate3d\([\d\.]+px, ([\d\.]+)px/); // eslint-disable-line
                let y = m ? parseFloat(m[1]) : 0;
                let percent = 0.05 + y / (this.activeView.element.getBoundingClientRect().height); // 0.05 because 5% of height are below screen bottom
                // console.log({y: y, height: this.activeView.element.getBoundingClientRect().height, percent: percent});
                TweenMax.fromTo(this.activeView.element, UI_ALERTSLIDEVIEW_TIME_R * (1 - percent), {y: (percent * 100) + "%"}, {y: "100%", onComplete: callbackWrapper});
            }
        } else { // this.activeView.type === VIEW_PAGE
            if (flags & FLAGS_APP_PUSHVIEW_MODAL_SHOW || flags & FLAGS_APP_PUSHVIEW_MODAL_FADEIN) {
                if (flags & FLAGS_APP_PUSHVIEW_PAGE_FROM_ALERT) {
                    this._alertsWrapper.show();
                    // this._pagesWrapper.classList.add("pages--blurred");
                    // this._settingsWrapper.classList.add("settings--blurred");
                    TweenMax.fromTo(this._alertsWrapper, UI_ALERTVIEW_TIME, {opacity: 0}, {opacity: 1, ease: Power0.easeNone, onComplete: function (/** @type {View} */ view, /** @type {View} */ prevView) {
                            view.hide();
                            view.stop();
                            prevView.show();
                            resolve();
                        }.bind(null, this.activeView, prevView)
                    });
                } else {
                    let animDuration = flags & FLAGS_APP_PUSHVIEW_MODAL_SHOW ? 0 : UI_MODALVIEW_TIME;
                    TweenMax.fromTo(this.activeView.element, animDuration, {opacity: 1}, {opacity: 0, ease: Power0.easeNone, onComplete: function (/** @type {View} */ view, /** @type {View} */ prevView) {
                            view.hide();
                            view.stop();
                            prevView.show();
                            resolve();
                        }.bind(null, this.activeView, prevView)
                    });
                }
            } else {
                let m = this.activeView.element.style.transform.match(/translate\(([\d\.]+)%/); // eslint-disable-line
                let x = m ? parseFloat(m[1]) : 0;
                let percent = (100 - x) / 100;
                TweenMax.fromTo(this.activeView.element, UI_PUSHVIEW_TIME_R * percent, {x: x + "%"}, {x: "100%", ease: Power0.easeNone, onComplete: function (/** @type {View} */ view, /** @type {View} */ prevView) {
                        view.hide();
                        view.stop();
                        prevView.show();
                        resolve();
                    }.bind(this, this.activeView, prevView)
                });
            }

            this.activeView = prevView;
            // this.activeView.show();
        }
    }.bind(this));
};

/**
 * Blur
 * @param {boolean} blur
 */
App.prototype.blur = function (blur) {
    if (blur) {
        this._blurWrapper.classList.add("main-wrapper--blurred");
    } else {
        this._blurWrapper.classList.remove("main-wrapper--blurred");
    }
};

const NOTIFICATION_INFO = "info";
const NOTIFICATION_ERROR = "error";
const NOTIFICATION_WARNING = "warning";
const NOTIFICATION_SUCCESS = "success";
const NOTIFICATION_LOADING = "loading";

/**
 * Show notification
 * @param {{text: string, type: string=, hideTimeout: number=, feedback: string=}} config
 * @return {HTMLElement|xD}
 */
App.prototype.showNotification = function (config) {
    this.hideAllNotifications();

    config.type = config.type || NOTIFICATION_INFO;
    config.hideTimeout = typeof config.hideTimeout !== "undefined" ? config.hideTimeout : UI_ERROR_NOTIFICATION_DEFAULT_TIMEOUT * 1000;

    /** @type {HTMLElement|xD} */
    let notification = xD(this._notificationTemplate.cloneNode(true));

    notification.classList.add("notification--" + config.type);
    if ([NOTIFICATION_LOADING].indexOf(config.type) === -1) {
        this.feedbackNotification(config.feedback || config.type);
    }

    notification.querySelector(".notification__text").innerHTML = config.text;

    notification.querySelector("button").onclick = function () {
        notification.parentNode.removeChild(notification);
    };

    notification.show();

    this._notificationsWrapper.appendChild(notification);

    if (config.hideTimeout !== UI_ERROR_NOTIFICATION_NO_TIMEOUT) {
        setTimeout(function () {
            if (!notification.parentNode) { // notification has already been removed by hideAllNotifications()
                return;
            }
            notification.parentNode.removeChild(notification);
        }, config.hideTimeout);
    }

    return notification;
};

/**
 * @param {HTMLElement|xD} notificationElement
 */
App.prototype.hideNotification = function (notificationElement) {
    notificationElement.parentNode.removeChild(notificationElement);
};

const FEEDBACK_INFO = "info"; // NOTIFICATION_INFO
const FEEDBACK_ERROR = "error"; // NOTIFICATION_ERROR
const FEEDBACK_WARNING = "warning"; // NOTIFICATION_WARNING
const FEEDBACK_SUCCESS = "success"; // NOTIFICATION_SUCCESS
const FEEDBACK_LIGHT = "light";
const FEEDBACK_MEDIUM = "medium";
const FEEDBACK_HEAVY = "heavy";
const FEEDBACK_SELECTION = "selection";

/**
 * @param {string} type
 */
App.prototype.feedbackNotification = function (type) {
    type = [FEEDBACK_INFO, FEEDBACK_SUCCESS].indexOf(type) !== -1 ? FEEDBACK_MEDIUM : type;
    bridgeCallHandler("feedback", {type: type});
};

/**
 * Hide all notifications
 */
App.prototype.hideAllNotifications = function () {
    this._notificationsWrapper.querySelectorAll(".notification").forEach(function (/** @type {HTMLElement} */ element) {
        if (element.style.display === "none") { // notification template block
            return;
        }
        element.parentNode.removeChild(element);
    });
};
