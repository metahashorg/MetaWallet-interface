/**
 * @param {Object=} config
 * @constructor
 */
function MetaWallet (config) {
    App.apply(this, arguments);

    /**
     * @type {Object}
     * @private
     */
    this._config = config;

    /** @type {{proxy: Array<string>, tor: Array<string>}} */
    this.nodes = {
        tor: [],
        proxy: []
    };


    /** @type {?NativeEnv} */
    this.env = null;

    /** @type {?User} */
    this.user = null;

    /** @type {?Settings} */
    this.settings = null;

    /** @type {?WalletCollection} */
    this.walletCollection = null;

    /** @type {?NodeCollection} */
    this.nodeCollection = null;

    /** @type {number} */
    this.networkState = NETWORK_OFFLINE;

    this.initViews();
}

extendFunction(MetaWallet, App);

MetaWallet.prototype.initViews = function () {
    // document.querySelectorAll(".icon-arrow-back").forEach(function (/** @type {HTMLElement} */ element) {
    //     element.onclick = function () {
    //         this.prevView();
    //     }.bind(this);
    //
    //     let alert = element.closest(".alert");
    //     if (alert) {
    //         alert.onclick = function (/** @type {MouseEvent} */ event) {
    //             if (event.target !== alert) {
    //                 return;
    //             }
    //             this.prevView();
    //         }.bind(this);
    //     }
    //
    //     let page = element.closest(".page") || element.closest(".settings-page");
    //     if (page) {
    //         initSwipeDetect(this, page);
    //     }
    // }.bind(this));

    document.querySelector(".bottom-menus").onclick = function (/** @type {TouchEvent|MouseEvent} */ event) {
        if (event.target !== document.querySelector(".bottom-menus")) {
            return;
        }
        event.stopPropagation();
        this.prevView();
    }.bind(this);

    // document.querySelectorAll(".btm-menu-handle").forEach(function (/** @type {HTMLElement} */ element) {
    //     element.onclick = function (/** @type {TouchEvent|MouseEvent} */ event) {
    //         event.stopPropagation();
    //         this.prevView();
    //     }.bind(this);
    //
    //     let page = element.closest(".btm-menu");
    //     let app = this;
    //     Draggable.create(page, {
    //         trigger: element,
    //         type: "y",
    //         edgeResistance: 0.95,
    //         bounds: {minY: 0, maxY: screen.height},
    //         // onDrag: function () {
    //         //     console.log({y: this.y});
    //         // },
    //         onDragEnd: function () {
    //             if (this.endY >= this.target.getBoundingClientRect().height * UI_ALERTSLIDEVIEW_THRESHOLD) {
    //                 app.prevView();
    //             } else {
    //                 TweenMax.to(this.target, UI_ALERTSLIDEVIEW_TIME_R / 10, {y: "5%"});
    //             }
    //         }
    //     });
    // }.bind(this));

    // document.querySelectorAll(".icon-menu-dots").forEach(function (/** @type {HTMLElement} */ element) {
    //     element.onclick = function () {
    //         this.alertView(new MenuView(/** @type {ViewConfig} */ {app: this}));
    //     }.bind(this);
    // }.bind(this));
};

/**
 * Network state changed
 * @param {{isReachable: number}} reachability
 */
MetaWallet.prototype.reachabilityChanged = function (reachability) {
    this.networkState = reachability.isReachable;
    if (this.networkState === NETWORK_OFFLINE) {
        document.body.classList.add("disconnected");
    } else {
        document.body.classList.remove("disconnected");
    }
};

MetaWallet.prototype.start = function () {
    if (window.onAppStarted && window.onAppStarted.length) {
        window.onAppStarted.forEach(function (/** @type {Function} */callback) {
            callback();
        });
        delete window.onAppStarted;
    }

    this.switchView(new LoaderView(/** @type {ViewConfig} */ {app: this}));

    setTimeout(function () { // timeout for ui smoothness
        bridgeCallHandler("getEnv")
            .then(function (/** @type {NativeEnv} */ env) {
                this.env = env;
            }.bind(this))
            .catch(function () {
            });

        this.initUser()
            .then(function () {
                this.onUserAuth();
            }.bind(this))
            .catch(function () {
                this.switchView(new AuthView(/** @type {ViewConfig} */ {app: this}));
            }.bind(this));
    }.bind(this), 1000);
};

