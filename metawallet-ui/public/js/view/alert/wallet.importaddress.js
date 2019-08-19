/**
 * @param {ViewConfig|{wallet: Wallet, address: string}} config
 * @constructor
 */
class WalletImportAddressAlertView extends View {
    constructor (config) {
        config = Object.assign(config, {
            dataSelector: "view.alert.walletimportaddress",
            type: VIEW_ALERT,
            cssDisplayProp: "flex"
        });
        super(config, config);
        View.apply(this, arguments);
        /** @type {Wallet} */
        this.wallet = config.wallet;
        /** @type {string} */
        this.address = config.address;
    }
    onStarted () {
        this.element.qs("icon").src = this.wallet.getIcon();
        /** @type {HTMLElement|xD} */
        this.formElement = this.element.qs("form.walletimportaddress");
        this.formElement.reset();
        this.formElement.querySelectorAll("input").forEach(function ( /** @type {HTMLElement} */ element) {
            element.classList.remove(UI_FORM_INPUT_ERROR_CLASS);
        });
        this.element.qs("actions.importwallet").onclick = function () {
            this.onImportWalletClicked();
        }.bind(this);
    }
    onImportWalletClicked () {
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
    }
}
