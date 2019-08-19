/**
 * @param {ViewConfig|{wallet: Wallet, blockchainWallet: MetaHashWallet|EthereumWallet|BitcoinWallet}} config
 * @constructor
 */
class WalletImportDecryptedAlertView extends View {
    constructor (config) {
        config = Object.assign(config, {
            dataSelector: "view.alert.walletimportdecrypted",
            type: VIEW_ALERT,
            cssDisplayProp: "flex"
        });
        super(config, config);
        View.apply(this, arguments);
        /** @type {Wallet} */
        this.wallet = config.wallet;
        /** @type {MetaHashWallet|EthereumWallet|BitcoinWallet} */
        this.blockchainWallet = config.blockchainWallet;
    }
    onStarted () {
        this.element.qs("icon").src = this.wallet.getIcon();
        /** @type {HTMLElement|xD} */
        this.formElement = this.element.qs("form.walletimportdecrypted");
        this.formElement.reset();
        this.formElement.querySelectorAll("input").forEach(function ( /** @type {HTMLElement} */ element) {
            element.classList.remove(UI_FORM_INPUT_ERROR_CLASS);
        });
        this.formElement.querySelector("[name='name']").value = this.wallet.name || "";
        this.element.qs("actions.importwallet").onclick = function () {
            this.onImportWalletClicked();
        }.bind(this);
        this.element.qs("actions.generatepassword").onclick = function () {
            this.formElement.querySelector("[name='password']").value = generatePassword();
        }.bind(this);
        /** @type {ClipboardJS} */
        this._passwordClipboard = new ClipboardJS(this.element.qs("actions.copypassword"), {
            text: function () {
                return this.formElement.querySelector("[name='password']").value;
            }.bind(this)
        });
        this._passwordClipboard.on("success", function (e) {
            this.app.showNotification({
                text: __("common.copied"),
                type: NOTIFICATION_SUCCESS,
                feedback: FEEDBACK_LIGHT
            });
            e.clearSelection();
        }.bind(this));
    }
    onImportWalletClicked () {
        let formData = getFormData(this.formElement);
        /** @type {HTMLElement|xD} */
        let passwordInput = this.formElement.querySelector("[name='password']");
        if (!formData["password"]) {
            this.app.showNotification({
                text: __("error.emptyfields"),
                type: NOTIFICATION_ERROR
            });
            passwordInput.classList.add(UI_FORM_INPUT_ERROR_CLASS);
            return;
        } else {
            passwordInput.classList.remove(UI_FORM_INPUT_ERROR_CLASS);
        }
        this.wallet.address = this.blockchainWallet.address;
        this.wallet.name = formData.name || "";
        this.wallet.blockchainWallet = this.blockchainWallet;
        this.wallet.privateKeyExists = true;
        this.wallet.privateKeyPassword = formData["password"];
        this.wallet.addToMetaGate()
            .then(function () {
                this.wallet.blockchainWallet = null;
                this.wallet.privateKeyPassword = null;
                this._resolve();
            }.bind(this))
            .catch(function () {
                this._reject();
            }.bind(this));
    }
}