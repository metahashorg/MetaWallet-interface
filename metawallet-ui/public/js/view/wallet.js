/**
 * @param {ViewConfig|{wallet: Wallet}} config
 * @constructor
 */
function WalletView (config) {
    config = Object.assign(config, {
        dataSelector: "view.wallet",
        clone: true
    });

    config.tasks = [
        new Task({
            view: this, interval: WALLET_UPDATE_INTERVAL[config.wallet.currencyId], callback: function (/** @type {View} */ view, /** @type {Task} */ task) {
                view.wallet.fetchBalance(true);
            }.bind(null, this)
        })
    ];

    View.apply(this, arguments);

    /** @type {Wallet} */
    this.wallet = config.wallet;
}

extendFunction(WalletView, View);

WalletView.prototype.onStarted = function () {
    this["eventListener.Wallet.onBalanceFetched"] = function (/** @type {Object<{wallet: Wallet}>} */ params) {
        if (params.wallet !== this.wallet) {
            return;
        }
        this._pullToRefresh.hideAnim();
        this.update();
    }.bind(this);
    Events.addListener("Wallet.onBalanceFetched", this["eventListener.Wallet.onBalanceFetched"], this);

    this["eventListener.Wallet.onTransactionsFetched"] = function (/** @type {Object<{wallet: Wallet}>} */ params) {
        if (params.wallet !== this.wallet) {
            return;
        }
        this.drawTransactionSubViews();
        this._pullToRefresh.hideAnim();
    }.bind(this);
    Events.addListener("Wallet.onTransactionsFetched", this["eventListener.Wallet.onTransactionsFetched"], this);

    this["eventListener.Wallet.onMoreTransactionsFetched"] = function (/** @type {Object<{wallet: Wallet, transactions: Array<Transaction>}>} */ params) {
        if (params.wallet !== this.wallet) {
            return;
        }
        this.__bottomCallback--;
        this.drawTransactionSubViews(params.transactions, "append");
    }.bind(this);
    Events.addListener("Wallet.onMoreTransactionsFetched", this["eventListener.Wallet.onMoreTransactionsFetched"], this);

    this["eventListener.Wallet.onRefreshedTransactionsFetched"] = function (/** @type {Object<{wallet: Wallet, transactions: Array<Transaction>}>} */ params) {
        if (params.wallet !== this.wallet) {
            return;
        }
        console.log("eventListener.Wallet.onRefreshedTransactionsFetched", params);
        this.drawTransactionSubViews(params.transactions, "prepend");
    }.bind(this);
    Events.addListener("Wallet.onRefreshedTransactionsFetched", this["eventListener.Wallet.onRefreshedTransactionsFetched"], this);

    /** @type {WalletCardSubView} */
    this.walletCardSubView = new WalletCardSubView({app: this.app, element: this.element.qs("subview.walletcard"), wallet: this.wallet});
    this.walletCardSubView.start();
    this.walletCardSubView.show();

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
        selector: this.element.querySelector(".home-transaction-list-wrapper"),
        // showGradient: true,
        spinnerTop: 347,
        topCallback: function () {
            // this.app.walletCollection.load(true);
            this.wallet.fetchBalance(true);
        }.bind(this),
        bottomCallback: function () {
            if (this.__bottomCallback) {
                return;
            }
            if (this.wallet.fetchTransactions()) {
                this.__bottomCallback = this.__bottomCallback ? this.__bottomCallback + 1 : 1;
            }
        }.bind(this),
        callbackTimeout: 1000,
        fixBounce: {
            pageElement: this.element.querySelector(".page-inner"),
            outerElement: this.element.querySelector(".home-transaction-list-wrapper"),
            innerElement: this._transactionsWrapper
        }
    });

    this.element.qs("actions.transfer").bind("click", function () {
        showTransfer(this.app, this.wallet);
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

    this.element.qs("actions.qr").bind("click", function () {
        this.app.alertView(new QrCodeAlertView(/** @type {ViewConfig} */ {app: this.app, wallet: this.wallet}));
    }.bind(this), this.app);

    if (this.wallet.currency.id === CURRENCY_ID_MHC){
        this.element.qs("actions.forging").show();
        this.element.qs("actions.forging").bind("click", function () {
            this.app.pushView(new ForgingView(/** @type {ViewConfig} */ {app: this.app, wallet: this.wallet}));
        }.bind(this), this.app);
    } else {
        this.element.qs("actions.forging").hide();
    }

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

    /** @type {HTMLElement|xD} */
    this.element.qs("actions.editwallet").bind("click", function () {
        this.editWallet();
    }.bind(this), this.app);

    this.update();
    this.drawTransactionSubViews();

    makeDraggable(this.element, ".wallet-block-wrapper", ".wallet-block", ".undercard-menu", null, 0.1);
    makeDraggable(this.element, ".wallet-block-wrapper", ".undercard-menu", ".wallet-block", null, 0.1);

    /**
     * @type {HTMLElement|xD}
     * @private
     */
    this._walletTransactionsWrapper = xD(this.element.qs("transactions-wrapper"));

    /**
     * @type {HTMLElement|xD}
     * @private
     */
    this._walletTransactionsGradient = xD(this.element.qs("transactions-wrapper-gradient"));

    this._walletTransactionsWrapper.addEventListener("scroll", this.onScroll.bind(this), false);
};

/**
 * @param {Event} e
 */
WalletView.prototype.onScroll = function (e) {
    let scrollTopCurrent = parseInt(e.target.scrollTop);
    this._walletTransactionsGradient.style.opacity = String((scrollTopCurrent >= 10) ? Math.min((scrollTopCurrent - 10) / 10, 1) : 0);
};

WalletView.prototype.onStopped = function () {
    Events.removeListener("Wallet.onBalanceFetched", this["eventListener.Wallet.onBalanceFetched"], this);
    Events.removeListener("Wallet.onTransactionsFetched", this["eventListener.Wallet.onTransactionsFetched"], this);
    Events.removeListener("Wallet.onMoreTransactionsFetched", this["eventListener.Wallet.onMoreTransactionsFetched"], this);
    Events.removeListener("Wallet.onRefreshedTransactionsFetched", this["eventListener.Wallet.onRefreshedTransactionsFetched"], this);
    this._walletTransactionsWrapper.removeEventListener("scroll", this.onScroll.bind(this), false);

    this._pullToRefresh.remove();
    // this.clearTransactionSubViews();

    this.walletCardSubView.stop();
};

WalletView.prototype.onShown = function () {
    this.update();
    this._pullToRefresh.fixBounce();

    if (this.wallet.blockchainWallet) { // we got here from new wallet creation process
        this.app.alertView(new WalletCreatedAlertView({app: this.app, wallet: this.wallet}));
    }

    this.walletCardSubView.show();
};

WalletView.prototype.onBeforeHidden = function () {
    // this._pullToRefresh.resetScroll(); // need to do it here because when DIV is "display: none" scroll can not be adjusted
};

WalletView.prototype.update = function () {
    /** @type {HTMLElement|xD} */
    this.walletBlockElement = xD(this.element.querySelector(".wallet-block"));
    if (!this.wallet.privateKeyExists) {
        this.walletBlockElement.parentElement.classList.add("desaturated");
        this.actionImportPkElement.show();
        this.actionSavePkElement.hide();
    } else {
        this.walletBlockElement.parentElement.classList.remove("desaturated");
        this.actionImportPkElement.hide();
        this.actionSavePkElement.show();
    }

    this.walletCardSubView.update();
};

WalletView.prototype.clearTransactionSubViews = function () {
    for (let transactionSubView of Object.values(this._transactionSubViews)) {
        transactionSubView.element.parentNode.removeChild(transactionSubView.element);
    }
    this._transactionSubViews = {};
};

/**
 * @param {Array<Transaction>=} transactions
 * @param {string=} action
 */
WalletView.prototype.drawTransactionSubViews = function (transactions, action) {
    if (!transactions) {
        this.clearTransactionSubViews();
        transactions = this.wallet.transactions;
    }

    for (let transaction of transactions) {
        /** @type {TransactionSubView} */
        let transactionSubView;
        if (!this._transactionSubViews[transaction.hash]) {
            transactionSubView = this.getTransactionSubView(transaction);
            this._transactionSubViews[transaction.hash] = transactionSubView;
            if (action === "prepend") {
                this._transactionsWrapper.insertBefore(transactionSubView.element, shift(this._transactionSubViews).element);
            } else {
                this._transactionsWrapper.appendChild(transactionSubView.element);
            }
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

    this._pullToRefresh.fixBounce();
};

/**
 * @param {Transaction} transaction
 * @return {TransactionSubView}
 */
WalletView.prototype.getTransactionSubView = function (transaction) {
    /** @type {HTMLElement} */
    let template = this._transactionTemplate.cloneNode(true);
    template.removeAttribute("data-selector");

    /** @type {TransactionSubView} */
    let transactionSubView = new TransactionSubView({app: this.app, element: template, transaction: transaction, wallet: this.wallet});
    transactionSubView.start();

    return transactionSubView;
};

WalletView.prototype.onImportPrivateKeyClicked = function () {
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

// WalletView.prototype.onTransferClicked = function () {
//     if (this.wallet.privateKeyExists) {
//         this.app.pushView(new TransferView(/** @type {ViewConfig} */ {app: this.app, wallet: this.wallet}))
//             .then(function (/** @type {Transfer} */ transfer) {
//                 this.app.prevView()
//                     .then(function () {
//                         this.app.alertView(new TransactionView(/** @type {ViewConfig} */ {app: this.app, wallet: this.wallet, transfer: transfer}));
//                     }.bind(this));
//             }.bind(this))
//             .catch(function () {
//             });
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

WalletView.prototype.savePk = function () {
    bridgeCallHandler("shareFile", {data: this.wallet.privateKey, name: this.wallet.getFileName()})
        .then(function () {
            this.app.showNotification({text: __("success.success"), type: NOTIFICATION_SUCCESS});
        }.bind(this))
        .catch(function () {
            this.app.showNotification({text: __("error.error"), type: NOTIFICATION_ERROR});
        }.bind(this));
};

WalletView.prototype.editWallet = function () {
    this.app.alertView(new WalletEditAlertView(/** @type {ViewConfig} */ {app: this.app, wallet: this.wallet}))
        .then(function () {
            this.app.prevView();
            this.update();
            this.app.showNotification({text: __("common.saved"), type: NOTIFICATION_SUCCESS});
        }.bind(this))
        .catch(function () {
        }.bind(this));
};