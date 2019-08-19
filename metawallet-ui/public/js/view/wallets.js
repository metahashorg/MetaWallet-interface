/**
 * @param {ViewConfig|{currencyId: number}} config
 * @constructor
 */
class WalletsView extends View {
    constructor (config) {
        config = Object.assign(config, {
            dataSelector: "view.wallets",
            clone: true
        });
        super(config, config);
        View.apply(this, arguments);
        /** @type {number} */
        this.currencyId = config.currencyId;
    }
    onStarted () {
        this["eventListener.WalletCollection.onLoaded"] = function () {
            this.drawWalletSubViews();
            // this.drawTransactionSubViews();
            this.headerSubView.update();
            this._pullToRefresh.hideAnim();
            this._pullToRefresh2.hideAnim();
        }.bind(this);
        Events.addListener("WalletCollection.onLoaded", this["eventListener.WalletCollection.onLoaded"], this);
        this["eventListener.WalletCollection.onTransactionsLoaded"] = function () {
            this.drawTransactionSubViews();
        }.bind(this);
        Events.addListener("WalletCollection.onTransactionsLoaded", this["eventListener.WalletCollection.onTransactionsLoaded"], this);
        this["eventListener.Wallet.onMoreTransactionsFetched"] = function ( /** @type {Object<{wallet: Wallet, transactions: Array<Transaction>}>} */ params) {
            if (params.wallet.currencyId !== this.currencyId) {
                return;
            }
            this.__bottomCallback--;
            this.drawTransactionSubViews(params.transactions);
        }.bind(this);
        Events.addListener("Wallet.onMoreTransactionsFetched", this["eventListener.Wallet.onMoreTransactionsFetched"], this);
        /**
         * @type {HTMLElement|xD}
         * @private
         */
        this._walletsWrapper = xD(this.element.qs("wallets"));
        /**
         * @type {HTMLElement|xD}
         * @private
         */
        this._walletTemplate = xD(this.element.qs("wallets.template"));
        /**
         * @type {Object<string, WalletSubView>}
         * @private
         */
        this._walletSubViews = {};
        /**
         * @type {HTMLElement|xD}
         * @private
         */
        this._newWalletBlock = xD(this.element.qs("wallets.add"));
        /**
         * @type {HTMLElement|xD}
         * @private
         */
        this._transactionsWrapper = xD(this.element.qs("transactions"));
        /**
         * @type {HTMLElement|xD}
         * @private
         */
        this._transactionTemplate = xD(this.element.qs("subview.transaction"));
        /**
         * @type {Object<string, TransactionSubView>}
         * @private
         */
        this._transactionSubViews = {};
        /** @type {HTMLElement|xD} */
        this.noTransactionsPlaceholderElement = this.element.qs("placeholder.notransactions");
        /**
         * @type {PullToRefresh}
         * @private
         */
        this._pullToRefresh = new PullToRefresh({
            app: this.app,
            selector: this.element.querySelector(".home-wallet-list-wrapper"),
            spinnerTop: 277,
            topCallback: function () {
                this.app.walletCollection.load(true);
            }.bind(this),
            callbackTimeout: 1000,
            fixBounce: {
                pageElement: this.element.querySelector(".page-inner"),
                outerElement: this.element.querySelector(".home-wallet-list-wrapper"),
                innerElement: this._walletsWrapper
            }
        });
        /**
         * @type {PullToRefresh}
         * @private
         */
        this._pullToRefresh2 = new PullToRefresh({
            app: this.app,
            selector: this.element.querySelector(".home-transaction-list-wrapper"),
            // showGradient: true,
            spinnerTop: 277,
            topCallback: function () {
                this.app.walletCollection.load(true);
            }.bind(this),
            bottomCallback: function () {
                if (this.__bottomCallback) {
                    return;
                }
                this.app.walletCollection.getWalletsSortedByTime(this.currencyId).forEach(function ( /** @type {Wallet} */ wallet) {
                    if (this.app.settings.get("wallets.show") === WALLETS_SHOW_NATIVE && !wallet.nativeWallet) {
                        return;
                    }
                    if (wallet.fetchTransactions()) {
                        this.__bottomCallback = this.__bottomCallback ? this.__bottomCallback + 1 : 1;
                    }
                }.bind(this));
            }.bind(this),
            callbackTimeout: 1000,
            fixBounce: {
                pageElement: this.element.querySelector(".page-inner"),
                outerElement: this.element.querySelector(".home-transaction-list-wrapper"),
                innerElement: this._transactionsWrapper
            }
        });
        this.initTabs();
        this.drawWalletSubViews();
        // this.drawTransactionSubViews();
        /** @type {HeaderSubView} */
        this.headerSubView = new HeaderSubView( /** @type {ViewConfig} */ {
            app: this.app,
            element: this.element.qs("header"),
            view: this.view
        });
        this.headerSubView.start();
        this.headerSubView.show();
        /** Wallet create */
        this._newWalletBlock.onclick = function () {
            this.onCreateWalletClicked();
        }.bind(this);
    }
    onStopped () {
        Events.removeListener("WalletCollection.onLoaded", this["eventListener.WalletCollection.onLoaded"], this);
        Events.removeListener("WalletCollection.onTransactionsLoaded", this["eventListener.WalletCollection.onTransactionsLoaded"], this);
        Events.removeListener("Wallet.onMoreTransactionsFetched", this["eventListener.Wallet.onMoreTransactionsFetched"], this);
        // this.clearWalletSubViews();
        this._pullToRefresh.remove();
        // this.clearTransactionSubViews();
        this._pullToRefresh2.remove();
    }
    onShown () {
        this.headerSubView.update();
        this.updateWalletSubViews();
        this._pullToRefresh.fixBounce();
        this.drawTransactionSubViews();
        this._pullToRefresh2.fixBounce();
    }
    onBeforeHidden () {
        // this._pullToRefresh.resetScroll(); // need to do it here because when DIV is "display: none" scroll can not be adjusted
        // this._pullToRefresh2.resetScroll();
    }
    initTabs () {
        /** @type {Object<number, TabConfig>} */
        let tabs = {};
        tabs[WalletsView.TAB_WALLETS] = {
            id: WalletsView.TAB_CURRENCIES,
            callback: function () {
                this._pullToRefresh.fixBounce();
            }.bind(this)
        };
        tabs[WalletsView.TAB_TRANSACTIONS] = {
            id: WalletsView.TAB_TRANSACTIONS,
            callback: function () {
                this._pullToRefresh2.fixBounce();
            }.bind(this)
        };
        /** @type {TabsSubView} */
        this.tabsSubView = new TabsSubView({
            app: this.app,
            element: this.element,
            tabs: tabs
        });
        this.tabsSubView.start();
        this.tabsSubView.show();
    }
    // Wallets Tab
    clearWalletSubViews () {
        for (let walletSubView of Object.values(this._walletSubViews)) {
            walletSubView.element.parentNode.removeChild(walletSubView.element);
        }
        this._walletSubViews = {};
    }
    drawWalletSubViews () {
        this.clearWalletSubViews();
        this.app.walletCollection.getWalletsSortedByTime(this.currencyId).forEach(function ( /** @type {Wallet} */ wallet) {
            if (this.app.settings.get("wallets.show") === WALLETS_SHOW_NATIVE && !wallet.nativeWallet) {
                return;
            }
            /** @type {WalletSubView} */
            let walletSubView;
            if (!this._walletSubViews[wallet.address]) {
                walletSubView = this.getWalletSubView(wallet);
                this._walletSubViews[wallet.address] = walletSubView;
                this._walletsWrapper.insertBefore(walletSubView.element, this._newWalletBlock);
            } else {
                walletSubView = this._walletSubViews[wallet.address];
            }
            walletSubView.show();
            walletSubView.update(); // need redraw charts after element added to DOM
        }.bind(this));
        this._pullToRefresh.fixBounce();
    }
    updateWalletSubViews () {
        Object.values(this._walletSubViews).forEach(function ( /** @type {WalletSubView} */ walletSubView) {
            walletSubView.update();
        });
    }
    /**
     * @param {Wallet} wallet
     * @return {WalletSubView}
     */
    getWalletSubView (wallet) {
        /** @type {HTMLElement} */
        let template = this._walletTemplate.cloneNode(true);
        template.removeAttribute("data-selector");
        /** @type {WalletSubView} */
        let walletSubView = new WalletSubView({
            app: this.app,
            element: template,
            wallet: wallet
        });
        walletSubView.start();
        return walletSubView;
    }
    // Latest Transactions Tab
    clearTransactionSubViews () {
        for (let transactionSubView of Object.values(this._transactionSubViews)) {
            transactionSubView.element.parentNode.removeChild(transactionSubView.element);
        }
        this._transactionSubViews = {};
    }
    /**
     * @param {Array<Transaction>=} transactions
     */
    drawTransactionSubViews (transactions) {
        if (!transactions) {
            this.clearTransactionSubViews();
            transactions = this.app.walletCollection.getTransactionsSortedByTime(this.currencyId);
        }
        for (let transaction of transactions) {
            /** @type {TransactionSubView} */
            let transactionSubView;
            if (!this._transactionSubViews[transaction.hash]) {
                transactionSubView = this.getTransactionSubView(transaction);
                this._transactionSubViews[transaction.hash] = transactionSubView;
                this._transactionsWrapper.appendChild(transactionSubView.element);
            } else {
                transactionSubView = this._transactionSubViews[transaction.hash];
            }
            transactionSubView.show();
            transactionSubView.update(); // need redraw charts after element added to DOM
        }
        if (!transactions.length) {
            this.noTransactionsPlaceholderElement.show();
        } else {
            this.noTransactionsPlaceholderElement.hide();
        }
        this._pullToRefresh2.fixBounce();
    }
    /**
     * @param {Transaction} transaction
     * @return {TransactionSubView}
     */
    getTransactionSubView (transaction) {
        /** @type {HTMLElement} */
        let template = this._transactionTemplate.cloneNode(true);
        template.removeAttribute("data-selector");
        /** @type {TransactionSubView} */
        let transactionSubView = new TransactionSubView({
            app: this.app,
            element: template,
            transaction: transaction,
            currencyId: this.currencyId
        });
        transactionSubView.start();
        return transactionSubView;
    }
    onCreateWalletClicked () {
        this.app.alertView(new WalletCreateAlertView( /** @type {ViewConfig} */ {
                app: this.app,
                currencyId: this.currencyId
            }))
            .then(function ( /** @type {Wallet} */ wallet) {
                this.app.walletCollection.load(true);
                this.app.prevView()
                    .then(function () {
                        this.app.pushView(new WalletView( /** @type {ViewConfig} */ {
                            app: this.app,
                            wallet: wallet
                        }));
                    }.bind(this));
            }.bind(this))
            .catch(function () {}.bind(this));
    }
}


WalletsView.TAB_WALLETS = 1;
WalletsView.TAB_TRANSACTIONS = 2;
WalletsView.TABS = [WalletsView.TAB_WALLETS, WalletsView.TAB_TRANSACTIONS];