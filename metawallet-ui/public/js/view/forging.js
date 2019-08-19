/**
 * @param {ViewConfig|{wallet: Wallet}} config
 * @constructor
 */
class ForgingView extends View {
    constructor (config) {
        config = Object.assign(config, {
            dataSelector: "view.forging",
        });
        super(config, config);
        View.apply(this, arguments);
        /** @type {Wallet} */
        this.wallet = config.wallet;
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
    }
    onStarted () {
        /** @type {HTMLElement|xD} */
        let walletBlockElement = this.element.querySelector(".wallet-forging-block");
        if (!this.wallet.privateKeyExists) {
            walletBlockElement.classList.add("desaturated");
        } else {
            walletBlockElement.classList.remove("desaturated");
        }
        this.element.qs("icon-img").src = this.wallet.getIcon();
        this.element.querySelector(".wallet-forging-block__title").innerHTML = this.wallet.getName();
        this.element.querySelector(".wallet-forging-block__address").innerHTML = BlockchainLib.hashCollapse(this.wallet.address);
        this.element.qs("actions.transfer").onclick = function () {
            showTransfer(this.app, this.wallet);
        }.bind(this);
        this.element.qs("actions.delegations").onclick = function () {
            this.app.pushView(new DelegationsView( /** @type {ViewConfig} */ {
                app: this.app,
                wallet: this.wallet
            }));
        }.bind(this);
        this.element.qs("actions.transactions").onclick = function () {
            this.app.prevView();
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
                type: NOTIFICATION_SUCCESS,
                feedback: FEEDBACK_LIGHT
            });
            e.clearSelection();
        }.bind(this));
        this["eventListener.Wallet.onRewardsTransactionsFetched"] = function (params) {
            if (params.wallet !== this.wallet) {
                return;
            }
            this.drawTransactionSubViews();
        }.bind(this);
        Events.addListener("Wallet.onRewardsTransactionsFetched", this["eventListener.Wallet.onRewardsTransactionsFetched"], this);
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
    }
    /**
     * @param {Event} e
     */
    onScroll (e) {
        let scrollTopCurrent = parseInt(e.target.scrollTop);
        this._walletTransactionsGradient.style.opacity = String((scrollTopCurrent >= 10) ? Math.min((scrollTopCurrent - 10) / 10, 1) : 0);
    }
    onShown () {
        this.wallet.getRewards();
    }
    onStopped () {
        Events.removeListener("Wallet.onRewardsTransactionsFetched", this["eventListener.Wallet.onRewardsTransactionsFetched"], this);
        this._walletTransactionsWrapper.removeEventListener("scroll", this.onScroll.bind(this), false);
        this.clearTransactionSubViews();
    }
    clearTransactionSubViews () {
        for (let transactionSubView of Object.values(this._transactionSubViews)) {
            transactionSubView.element.parentNode.removeChild(transactionSubView.element);
        }
        this._transactionSubViews = {};
    }
    drawTransactionSubViews () {
        this.clearTransactionSubViews();
        for (let transaction of this.wallet.getRewardsTransactionsSortedByBlockNumber()) {
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
    }
    /**
     * @param {Transaction} transaction
     * @return {TransactionSubView}
     */
    getTransactionSubView (transaction) {
        /** @type {HTMLElement} */
        let template = this._transactionTemplate.cloneNode(true);
        template.removeAttribute("data-selector");
        transaction.to = this.wallet.address;
        transaction.from = transaction.type;
        transaction._hide_time = true;
        transaction.direction = TRANSACTION_DIRECTION_IN;
        /** @type {TransactionSubView} */
        let transactionSubView = new TransactionSubView({
            app: this.app,
            element: template,
            transaction: transaction,
            wallet: this.wallet
        });
        transactionSubView.start();
        return transactionSubView;
    }
}