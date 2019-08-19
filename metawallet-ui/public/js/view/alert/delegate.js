/**
 * @param {ViewConfig|{metaPayUrl: string}} config
 * @constructor
 */
class DelegateAlertView extends View {
    constructor (config) {
        config = Object.assign(config, {
            dataSelector: "view.alert.metapay",
            type: VIEW_ALERT,
            cssDisplayProp: "flex",
            clone: true,
        });
        super(config, config);
        View.apply(this, arguments);
        /** @type {Node} */
        this.node = config.node;
        /** @type {number} */
        this.currencyId = config.currencyId;
        /** @type {?Wallet} */
        this.wallet = config.wallet || null;
        this.delegateParams = {
            type: PAYMENT_DELEGATE,
            to: config.node.address,
            data: "",
            value: "0",
            node: this.node,
            delegate: 0,
        };
    }
    onStarted () {
        this.element.querySelector(".page-nav-center").innerHTML = "Delegation";
        this.element.querySelector(".alert-title span").innerHTML = "Delegation Request";
        this.element.querySelector(".alert-title__hint").innerHTML = "Please check your delegation details before proceeding";
        xD(this.element.qs("metapay.date").parentElement).hide();
        xD(this.element.qs("metapay.notes").parentElement).hide();
        xD(this.element.qs("metapay.vendor").parentElement).hide();
        xD(this.element.qs("metapay.vendorName").parentElement).hide();
        xD(this.element.qs("metapay.vendorKnown").parentElement).hide();
        this.element.qs("metapay.to").value = BlockchainLib.hashCollapse(this.node.address);
        this.element.qs("metapay.value").removeAttribute("readonly");
        this.element.qs("metapay.order").value = escapeHtml(this.node.name);
        this.element.qs("metapay.order.title").innerHTML = "Node:";
        this.element.qs("metapay.to.title").innerHTML = "Address:";
        /** @type {HTMLElement|xD} */
        this.selectWalletElement = this.element.qs("action.selectwallet");
        /** @type {HTMLElement|xD} */
        this.errorElement = this.element.qs("error");
        this.element.qs("actions.continue").onclick = function () {
            this.onContinueClicked();
        }.bind(this);
        // this.element.qs("metapay.allavailable").onclick = function () {
        //     if (this.wallet){
        //         this.element.qs("metapay.value").value = this.wallet.balance / CURRENCY_COEFFICIENT[this.wallet.currencyId];
        //     }
        // }.bind(this);
        // autoselect last wallet
        let wallets = this.app.walletCollection.getWalletsSortedByTime(this.currencyId);
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
        let wallets = this.app.walletCollection.getWalletsSortedByTime(this.currencyId);
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
        if (!this.app.walletCollection.getWalletsSortedByTime(this.currencyId).length) {
            return;
        }
        this.app.alertView(new WalletSelectAlertView({
                app: this.app,
                currencyId: this.currencyId,
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
        if (wallet.balance < BALANCE_DELEGATION_MIN) {
            this.showError("notenoghfunds");
        } else {
            this.hideError();
        }
    }
    onContinueClicked () {
        if (!this.wallet.privateKeyExists) {
            this.app.showNotification({
                text: __("error.pknotfound"),
                type: NOTIFICATION_ERROR,
                hideTimeout: UI_ERROR_NOTIFICATION_LONG_TIMEOUT * 1000
            });
            return;
        }
        if (this.wallet.balance < BALANCE_DELEGATION_MIN) {
            this.app.showNotification({
                text: __("error.notenoughfunds"),
                type: NOTIFICATION_ERROR,
                hideTimeout: UI_ERROR_NOTIFICATION_LONG_TIMEOUT * 1000
            });
            return;
        }
        const delegate = this.element.qs("metapay.value").value * CURRENCY_COEFFICIENT[CURRENCY_ID_MHC];
        if (this.wallet.balance < delegate) {
            this.app.showNotification({
                text: __("error.notenoughfunds"),
                type: NOTIFICATION_ERROR,
                hideTimeout: UI_ERROR_NOTIFICATION_LONG_TIMEOUT * 1000
            });
            return;
        }
        this.delegateParams.delegate = delegate;
        this.delegateParams.data = MetaHashLib.makeDelegateData(delegate);
        this._resolve({
            wallet: this.wallet,
            metaPayParams: this.delegateParams
        });
    }
}