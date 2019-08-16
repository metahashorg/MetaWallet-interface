/**
 * @param {ViewConfig|{wallet: Wallet, address: string}} config
 * @constructor
 */
function WalletImportAddressAlertView (config) {
    config = Object.assign(config, {
        dataSelector: "view.alert.walletimportaddress",
        type: VIEW_ALERT,
        cssDisplayProp: "flex"
    });

    View.apply(this, arguments);

    /** @type {Wallet} */
    this.wallet = config.wallet;

    /** @type {string} */
    this.address = config.address;
}

extendFunction(WalletImportAddressAlertView, View);

WalletImportAddressAlertView.prototype.onStarted = function () {
    this.element.qs("icon").src = this.wallet.getIcon();

    /** @type {HTMLElement|xD} */
    this.formElement = this.element.qs("form.walletimportaddress");
    this.formElement.reset();
    this.formElement.querySelectorAll("input").forEach(function (/** @type {HTMLElement} */ element) {
        element.classList.remove(UI_FORM_INPUT_ERROR_CLASS);
    });

    this.element.qs("actions.importwallet").onclick = function () {
        this.onImportWalletClicked();
    }.bind(this);
};

WalletImportAddressAlertView.prototype.onImportWalletClicked = function () {
    let formData = getFormData(this.formElement);

    this.wallet.name = formData.name || "";
    this.wallet.address = this.address;

    this.wallet.addToNativeApp()
        .then(function () {
            this._resolve();
        }.bind(this))
        .catch(function () {
            this._reject();
        }.bind(this));
};
