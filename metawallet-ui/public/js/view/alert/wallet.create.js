/**
 * @param {ViewConfig|{currencyId: number}} config
 * @constructor
 */
function WalletCreateAlertView (config) {
    config = Object.assign(config, {
        dataSelector: "view.alert.walletcreate",
        type: VIEW_ALERT,
        cssDisplayProp: "flex"
    });

    View.apply(this, arguments);

    /** @type {number} */
    this.currencyId = config.currencyId;

    /** @type {MetaHashWallet|EthereumWallet|BitcoinWallet} */
    this.blockchainWallet = BlockchainLib.getNewBlockchainWallet(this.currencyId);
}

extendFunction(WalletCreateAlertView, View);

WalletCreateAlertView.prototype.onStarted = function () {
    /** @type {HTMLElement|xD} */
    this.formElement = this.element.qs("form.walletcreate");
    this.formElement.reset();

    this.element.qs("actions.createwallet").onclick = function () {
        this.onCreateWalletClicked();
    }.bind(this);

    this.element.qs("actions.scanqrcode").onclick = function () {
        this.scanQRCode();
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
        this.app.showNotification({text: __("common.copied"), type: NOTIFICATION_SUCCESS, feedback: FEEDBACK_LIGHT});
        e.clearSelection();
    }.bind(this));
};

WalletCreateAlertView.prototype.scanQRCode = function () {
    /** @type {Wallet} */
    let wallet = Wallet.blankWallet({walletCollection: this.app.walletCollection}, this.currencyId);
    importPk(this.app, wallet)
        .then(function () {
            this.app.prevView();
            this._resolve(wallet);
        }.bind(this))
        .catch(function (/** @type {Object} */ data) {
            let error = data && data.error ? data.error : __("error.wrongqrcode");
            this.app.showNotification({text: error, type: NOTIFICATION_ERROR, hideTimeout: UI_ERROR_NOTIFICATION_LONG_TIMEOUT * 1000});
        }.bind(this));
};

WalletCreateAlertView.prototype.onCreateWalletClicked = function () {
    if (this.loader) {
        return;
    }

    let formData = getFormData(this.formElement);

    /** @type {HTMLElement|xD} */
    let passwordInput = this.formElement.querySelector("[name='password']");
    if (!formData["password"]) {
        this.app.showNotification({text: __("error.emptyfields"), type: NOTIFICATION_ERROR});
        passwordInput.classList.add(UI_FORM_INPUT_ERROR_CLASS);
        return;
    } else {
        passwordInput.classList.remove(UI_FORM_INPUT_ERROR_CLASS);
    }

    showLoader(this);

    /** @type {Wallet} */
    let wallet = Wallet.newWallet({walletCollection: this.app.walletCollection}, this.blockchainWallet, {currencyId: this.currencyId, name: formData.name, pkPassword: formData["password"]});
    wallet.addToMetaGate()
        .then(function () {
            hideLoader(this);
            this._resolve(wallet);
        }.bind(this))
        .catch(function () {
            hideLoader(this);
            this._reject();
        }.bind(this));

    /*
    console.log("address:", metawallet.views[2].wallet.metahashWallet.address);
    console.log("publicKey:", metawallet.views[2].wallet.metahashWallet.publicKey);
    console.log("publicKeyRaw:", metawallet.views[2].wallet.metahashWallet.publicKeyRaw);
    console.log("privateKey:", metawallet.views[2].wallet.metahashWallet.privateKey);
    console.log("privateKeyRaw:", metawallet.views[2].wallet.metahashWallet.privateKeyRaw);
    console.log("toPem:", metawallet.views[2].wallet.metahashWallet.toPEM());
    console.log("toEncryptedPem:", metawallet.views[2].wallet.metahashWallet.toEncryptedPEM("1"));
    console.log("password:", metawallet.views[2].wallet.privateKeyPassword);
    */
};
