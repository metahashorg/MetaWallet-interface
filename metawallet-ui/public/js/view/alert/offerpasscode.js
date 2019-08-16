/**
 * @param {ViewConfig} config
 * @constructor
 */
function OfferPasscodeAlertView (config) {
    config = Object.assign(config, {
        dataSelector: "view.alert.offerpasscode",
        type: VIEW_ALERT,
        cssDisplayProp: "flex"
    });

    View.apply(this, arguments);
}

extendFunction(OfferPasscodeAlertView, View);

OfferPasscodeAlertView.prototype.onStarted = function () {
    this.element.qs("action.yes").onclick = function () {
        this.app.settings.set("tutorial.offerpasscode", 1);

        this.app.pushView(new PasscodeAlertView(/** @type {ViewConfig} */ {app: this.app, title: "passcodemodalview.title.new"}), FLAGS_APP_PUSHVIEW_MODAL_SHOW | FLAGS_APP_PUSHVIEW_PAGE_FROM_ALERT)
            .then(function (/** @type {string} */ passcode) {
                console.log("+", passcode);
                this.app.prevView(FLAGS_APP_PUSHVIEW_MODAL_SHOW);

                /** @type {string} */
                this.__passcode = passcode;

                this.app.pushView(new PasscodeAlertView(/** @type {ViewConfig} */ {app: this.app, title: "passcodemodalview.title.repeat"}), FLAGS_APP_PUSHVIEW_MODAL_SHOW)
                    .then(function (/** @type {string} */ passcode) {
                        console.log("++", passcode);
                        this.app.prevView(FLAGS_APP_PUSHVIEW_MODAL_FADEIN | FLAGS_APP_PUSHVIEW_PAGE_FROM_ALERT);

                        if (this.__passcode !== passcode) {
                            this.app.showNotification({text: __("settings.passcode.error.donotmatch"), type: NOTIFICATION_ERROR, hideTimeout: UI_ERROR_NOTIFICATION_LONG_TIMEOUT * 1000});
                            return;
                        }

                        this.app.showNotification({text: __("settings.passcode.turnedon"), type: NOTIFICATION_SUCCESS});
                        this.app.settings.set("passcode.passcode", passcode);
                        this.app.prevView();
                    }.bind(this))
                    .catch(function () {
                        this.app.prevView(FLAGS_APP_PUSHVIEW_MODAL_SHOW | FLAGS_APP_PUSHVIEW_PAGE_FROM_ALERT);
                    }.bind(this));
            }.bind(this))
            .catch(function () {
                this.app.prevView(FLAGS_APP_PUSHVIEW_MODAL_SHOW | FLAGS_APP_PUSHVIEW_PAGE_FROM_ALERT);
            }.bind(this));

    }.bind(this);

    this.element.qs("action.no").onclick = function () {
        this.app.settings.set("tutorial.offerpasscode", 1);
        this.app.prevView();
    }.bind(this);
};
