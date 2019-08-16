/**
 * @param {ViewConfig|{wallet: Wallet}} config
 * @constructor
 */
function WalletSubView (config) {
    config = Object.assign(config, {
        type: VIEW_SUBVIEW
    });

    View.apply(this, arguments);

    /** @type {Wallet} */
    this.wallet = config.wallet;
}

extendFunction(WalletSubView, View);

WalletSubView.prototype.onStarted = function () {
    this["eventListener.WalletCollection.onLoaded"] = function () {
        this.update();
    }.bind(this);
    Events.addListener("WalletCollection.onLoaded", this["eventListener.WalletCollection.onLoaded"], this);

    makeDraggable(this.element, ".wallet-card-wrapper", ".wallet-card", ".undercard-menu", ".home-wallet-list-wrapper", 0.1);
    makeDraggable(this.element, ".wallet-card-wrapper", ".undercard-menu", ".wallet-card", ".home-wallet-list-wrapper", 0.1);

    xD(this.element.querySelector(".wallet-card")).bind("click", function (/** @type {MouseEvent} */ event) {
        this.app.pushView(new WalletView(/** @type {ViewConfig} */ {app: this.app, wallet: this.wallet}));
    }.bind(this), this.app);

    /** @type {HTMLElement|xD} */
    this.actionImportPkElement = this.element.qs("actions.importpk");
    this.actionImportPkElement.bind("click", function () {
        this.onImportPrivateKeyClicked();
    }.bind(this), this.app);

    /** @type {HTMLElement|xD} */
    this.actionSavePkElement = this.element.qs("actions.savepk");
    this.actionSavePkElement.bind("click", function () {
        this.savePk();
    }.bind(this), this.app);

    this.element.qs("actions.transfer").bind("click", function () {
        showTransfer(this.app, this.wallet);
    }.bind(this), this.app);

    this.element.qs("actions.qr").bind("click", function () {
        this.app.alertView(new QrCodeAlertView(/** @type {ViewConfig} */ {app: this.app, wallet: this.wallet}));
    }.bind(this), this.app);

    /** @type {ClipboardJS} */
    this._addressClipboard = new ClipboardJS(this.element.qs("actions.copyaddress"), {
        text: function () {
            return this.wallet.address;
        }.bind(this)
    });
    this._addressClipboard.on("success", function (e) {
        this.app.showNotification({text: __("common.copied"), type: NOTIFICATION_SUCCESS, feedback: FEEDBACK_LIGHT});
        e.clearSelection();
    }.bind(this));
};

WalletSubView.prototype.onStopped = function () {
    Events.removeListener("WalletCollection.onLoaded", this["eventListener.WalletCollection.onLoaded"], this);
};

WalletSubView.prototype.update = function () {
    // console.log("WalletSubView.update");

    if (!this.wallet.privateKeyExists) {
        this.element.classList.add("desaturated");
        this.actionImportPkElement.show();
        this.actionSavePkElement.hide();
    } else {
        this.element.classList.remove("desaturated");
        this.actionImportPkElement.hide();
    }

    this.element.querySelector(".wallet-currency i").classList.add("icon-" + this.wallet.currency.code);
    if (this.wallet.name && this.wallet.name.length > 0) {
        this.element.querySelector(".wallet-title").innerHTML = this.wallet.getName();
    } else {
        this.element.querySelector(".wallet-title").classList.add("wallet-title--empty");
    }

    this.element.querySelector(".wallet-icon img").src = MetaHashLib.addressIcon(this.wallet.address);

    this.element.querySelector(".wallet-address").innerHTML = this.wallet.address.length <= 20
        ? this.wallet.address
        : BlockchainLib.hashCollapse(this.wallet.address);

    this.element.querySelector(".js--wallet-amount").innerHTML = this.wallet.getBalance().integerLocaleString;
    this.element.querySelector(".wallet-amount-small").innerHTML = "." + this.wallet.getBalance().decimal;
    this.element.querySelector(".wallet-amount-smaller").innerHTML = this.wallet.currency.ticker;

    this.element.querySelector(".wallet-amount-recalc").innerHTML = formatNum(this.wallet.getBaseCurrencyRecalc().recalc, -2) + " " + this.app.walletCollection.baseCurrency.ticker;
};

// WalletSubView.prototype.onTransferClicked = function () {
//     if (this.wallet.privateKeyExists) {
//         this.app.pushView(new TransferView(/** @type {ViewConfig} */ {app: this.app, wallet: this.wallet}));
//     } else {
//         this.app.alertView(new NoPkAlertView(/** @type {ViewConfig} */ {app: this.app, wallet: this.wallet}))
//             .then(function () {
//                 this.app.prevView()
//                     .then(function () {
//                         this.onTransferClicked();
//                     }.bind(this));
//             }.bind(this))
//             .catch(function () {
//                 this.app.prevView();
//             }.bind(this));
//     }
// };

WalletSubView.prototype.onImportPrivateKeyClicked = function () {
    importPk(this.app, this.wallet)
        .then(function () {
            this.app.prevView();
            this.app.showNotification({text: __("success.imported"), type: NOTIFICATION_SUCCESS});
            this.update();
        }.bind(this))
        .catch(function (/** @type {Object} */ data) {
            let error = data && data.error ? data.error : __("error.wrongqrcode");
            this.app.showNotification({text: error, type: NOTIFICATION_ERROR, hideTimeout: UI_ERROR_NOTIFICATION_LONG_TIMEOUT * 1000});
        }.bind(this));
};

WalletSubView.prototype.savePk = function () {
    bridgeCallHandler("shareFile", {data: this.wallet.privateKey, name: this.wallet.getFileName()})
        .then(function () {
            this.app.showNotification({text: __("success.success"), type: NOTIFICATION_SUCCESS});
        }.bind(this))
        .catch(function () {
            this.app.showNotification({text: __("error.error"), type: NOTIFICATION_ERROR});
        }.bind(this));
};