/**
 * @return {Promise<*>}
 */
MetaWallet.prototype.initUser = function () {
    return new Promise(function (resolve, reject) {

        bridgeCallHandler("getUser", {email: DEFAULT_USER_EMAIL}).then(function (/** @type {NativeUser} */ user) {
            this.user = new User({app: this, user: user});

            bridgeCallHandler("getSettings", {email: this.user.email}).then(function (/** @type {Object<string, string|number>} */ settings) {
                this.settings = new Settings({app: this, settings: settings});

                if (window.metawallet.user.token === "" || window.metawallet.user.tokenRefresh === ""){
                    reject();
                    return;
                }

                this.user.checkToken()
                    .then(function () {
                        resolve();
                    })
                    .catch(function () {
                        this.user.tryRefreshToken()
                            .then(function () {
                                console.log("MetaWallet.user.tryRefreshToken", "resolved");
                                this.checkPasscode(resolve, reject);
                            }.bind(this))
                            .catch(function (e) {
                                console.log("MetaWallet.user.tryRefreshToken", "rejected");
                                console.log(e);
                                reject();
                            });
                    }.bind(this));
            }.bind(this));

        }.bind(this));

    }.bind(this));
};

MetaWallet.prototype.onUserAuth = function () {
    this.walletCollection = new WalletCollection({app: this});
    this.nodesCollection = new NodeCollection({app: this});
    this.switchView(new window[DEFAULT_VIEW](/** @type {ViewConfig} */ {app: this}));
};

/**
 * @param {Function} resolve
 * @param {Function} reject
 */
MetaWallet.prototype.checkPasscode = function (resolve, reject) {
    console.log("MetaWallet.checkPasscode");
    if (!this.settings.get("passcode.passcode")) {
        resolve();
        return;
    }
    this.pushView(new PasscodeAlertView(/** @type {ViewConfig} */ {app: this, autoFaceId: true}), FLAGS_APP_PUSHVIEW_MODAL_FADEIN)
        .then(function () {
            this.prevView(FLAGS_APP_PUSHVIEW_MODAL_FADEIN);
            resolve();
        }.bind(this))
        .catch(function () {
            this.prevView(FLAGS_APP_PUSHVIEW_MODAL_FADEIN);
            this.user.clearTokens();
            reject();
        }.bind(this));
};

MetaWallet.prototype.activate = function () {
    if (this.settings.get("passcode.passcode")) {
        this.pushView(new PasscodeAlertView(/** @type {ViewConfig} */ {app: this, autoFaceId: true}), FLAGS_APP_PUSHVIEW_MODAL_FADEIN)
            .then(function () {
                this.prevView(FLAGS_APP_PUSHVIEW_MODAL_FADEIN);
                this.onActivated();
            }.bind(this))
            .catch(function () {
                this.prevView(FLAGS_APP_PUSHVIEW_MODAL_FADEIN);
                this.user.clearTokens();
                this.switchView(new AuthView(/** @type {ViewConfig} */ {app: this}));
            }.bind(this));
    }
};

MetaWallet.prototype.onActivated = function () {
    this.walletCollection.load(true);
};

MetaWallet.prototype.showTutorial = function () {
    /** @type {Object<string, Object<{view: string, type: number}>>} */
    let steps = {
        offerpasscode: {view: "OfferPasscodeAlertView", type: VIEW_ALERT},
        icloudsync: {view: "iCloudSyncAlertView", type: VIEW_ALERT},
    };

    Object.keys(steps).forEach(function (/** @type {string} */ i) {
        if (!parseInt(this.settings.get("tutorial." + i, 0))) {
            if (steps[i].type === VIEW_ALERT) {
                this.alertView(new window[steps[i].view](/** @type {ViewConfig} */ {app: this}))
                    .then(function () {
                        this.showTutorial();
                    }.bind(this))
                    .catch(function () {
                        this.showTutorial();
                    }.bind(this));
            }
        }
    }.bind(this));
};
