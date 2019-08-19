/**
 * @param {Object=} config
 * @constructor
 */
class MetaWallet extends App {
    constructor (config) {
        super(config, config);
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
    initViews () {
        document.querySelector(".bottom-menus").onclick = function ( /** @type {TouchEvent|MouseEvent} */ event) {
            if (event.target !== document.querySelector(".bottom-menus")) {
                return;
            }
            event.stopPropagation();
            this.prevView();
        }.bind(this);
    }
    /**
     * Network state changed
     * @param {{isReachable: number}} reachability
     */
    reachabilityChanged (reachability) {
        this.networkState = reachability.isReachable;
        if (this.networkState === NETWORK_OFFLINE) {
            document.body.classList.add("disconnected");
        } else {
            document.body.classList.remove("disconnected");
        }
    }
    start () {
        if (window.onAppStarted && window.onAppStarted.length) {
            window.onAppStarted.forEach(function ( /** @type {Function} */ callback) {
                callback();
            });
            delete window.onAppStarted;
        }
        this.switchView(new LoaderView( /** @type {ViewConfig} */ {
            app: this
        }));
        setTimeout(function () {
            bridgeCallHandler("getEnv")
                .then(function ( /** @type {NativeEnv} */ env) {
                    this.env = env;
                }.bind(this))
                .catch(function () {});
            this.initUser()
                .then(function () {
                    this.onUserAuth();
                }.bind(this))
                .catch(function () {
                    this.switchView(new AuthView( /** @type {ViewConfig} */ {
                        app: this
                    }));
                }.bind(this));
        }.bind(this), 1000);
    }
    /**
     * @return {Promise<*>}
     */
    initUser () {
        return new Promise(function (resolve, reject) {
            bridgeCallHandler("getUser", {
                email: DEFAULT_USER_EMAIL
            }).then(function ( /** @type {NativeUser} */ user) {
                this.user = new User({
                    app: this,
                    user: user
                });
                bridgeCallHandler("getSettings", {
                    email: this.user.email
                }).then(function ( /** @type {Object<string, string|number>} */ settings) {
                    this.settings = new Settings({
                        app: this,
                        settings: settings
                    });
                    if (window.metawallet.user.token === "" || window.metawallet.user.tokenRefresh === "") {
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
    }
    onUserAuth () {
        this.walletCollection = new WalletCollection({
            app: this
        });
        this.nodesCollection = new NodeCollection({
            app: this
        });
        this.switchView(new CurrenciesView( /** @type {ViewConfig} */ {
            app: this
        }));
    }
    /**
     * @param {Function} resolve
     * @param {Function} reject
     */
    checkPasscode (resolve, reject) {
        console.log("MetaWallet.checkPasscode");
        if (!this.settings.get("passcode.passcode")) {
            resolve();
            return;
        }
        this.pushView(new PasscodeAlertView( /** @type {ViewConfig} */ {
                app: this,
                autoFaceId: true
            }), FLAGS_APP_PUSHVIEW_MODAL_FADEIN)
            .then(function () {
                this.prevView(FLAGS_APP_PUSHVIEW_MODAL_FADEIN);
                resolve();
            }.bind(this))
            .catch(function () {
                this.prevView(FLAGS_APP_PUSHVIEW_MODAL_FADEIN);
                this.user.clearTokens();
                reject();
            }.bind(this));
    }
    activate () {
        if (this.settings.get("passcode.passcode")) {
            this.pushView(new PasscodeAlertView( /** @type {ViewConfig} */ {
                    app: this,
                    autoFaceId: true
                }), FLAGS_APP_PUSHVIEW_MODAL_FADEIN)
                .then(function () {
                    this.prevView(FLAGS_APP_PUSHVIEW_MODAL_FADEIN);
                    this.onActivated();
                }.bind(this))
                .catch(function () {
                    this.prevView(FLAGS_APP_PUSHVIEW_MODAL_FADEIN);
                    this.user.clearTokens();
                    this.switchView(new AuthView( /** @type {ViewConfig} */ {
                        app: this
                    }));
                }.bind(this));
        }
    }
    onActivated () {
        this.walletCollection.load(true);
    }
    showTutorial () {
        /** @type {Object<string, Object<{view: string, type: number}>>} */
        let steps = {
            offerpasscode: {
                view: OfferPasscodeAlertView,
                type: VIEW_ALERT
            },
            icloudsync: {
                view: iCloudSyncAlertView,
                type: VIEW_ALERT
            },
        };
        Object.keys(steps).forEach(function ( /** @type {string} */ i) {
            if (!parseInt(this.settings.get("tutorial." + i, 0))) {
                if (steps[i].type === VIEW_ALERT) {
                    this.alertView( new steps[i].view( /** @type {ViewConfig} */ {
                            app: this
                        }))
                        .then(function () {
                            this.showTutorial();
                        }.bind(this))
                        .catch(function () {
                            this.showTutorial();
                        }.bind(this));
                }
            }
        }.bind(this));
    }
}