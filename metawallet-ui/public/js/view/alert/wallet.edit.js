/**
 * @param {ViewConfig|{currencyId: number}} config
 * @constructor
 */
function WalletEditAlertView (config) {
    config = Object.assign(config, {
        dataSelector: "view.alert.walletedit",
        type: VIEW_ALERT,
        cssDisplayProp: "flex"
    });

    View.apply(this, arguments);

    /** @type {Wallet} */
    this.wallet = config.wallet;
}

extendFunction(WalletEditAlertView, View);

WalletEditAlertView.prototype.onStarted = function () {
    this.element.qs("icon-img").src = this.wallet.getIcon();
    this.element.qs("name").value = this.wallet.getName();

    this.element.qs("save").onclick = function () {
        let nameElement = this.element.qs("name");
        const newName = nameElement.value;

        if (newName.trim() === ""){
            this.app.showNotification({text: __("error.emptyfields"), type: NOTIFICATION_ERROR});
            nameElement.classList.add(UI_FORM_INPUT_ERROR_CLASS);
            return;
        } else {
            nameElement.classList.remove(UI_FORM_INPUT_ERROR_CLASS);
        }

        this.wallet.rename(newName)
            .then(function () {
                this._resolve({name: newName});
            }.bind(this))
            .catch(function () {
                this.app.showNotification({text: __( "error.wrongname" ), type: NOTIFICATION_WARNING});
                this._reject();
            }.bind(this));
    }.bind(this);

    this.element.qs("delete").onclick = function () {
        this.app.showNotification({text: __( "error.notavailable" ), type: NOTIFICATION_WARNING});
    }.bind(this);
};