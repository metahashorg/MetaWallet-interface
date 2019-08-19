/**
 * @param {ViewConfig|{wallet: Wallet}} config
 * @constructor
 */
class NoPkAlertView extends View {
    constructor (config) {
        config = Object.assign(config, {
            dataSelector: "view.alert.nopk",
            type: VIEW_ALERT,
            cssDisplayProp: "flex"
        });
        super(config, config);
        View.apply(this, arguments);
        /** @type {Wallet} */
        this.wallet = config.wallet;
    }
    onStarted () {
        this.element.qs("actions.import").onclick = function () {
            importPk(this.app, this.wallet)
                .then(function () {
                    this.app.prevView();
                    this._resolve();
                }.bind(this))
                .catch(function () {
                    this.app.prevView();
                    this.app.showNotification({
                        text: __("error.wrongqrcode"),
                        type: NOTIFICATION_ERROR
                    });
                }.bind(this));
        }.bind(this);
        this.element.qs("actions.cancel").onclick = function () {
            this._reject();
        }.bind(this);
    }
}