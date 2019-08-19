/**
 * @param {{
 *     app: MetaWallet,
 *     user: NativeUser=
 * }} config
 * @constructor
 */
class User {
    constructor (config) {
        /**
         * @type {Object}
         * @private
         */
        this._config = config;
        /** @type {MetaWallet} */
        this.app = config.app;
        /** @type {string} */
        this.token = config.user.token || "";
        /** @type {string} */
        this.tokenRefresh = config.user.tokenRefresh || "";
        /** @type {string} */
        this.lang = "en";
        /** @type {string} */
        this.email = config.user.email;
        /** @type {string} */
        this.login = config.user.login;
        /**
         * @private
         * @type {Task}
         */
        this._refreshTokenTask = new Task( /** @type {TaskConfig} */ {
            interval: 5 * 60 * 1000,
            callback: function () {
                console.log("User._refreshTokenTask");
                if (!this.tokenRefresh) {
                    return;
                }
                this.tryRefreshToken().catch(function () {
                    this.app.switchView(new AuthView( /** @type {ViewConfig} */ {
                        app: this.app
                    }));
                }.bind(this));
            }.bind(this)
        });
    }
    /**
     * Check token
     *
     * @todo переписать на metagate.js
     */
    checkToken () {
        console.log("User.checkToken");
        return new Promise(function (resolve, reject) {
            if (!this.token) {
                reject();
                return;
            }
            apiXhr(getJsonRpcXhrParams("user.token", {
                    token: this.token
                }))
                .then(function (response) {
                    if (response.result === API_OK) {
                        resolve();
                    } else {
                        this.token = null;
                        reject();
                    }
                }.bind(this))
                .catch(function () {
                    reject();
                });
        }.bind(this));
    }
    /**
     * Get new token by refresh-token
     *
     * @todo переписать на metagate.js
     */
    tryRefreshToken () {
        console.log("User.tryRefreshToken");
        return new Promise(function (resolve, reject) {
            if (!this.tokenRefresh) {
                reject();
                return;
            }
            apiXhr(getJsonRpcXhrParams("user.token.refresh", {
                    token: this.tokenRefresh
                }))
                .then(function (response) {
                    if (response.result === API_OK) {
                        this.token = response.data["access"];
                        this.tokenRefresh = response.data["refresh"];
                        this.save();
                        console.log("user.token.refreshed", API_OK);
                        resolve();
                    } else {
                        this.token = "";
                        this.tokenRefresh = "";
                        this.save();
                        reject();
                    }
                }.bind(this))
                .catch(function () {
                    this.token = "";
                    this.tokenRefresh = "";
                    this.save();
                    reject();
                }.bind(this));
        }.bind(this));
    }
    /**
     * Log in to MetaGate account
     * @param {Object<string, string>} formData
     *
     * @todo переписать на metagate.js
     */
    auth (formData) {
        console.log("User.auth");
        apiXhr(getJsonRpcXhrParams("user.auth", {
                params: [formData]
            }))
            .then(function (response) {
                if (response.result === API_OK) {
                    this.email = formData.login;
                    this.login = formData.login;
                    this.token = response.data["token"];
                    this.tokenRefresh = response.data["refresh_token"];
                    this.save();
                    this.app.settings.set("token.refresh", time());
                    this.app.onUserAuth();
                } else {
                    this.app.showNotification({
                        text: __("error.wrongpassword"),
                        type: NOTIFICATION_ERROR,
                        hideTimeout: UI_ERROR_NOTIFICATION_LONG_TIMEOUT * 1000
                    });
                }
            }.bind(this))
            .catch(function (response) {
                if (response && response.data) {
                    if (["FIELD_EMPTY", "FIELD_INVALID_FORMAT", "FIELD_INVALID_VALUE"].indexOf(response.data["code"]) !== -1) {
                        this.app.showNotification({
                            text: __("error.wrongpassword"),
                            type: NOTIFICATION_ERROR,
                            hideTimeout: UI_ERROR_NOTIFICATION_LONG_TIMEOUT * 1000
                        });
                    } else if (response.data["code"] === "USER_NOT_FOUND") {
                        this.app.showNotification({
                            text: __("auth.error.usernotfound"),
                            type: NOTIFICATION_ERROR,
                            hideTimeout: UI_ERROR_NOTIFICATION_LONG_TIMEOUT * 1000
                        });
                    } else {
                        this.app.showNotification({
                            text: __("error.unknown"),
                            type: NOTIFICATION_ERROR,
                            hideTimeout: UI_ERROR_NOTIFICATION_LONG_TIMEOUT * 1000
                        });
                    }
                } else {
                    console.log("response", response);
                    this.app.showNotification({
                        text: __("error.connection"),
                        type: NOTIFICATION_ERROR,
                        hideTimeout: UI_ERROR_NOTIFICATION_LONG_TIMEOUT * 1000
                    });
                }
            }.bind(this));
    }
    /**
     * Create MetaGate account
     * @param {Object<string, string>} formData
     *
     * @todo переписать на metagate.js
     */
    register (formData) {
        console.log("User.register");
        apiXhr(getJsonRpcXhrParams("user.register", {
                params: [formData]
            }))
            .then(function (response) {
                if (response.result === API_OK) {
                    this.auth(formData);
                } else {
                    if (response && response.data) {
                        console.log("response.data", response.data);
                        if (["FIELD_EMPTY", "FIELD_INVALID_FORMAT"].indexOf(response.data["code"]) !== -1) {
                            this.app.showNotification({
                                text: __("error.emptyfields"),
                                type: NOTIFICATION_ERROR,
                                hideTimeout: UI_ERROR_NOTIFICATION_LONG_TIMEOUT * 1000
                            });
                        } else if (response.data["code"] === "FIELD_EXISTS") {
                            this.app.showNotification({
                                text: __("register.error.emailexists"),
                                type: NOTIFICATION_ERROR,
                                hideTimeout: UI_ERROR_NOTIFICATION_LONG_TIMEOUT * 1000
                            });
                        } else if (response.data["code"] === "FIELD_LESS_SYMBOLS") {
                            this.app.showNotification({
                                text: __("error.passwordshort") + response.data["params"][1],
                                type: NOTIFICATION_ERROR,
                                hideTimeout: UI_ERROR_NOTIFICATION_LONG_TIMEOUT * 1000
                            });
                        } else {
                            this.app.showNotification({
                                text: __("error.unknown"),
                                type: NOTIFICATION_ERROR,
                                hideTimeout: UI_ERROR_NOTIFICATION_LONG_TIMEOUT * 1000
                            });
                        }
                    } else {
                        this.app.showNotification({
                            text: __("error.connection"),
                            type: NOTIFICATION_ERROR,
                            hideTimeout: UI_ERROR_NOTIFICATION_LONG_TIMEOUT * 1000
                        });
                    }
                }
            }.bind(this))
            .catch(function (response) {
                if (response && response.data) {
                    console.log("response.data", response.data);
                    if (["FIELD_EMPTY", "FIELD_INVALID_FORMAT"].indexOf(response.data["code"]) !== -1) {
                        this.app.showNotification({
                            text: __("error.emptyfields"),
                            type: NOTIFICATION_ERROR,
                            hideTimeout: UI_ERROR_NOTIFICATION_LONG_TIMEOUT * 1000
                        });
                    } else if (response.data["code"] === "FIELD_EXISTS") {
                        this.app.showNotification({
                            text: __("register.error.emailexists"),
                            type: NOTIFICATION_ERROR,
                            hideTimeout: UI_ERROR_NOTIFICATION_LONG_TIMEOUT * 1000
                        });
                    } else if (response.data["code"] === "FIELD_LESS_SYMBOLS") {
                        this.app.showNotification({
                            text: __("error.passwordshort") + response.data["params"][1],
                            type: NOTIFICATION_ERROR,
                            hideTimeout: UI_ERROR_NOTIFICATION_LONG_TIMEOUT * 1000
                        });
                    } else {
                        this.app.showNotification({
                            text: __("error.unknown"),
                            type: NOTIFICATION_ERROR,
                            hideTimeout: UI_ERROR_NOTIFICATION_LONG_TIMEOUT * 1000
                        });
                    }
                } else {
                    this.app.showNotification({
                        text: __("error.connection"),
                        type: NOTIFICATION_ERROR,
                        hideTimeout: UI_ERROR_NOTIFICATION_LONG_TIMEOUT * 1000
                    });
                }
            }.bind(this));
    }
    /**
     * Reset password of MetaGate account
     * @param {Object<string, string>} formData
     *
     * @todo переписать на metagate.js
     */
    resetPassword (formData) {
        console.log("User.resetPassword");
        apiXhr(getJsonRpcXhrParams("user.forgot", {
                params: [formData]
            }))
            .then(function (response) {
                if (response.result === API_OK) {
                    this.app.showNotification({
                        text: __("resetpassword.ok"),
                        type: NOTIFICATION_INFO,
                        hideTimeout: UI_ERROR_NOTIFICATION_LONG_TIMEOUT * 1000
                    });
                } else {
                    this.app.showNotification({
                        text: __("error.unknown"),
                        type: NOTIFICATION_ERROR,
                        hideTimeout: UI_ERROR_NOTIFICATION_LONG_TIMEOUT * 1000
                    });
                }
            }.bind(this))
            .catch(function (response) {
                if (response && response.data) {
                    if (response.data["code"] === "USER_NOT_FOUND") {
                        this.app.showNotification({
                            text: __("auth.error.usernotfound"),
                            type: NOTIFICATION_ERROR,
                            hideTimeout: UI_ERROR_NOTIFICATION_LONG_TIMEOUT * 1000
                        });
                    } else if (response.data["code"] && response.data["message"]) {
                        this.app.showNotification({
                            text: response.data["message"],
                            type: NOTIFICATION_ERROR,
                            hideTimeout: UI_ERROR_NOTIFICATION_LONG_TIMEOUT * 1000
                        });
                    } else {
                        this.app.showNotification({
                            text: __("error.unknown"),
                            type: NOTIFICATION_ERROR,
                            hideTimeout: UI_ERROR_NOTIFICATION_LONG_TIMEOUT * 1000
                        });
                    }
                } else {
                    this.app.showNotification({
                        text: __("error.connection"),
                        type: NOTIFICATION_ERROR,
                        hideTimeout: UI_ERROR_NOTIFICATION_LONG_TIMEOUT * 1000
                    });
                }
            }.bind(this));
    }
    /**
     * Change password of MetaGate account
     * @param {Object<string, string>} formData
     *
     * @todo переписать на metagate.js
     */
    changePassword (formData) {
        console.log("User.changePassword");
        return new Promise(function (resolve, reject) {
            apiXhr(getJsonRpcXhrParams("user.change.password", {
                    params: [formData],
                    token: this.token
                }))
                .then(function (response) {
                    if (response.result === API_OK) {
                        this.app.showNotification({
                            text: __("settings.password.changed"),
                            type: NOTIFICATION_SUCCESS,
                            hideTimeout: UI_ERROR_NOTIFICATION_LONG_TIMEOUT * 1000
                        });
                        resolve();
                    } else {
                        this.app.showNotification({
                            text: __("error.unknown"),
                            type: NOTIFICATION_ERROR,
                            hideTimeout: UI_ERROR_NOTIFICATION_LONG_TIMEOUT * 1000
                        });
                        reject();
                    }
                }.bind(this))
                .catch(function (response) {
                    if (response && response.data) {
                        if (response.data["code"] === "FIELD_INVALID_VALUE") {
                            this.app.showNotification({
                                text: __("settings.password.error.wrongpassword"),
                                type: NOTIFICATION_ERROR,
                                hideTimeout: UI_ERROR_NOTIFICATION_LONG_TIMEOUT * 1000
                            });
                        } else if (response.data["code"] === "FIELD_LESS_SYMBOLS") {
                            this.app.showNotification({
                                text: __("error.passwordshort") + response.data["params"][1],
                                type: NOTIFICATION_ERROR,
                                hideTimeout: UI_ERROR_NOTIFICATION_LONG_TIMEOUT * 1000
                            });
                        } else {
                            this.app.showNotification({
                                text: __("error.unknown"),
                                type: NOTIFICATION_ERROR,
                                hideTimeout: UI_ERROR_NOTIFICATION_LONG_TIMEOUT * 1000
                            });
                        }
                    } else {
                        this.app.showNotification({
                            text: __("error.connection"),
                            type: NOTIFICATION_ERROR,
                            hideTimeout: UI_ERROR_NOTIFICATION_LONG_TIMEOUT * 1000
                        });
                    }
                    reject();
                }.bind(this));
        }.bind(this));
    }
    /**
     * Log out
     */
    logout () {
        this.clearTokens();
        this.app.switchView(new AuthView( /** @type {ViewConfig} */ {
            app: this.app
        }));
    }
    clearTokens () {
        this.token = "";
        this.tokenRefresh = "";
        this.data = {};
        this.save();
    }
    /**
     * Save user data
     */
    save () {
        bridgeCallHandler("setUser", {
            email: this.email,
            login: this.login,
            token: this.token,
            tokenRefresh: this.tokenRefresh
        }).then().catch();
    }
}