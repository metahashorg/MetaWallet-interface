/**
 * @param {ViewConfig|{wallet: Wallet, encryptedWallet: string}} config
 * @constructor
 */
class WalletImportEncryptedAlertView extends View {
    constructor (config) {
        config = Object.assign(config, {
            dataSelector: "view.alert.walletimportencrypted",
            type: VIEW_ALERT,
            cssDisplayProp: "flex"
        });
        super(config, config);
        View.apply(this, arguments);
        /** @type {Wallet} */
        this.wallet = config.wallet;
        /** @type {string} */
        this.encryptedWallet = config.encryptedWallet;
    }
    onStarted () {
        /** @type {HTMLElement|xD} */
        this.formElement = this.element.qs("form.walletimportencrypted");
        this.formElement.reset();
        this.formElement.querySelectorAll("input").forEach(function ( /** @type {HTMLElement} */ element) {
            element.classList.remove(UI_FORM_INPUT_ERROR_CLASS);
        });
        this.formElement.querySelector("[name='name']").value = this.wallet.name;
        /** @type {HTMLElement|xD} */
        this.actionImportElement = this.element.qs("actions.importwallet");
        this.actionImportElement.onclick = function () {
            this.onImportWalletClicked();
        }.bind(this);
    }
    onImportWalletClicked () {
        if (this.loader) {
            return;
        }
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
        // this.loader = null;
        // if ([CURRENCY_ID_ETH, CURRENCY_ID_BTC].indexOf(this.wallet.currencyId) !== -1) {
        //     this.loader = this.app.showNotification({text: __("common.pleasewait"), type: NOTIFICATION_LOADING, hideTimeout: UI_ERROR_NOTIFICATION_NO_TIMEOUT});
        //     this.disallowPrev();
        // }
        showLoader(this);
        let cryptoWorker = new Worker("/js/worker/crypto.js");
        cryptoWorker.onmessage = function ( /** @type {MessageEvent} */ event) {
            console.log("<- worker:", event.data);
            cryptoWorker.terminate();
            if (!event.data.result) {
                hideLoader(this);
                this.app.showNotification({
                    text: __("error.wrongpassword"),
                    type: NOTIFICATION_ERROR,
                    hideTimeout: UI_ERROR_NOTIFICATION_LONG_TIMEOUT * 1000
                });
                passwordInput.classList.add(UI_FORM_INPUT_ERROR_CLASS);
                return;
            }
            /** @type {MetaHashWallet|EthereumWallet|BitcoinWallet} */
            let blockchainWallet = BlockchainLib.fromPrivateKey(this.wallet.currencyId, event.data.privateKey);
            if (this.wallet.address && blockchainWallet.address !== this.wallet.address) {
                hideLoader(this);
                this._reject();
                return;
            }
            this.wallet.name = formData.name || "";
            this.wallet.blockchainWallet = blockchainWallet;
            this.wallet.address = blockchainWallet.address;
            this.wallet.privateKeyExists = true;
            this.wallet.privateKeyPassword = formData["password"];
            this.wallet.addToMetaGate()
                .then(function () {
                    hideLoader(this);
                    this.wallet.blockchainWallet = null;
                    this.wallet.privateKeyPassword = null;
                    this._resolve();
                }.bind(this))
                .catch(function () {
                    hideLoader(this);
                    this._reject();
                }.bind(this));
        }.bind(this);
        cryptoWorker.postMessage({
            currencyId: this.wallet.currencyId,
            encryptedWallet: this.encryptedWallet,
            password: formData["password"]
        });
    }
}