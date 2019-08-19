/**
 * @param {ViewConfig|{metaPayUrl: string}} config
 * @constructor
 */
class MetaPayAlertView extends View {
    constructor (config) {
        config = Object.assign(config, {
            dataSelector: "view.alert.metapay",
            type: VIEW_ALERT,
            cssDisplayProp: "flex"
        });
        super(config, config);
        View.apply(this, arguments);
        this.metaPayParams = MetaHashLib.getMetapayParams(config.metaPayUrl);
        /** @type {Currency} */
        this.currency = new Currency({
            walletCollection: this.app.walletCollection,
            currency: this.metaPayParams.currencyId
        });
        /** @type {?Wallet} */
        this.wallet = null;
    }
    onStarted () {
        this.element.qs("metapay.to").value = BlockchainLib.hashCollapse(this.metaPayParams.to, 16);
        this.element.qs("metapay.value").value = this.currency.getBalance(this.metaPayParams.value).fullSimpleString;
        this.element.qs("metapay.date").value = (new Date).toLocaleDateString();
        this.element.qs("metapay.order").value = this.metaPayParams.data;
        this.element.qs("metapay.notes").value = this.metaPayParams.description;
        this.element.qs("metapay.vendorName").value = this.metaPayParams.vendorName;
        if (!this.metaPayParams.vendorKnown) {
            this.element.qs("metapay.vendorKnown").hide();
            this.element.qs("metapay.vendor").classList.remove("form-control-wrapper--state-left");
        }
        /** @type {HTMLElement|xD} */
        this.selectWalletElement = this.element.qs("action.selectwallet");
        /** @type {HTMLElement|xD} */
        this.errorElement = this.element.qs("error");
        this.element.qs("actions.continue").onclick = function () {
            this.onContinueClicked();
        }.bind(this);
        // autoselect last wallet
        let wallets = this.app.walletCollection.getWalletsSortedByTime(this.metaPayParams.currencyId);
        if (wallets.length) {
            this.onWalletsLoaded();
        } else {
            this["eventListener.WalletCollection.onLoaded"] = function () {
                Events.removeListener("WalletCollection.onLoaded", this["eventListener.WalletCollection.onLoaded"], this);
                this.onWalletsLoaded();
            }.bind(this);
            Events.addListener("WalletCollection.onLoaded", this["eventListener.WalletCollection.onLoaded"], this);
        }
    }
    /**
     * @param {string} error
     */
    showError (error) {
        this.errorElement.innerHTML = __("metapayalertview.error." + error);
        this.errorElement.show();
    }
    hideError () {
        this.errorElement.hide();
    }
    onWalletsLoaded () {
        // console.log(this.metaPayParams.currencyId, this.app.walletCollection.getWalletsSortedByTime(this.metaPayParams.currencyId));
        let wallets = this.app.walletCollection.getWalletsSortedByTime(this.metaPayParams.currencyId);
        if (wallets.length) {
            this.hideError();
            this.selectWalletElement.classList.remove("disabled");
            this.onWalletSelected(wallets[0]);
            this.selectWalletElement.onclick = function () {
                this.onWalletSelect();
            }.bind(this);
        } else {
            this.showError("nowallets");
            this.selectWalletElement.classList.add("disabled");
        }
    }
    onWalletSelect () {
        if (!this.app.walletCollection.getWalletsSortedByTime(this.metaPayParams.currencyId).length) {
            return;
        }
        this.app.alertView(new WalletSelectAlertView({
                app: this.app,
                currencyId: this.metaPayParams.currencyId,
                selectedAddress: this.wallet ? this.wallet.address : ""
            }))
            .then(function ( /** @type {Wallet} */ wallet) {
                this.onWalletSelected(wallet);
                this.app.prevView();
            }.bind(this))
            .catch(function () {
                this.app.prevView();
            }.bind(this));
    }
    /**
     * @param {Wallet} wallet
     */
    onWalletSelected (wallet) {
        this.wallet = wallet;
        this.element.qs("wallet.name").innerHTML = wallet.getName();
        this.element.qs("wallet.icon").src = wallet.getIcon();
        this.element.qs("wallet.balance").innerHTML = wallet.getBalance().fullSimpleString;
        if (wallet.balance < this.metaPayParams.value) {
            this.showError("notenoghfunds");
        } else {
            this.hideError();
        }
    }
    onContinueClicked () {
        if (this.wallet.balance < this.metaPayParams.value) {
            this.app.showNotification({
                text: __("error.notenoughfunds"),
                type: NOTIFICATION_ERROR,
                hideTimeout: UI_ERROR_NOTIFICATION_LONG_TIMEOUT * 1000
            });
            return;
        }
        if (!this.wallet.privateKeyExists) {
            this.app.showNotification({
                text: __("error.pknotfound"),
                type: NOTIFICATION_ERROR,
                hideTimeout: UI_ERROR_NOTIFICATION_LONG_TIMEOUT * 1000
            });
            return;
        }
        this.metaPayParams.type = PAYMENT_METAPAY;
        this._resolve({
            wallet: this.wallet,
            metaPayParams: this.metaPayParams
        });
    }
}
