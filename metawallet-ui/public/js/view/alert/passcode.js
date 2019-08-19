/**
 * @param {ViewConfig|{autoFaceId: boolean=, editMode: boolean=}} config
 * @constructor
 */
class PasscodeAlertView extends View {
    constructor (config) {
        config = Object.assign(config, {
            dataSelector: "view.passcode"
        });
        super(config, config);
        View.apply(this, arguments);
        /** @type {string} */
        this.title = config["title"] || "passcodemodalview.title";
        /** @type {?string} */
        this.subTitle = config["subTitle"] || null;
        /** @type {boolean} */
        this.autoFaceId = config.autoFaceId || false;
        /** @type {boolean} */
        this.editMode = config.editMode || false;
    }
    onStarted () {
        /** @type {Array<string>} */
        this.passcode = [];
        this.element.querySelector(".icon-arrow-back").onclick = function () {
            this._reject();
        }.bind(this);
        this.element.querySelector(".locked-header").innerHTML = __(this.title);
        this.element.querySelector(".locked-subheader").innerHTML = this.subTitle ? __(this.subTitle) : "";
        this.element.querySelectorAll(".locked-key").forEach(function ( /** @type {HTMLElement} */ element) {
            element.onclick = function ( /** @type {HTMLElement} */ element) {
                this.onKey(element.getAttribute("data-key"));
            }.bind(this, element);
        }.bind(this));
        this.element.qs("delete-key").onclick = function () {
            this.onDelete();
        }.bind(this);
        /** @type {HTMLElement|xD} */
        this.faceIdKeyElement = this.element.qs("faceid-key");
        if (!this.editMode && this.app.settings.get("passcode.faceid")) {
            this.faceIdKeyElement.style.visibility = "visible";
            this.faceIdKeyElement.onclick = function () {
                this.onFaceId();
            }.bind(this);
        } else {
            this.faceIdKeyElement.style.visibility = "hidden";
        }
    }
    onShown () {
        if (!this.editMode && this.autoFaceId && this.app.settings.get("passcode.faceid")) {
            setTimeout(function () {
                this.onFaceId();
            }.bind(this), UI_PASSCODE_CHECKID_DELAY * 1000);
        }
    }
    onStopped () {
        // Events.removeListener("Platform.onLockChecked", this["eventListener.Platform.onLockChecked"]);
        this.resetDots();
    }
    resetDots () {
        this.element.querySelectorAll(".locked-dots .locked-dot").forEach(function ( /** @type {HTMLElement} */ element) {
            element.classList.remove("active");
        });
    }
    /**
     * @param {string} key
     */
    onKey (key) {
        this.app.hideAllNotifications();
        if (this.passcode.length < 4) {
            this.passcode.push(key);
            this.element.querySelectorAll(".locked-dots .locked-dot")[this.passcode.length - 1].classList.add("active");
            if (this.passcode.length === 4) {
                setTimeout(function () {
                    if (!this.editMode && this.app.settings.get("passcode.passcode")) {
                        if (this.passcode.join("") === this.app.settings.get("passcode.passcode")) {
                            this.app.feedbackNotification(FEEDBACK_LIGHT);
                            this._resolve(this.passcode.join(""));
                        } else {
                            this.passcode = [];
                            this.resetDots();
                            this.app.showNotification({
                                text: __("error.wrongpasscode"),
                                type: NOTIFICATION_ERROR
                            });
                        }
                    } else {
                        this._resolve(this.passcode.join(""));
                    }
                }.bind(this), UI_PASSCODE_DELAY * 1000);
            }
        }
    }
    onDelete () {
        if (!this.passcode.length) {
            return;
        }
        this.passcode.pop();
        this.element.querySelectorAll(".locked-dots .locked-dot")[this.passcode.length].classList.remove("active");
    }
    onFaceId () {
        bridgeCallHandler("checkId")
            .then(function () {
                this.element.querySelectorAll(".locked-dots .locked-dot").forEach(function ( /** @type {HTMLElement} */ element) {
                    element.classList.add("active");
                });
                this.passcode = ["****"];
                this.app.feedbackNotification(FEEDBACK_LIGHT);
                setTimeout(function () {
                    this._resolve(this.passcode.join(""));
                }.bind(this), UI_PASSCODE_DELAY * 1000);
            }.bind(this))
            .catch(function () {
                this.passcode = [];
                this.resetDots();
                this.app.showNotification({
                    text: __("error.wrongfaceid"),
                    type: NOTIFICATION_ERROR
                });
            }.bind(this));
    }
}