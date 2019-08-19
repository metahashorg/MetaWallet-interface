/**
 * @param {ViewConfig} config
 * @constructor
 */
class PasscodeSettingsView extends View {
    constructor (config) {
        config = Object.assign(config, {
            dataSelector: "view.settings.passcode"
        });
        super(config, config);
        View.apply(this, arguments);
        /** @type {Array<string>} */
        this.passcodeSettings = [];
    }
    onStarted () {
        this.element.querySelector(".js--settings-passcode--toggle").onclick = function () {
            if (this.app.settings.get("passcode.passcode")) {
                this.turnOffPasscode();
            } else {
                this.turnOnPasscode();
            }
        }.bind(this);
        this.element.querySelector(".js--settings-passcode--change").onclick = function () {
            this.changePasscode();
        }.bind(this);
        if (this.app.env["faceId"] || this.app.env["touchId"]) {
            this.passcodeSettings.push("faceid");
        }
        this.updateUi();
    }
    updateUi () {
        this.element.querySelector(".js--settings-passcode--change").style.display = this.app.settings.get("passcode.passcode") ? "block" : "none";
        this.element.querySelector(".js--settings-passcode--toggle lang").innerHTML = this.app.settings.get("passcode.passcode") ? __("settings.passcode.turnoff") : __("settings.passcode.turnon");
        this.element.querySelectorAll(".js--settings-passcode--options .settings-block-item").forEach(function ( /** @type {HTMLElement} */ element) {
            /** @type {HTMLElement} */
            let block = element.querySelector(".settings-block-item-inner");
            /** @type {HTMLElement} */
            let input = element.querySelector("input");
            if (this.app.settings.get("passcode.passcode")) {
                block.classList.remove("settings-block-item-inner--disabled");
                input.removeAttribute("disabled");
            } else {
                block.classList.add("settings-block-item-inner--disabled");
                input.setAttribute("disabled", "disabled");
            }
        }.bind(this));
        initSettingsCheckboxes(this.app, this.element, "passcode", this.passcodeSettings, function ( /** @type {Object} */ params) {
            this.onCheckboxChanged(params);
        }.bind(this));
    }
    turnOnPasscode () {
        this.app.pushView(new PasscodeAlertView( /** @type {ViewConfig} */ {
                app: this.app,
                title: "passcodemodalview.title.new",
                editMode: true
            }), FLAGS_APP_PUSHVIEW_MODAL_FADEIN)
            .then(function ( /** @type {string} */ passcode) {
                console.log("+", passcode);
                this.app.prevView(FLAGS_APP_PUSHVIEW_MODAL_SHOW);
                /** @type {string} */
                this.__passcode = passcode;
                this.app.pushView(new PasscodeAlertView( /** @type {ViewConfig} */ {
                        app: this.app,
                        title: "passcodemodalview.title.repeat",
                        editMode: true
                    }), FLAGS_APP_PUSHVIEW_MODAL_SHOW)
                    .then(function ( /** @type {string} */ passcode) {
                        console.log("++", passcode);
                        this.app.prevView(FLAGS_APP_PUSHVIEW_MODAL_FADEIN);
                        if (this.__passcode !== passcode) {
                            this.app.showNotification({
                                text: __("settings.passcode.error.donotmatch"),
                                type: NOTIFICATION_ERROR,
                                hideTimeout: UI_ERROR_NOTIFICATION_LONG_TIMEOUT * 1000
                            });
                            return;
                        }
                        this.app.showNotification({
                            text: __("settings.passcode.turnedon"),
                            type: NOTIFICATION_SUCCESS
                        });
                        this.app.settings.set("passcode.passcode", passcode);
                        this.updateUi();
                    }.bind(this))
                    .catch(function () {
                        this.app.prevView(FLAGS_APP_PUSHVIEW_MODAL_FADEIN);
                    }.bind(this));
            }.bind(this))
            .catch(function () {
                this.app.prevView(FLAGS_APP_PUSHVIEW_MODAL_FADEIN);
            }.bind(this));
    }
    turnOffPasscode () {
        this.app.pushView(new PasscodeAlertView( /** @type {ViewConfig} */ {
                app: this.app,
                autoFaceId: true
            }), FLAGS_APP_PUSHVIEW_MODAL_FADEIN)
            .then(function () {
                this.app.prevView(FLAGS_APP_PUSHVIEW_MODAL_FADEIN);
                this.app.showNotification({
                    text: __("settings.passcode.turnedoff"),
                    type: NOTIFICATION_SUCCESS
                });
                this.app.settings.set("passcode.passcode", "");
                this.updateUi();
            }.bind(this))
            .catch(function () {
                this.app.prevView(FLAGS_APP_PUSHVIEW_MODAL_FADEIN);
            }.bind(this));
    }
    changePasscode () {
        this.app.pushView(new PasscodeAlertView( /** @type {ViewConfig} */ {
                app: this.app,
                autoFaceId: true
            }), FLAGS_APP_PUSHVIEW_MODAL_FADEIN)
            .then(function () {
                this.app.prevView(FLAGS_APP_PUSHVIEW_MODAL_SHOW);
                this.app.pushView(new PasscodeAlertView( /** @type {ViewConfig} */ {
                        app: this.app,
                        title: "passcodemodalview.title.new",
                        editMode: true
                    }), FLAGS_APP_PUSHVIEW_MODAL_SHOW)
                    .then(function ( /** @type {string} */ passcode) {
                        console.log("+", passcode);
                        this.app.prevView(FLAGS_APP_PUSHVIEW_MODAL_SHOW);
                        /** @type {string} */
                        this.__passcode = passcode;
                        this.app.pushView(new PasscodeAlertView( /** @type {ViewConfig} */ {
                                app: this.app,
                                title: "passcodemodalview.title.repeat",
                                editMode: true
                            }), FLAGS_APP_PUSHVIEW_MODAL_SHOW)
                            .then(function ( /** @type {string} */ passcode) {
                                console.log("++", passcode);
                                this.app.prevView(FLAGS_APP_PUSHVIEW_MODAL_FADEIN);
                                if (this.__passcode !== passcode) {
                                    this.app.showNotification({
                                        text: __("settings.passcode.error.donotmatch"),
                                        type: NOTIFICATION_ERROR,
                                        hideTimeout: UI_ERROR_NOTIFICATION_LONG_TIMEOUT * 1000
                                    });
                                    return;
                                }
                                this.app.showNotification({
                                    text: __("settings.passcode.changed"),
                                    type: NOTIFICATION_SUCCESS
                                });
                                this.app.settings.set("passcode.passcode", passcode);
                            }.bind(this))
                            .catch(function () {
                                this.app.prevView(FLAGS_APP_PUSHVIEW_MODAL_FADEIN);
                            }.bind(this));
                    }.bind(this))
                    .catch(function () {
                        this.app.prevView(FLAGS_APP_PUSHVIEW_MODAL_FADEIN);
                    }.bind(this));
            }.bind(this))
            .catch(function () {
                this.app.prevView(FLAGS_APP_PUSHVIEW_MODAL_FADEIN);
            }.bind(this));
    }
    /**
     * @param {{param: string, value: number, checkbox: HTMLInputElement}} params
     */
    onCheckboxChanged (params) {
        if (!params.value) { // check passcode to turn off
            this.app.pushView(new PasscodeAlertView( /** @type {ViewConfig} */ {
                    app: this.app
                }), FLAGS_APP_PUSHVIEW_MODAL_FADEIN)
                .then(function () {
                    this.app.prevView(FLAGS_APP_PUSHVIEW_MODAL_FADEIN);
                    this.app.settings.set(params.param, params.value);
                }.bind(this))
                .catch(function () {
                    params.checkbox.checked = true;
                    this.app.prevView(FLAGS_APP_PUSHVIEW_MODAL_FADEIN);
                }.bind(this));
        } else {
            this.app.settings.set(params.param, params.value);
        }
    }
}