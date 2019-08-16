/**
 * @param {ViewConfig|{wallet: Wallet}} config
 * @constructor
 */
function WalletCreatedAlertView (config) {
    config = Object.assign(config, {
        dataSelector: "view.alert.walletcreated",
        type: VIEW_ALERT,
        cssDisplayProp: "flex"
    });

    View.apply(this, arguments);

    /** @type {Wallet} */
    this.wallet = config.wallet;
}

extendFunction(WalletCreatedAlertView, View);

WalletCreatedAlertView.prototype.onStarted = function () {
    this.element.qs("icon").src = this.wallet.getIcon();
    this.element.qs("name").html(this.wallet.name || this.wallet.currency.ticker);
    this.element.qs("address").html(this.wallet.address);
    this.element.qs("password").html(this.wallet.privateKeyPassword);

    this.element.qs("actions.savepk").onclick = function () {
        this.savePk();
    }.bind(this);

    this.element.qs("actions.saveqr").onclick = function () {
        this.saveQr();
    }.bind(this);

    /** @type {ClipboardJS} */
    this._addressClipboard = new ClipboardJS(this.element.qs("actions.copyaddress"), {
        text: function () {
            return this.wallet.address;
        }.bind(this)
    });
    this._addressClipboard.on("success", function (e) {
        this.app.showNotification({
            text: __("common.copied"),
            type: NOTIFICATION_SUCCESS
        });
        e.clearSelection();
    }.bind(this));

    /** @type {ClipboardJS} */
    this._passwordClipboard = new ClipboardJS(this.element.qs("actions.copypassword"), {
        text: function () {
            return this.wallet.privateKeyPassword;
        }.bind(this)
    });
    this._passwordClipboard.on("success", function (e) {
        this.app.showNotification({
            text: __("common.copied"),
            type: NOTIFICATION_SUCCESS
        });
        e.clearSelection();
    }.bind(this));

    /** @type {HTMLElement|xD|HTMLCanvasElement} */
    this.qrElement = this.element.qs("canvas");
};

WalletCreatedAlertView.prototype.onStopped = function () {
    this.wallet.blockchainWallet = null;
    this.wallet.privateKeyPassword = null;
};

WalletCreatedAlertView.prototype.savePk = function () {
    bridgeCallHandler("shareFile", {data: this.wallet.getEncryptedPkForNativeApp(), name: this.wallet.getFileName()})
        .then(function () {
            this.app.showNotification({text: __("success.success"), type: NOTIFICATION_SUCCESS});
        }.bind(this))
        .catch(function () {
            this.app.showNotification({text: __("error.error"), type: NOTIFICATION_ERROR});
        }.bind(this));
};

WalletCreatedAlertView.prototype.saveQr = function () {
    this.qr = new QRious({
        element: this.qrElement,
        value: qrBefore(this.wallet.privateKey),
        size: 226
    });

    bridgeCallHandler("shareImage", {data: this.qrElement.toDataURL()})
        .then(function () {
            this.app.showNotification({text: __("success.success"), type: NOTIFICATION_SUCCESS});
        }.bind(this))
        .catch(function () {
            this.app.showNotification({text: __("error.error"), type: NOTIFICATION_ERROR});
        }.bind(this));
};