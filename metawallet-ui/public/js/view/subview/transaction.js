/**
 * @param {ViewConfig|{transaction: Transaction, wallet: Wallet=, currencyId: number=}} config
 * @constructor
 */
function TransactionSubView (config) {
    config = Object.assign(config, {
        type: VIEW_SUBVIEW
    });

    View.apply(this, arguments);

    /** @type {Transaction} */
    this.transaction = config.transaction;

    /** @type {?Wallet} */
    this.wallet = config.wallet || null;

    /** @type {number} */
    this.currencyId = this.wallet ? this.wallet.currencyId : config.currencyId || null;
}

extendFunction(TransactionSubView, View);

TransactionSubView.prototype.onStarted = function () {

    makeDraggable(this.element, ".transactions-log", ".transactions-log-card", ".undercard-menu", ".home-transaction-list-wrapper", 0.1);
    makeDraggable(this.element, ".transactions-log", ".undercard-menu", ".transactions-log-card", ".home-transaction-list-wrapper", 0.1);

    xD(this.element.querySelector(".transactions-log-card")).bind("click", function (/** @type {MouseEvent|TouchEvent} */ event) {
        this.app.alertView(new TransactionView(/** @type {ViewConfig} */ {app: this.app, wallet: this.transaction.wallet, transaction: this.transaction}))
            .then(function (callback) {
                callback();
            });
    }.bind(this), this.app);

    /** @type {HTMLElement|xD} */
    this.actionRepeatElement = this.element.qs("actions.repeat");
    if (this.transaction.direction === TRANSACTION_DIRECTION_OUT) {
        this.actionRepeatElement.show("flex");
        this.actionRepeatElement.onclick = function () {
            this.onRepeatClicked();
        }.bind(this);
    } else {
        this.actionRepeatElement.hide();
    }

    /** @type {ClipboardJS} */
    this._addressClipboard = new ClipboardJS(this.element.qs("actions.copyhash"), {
        text: function () {
            return this.transaction.hash;
        }.bind(this)
    });
    this._addressClipboard.on("success", function (e) {
        this.app.showNotification({text: __("common.copied"), type: NOTIFICATION_SUCCESS, feedback: FEEDBACK_LIGHT});
        e.clearSelection();
    }.bind(this));

    this.element.qs("actions.info").bind("click", function () {
        bridgeCallHandler("openUrl", {url: EXPLORER_ENDPOINT_TX[this.currencyId] + this.transaction.hash});
    }.bind(this), this.app);
};

TransactionSubView.prototype.update = function () {
    this.element.querySelector(".transactions-logs-date").innerHTML = timeToDateTime(this.transaction.time, true, this.transaction._hide_time);

    /** @type {string} */
    let from = this.transaction.wallet && this.transaction.direction === TRANSACTION_DIRECTION_OUT ? this.transaction.wallet.getName() : (HashDictionary.get(this.currencyId, this.transaction.from) || this.transaction.from);
    this.element.querySelector(".transactions-logs-info-wallet").innerHTML = from.length <= 20
        ? from
        : BlockchainLib.hashCollapse(from, 10);

    /** @type {string} */
    let to = this.transaction.wallet && this.transaction.direction === TRANSACTION_DIRECTION_IN ? this.transaction.wallet.getName() : (HashDictionary.get(this.currencyId, this.transaction.to) || this.transaction.to);
    this.element.querySelector(".transactions-logs-info-address").innerHTML = to.length <= 20
        ? to
        : BlockchainLib.hashCollapse(to, 10);

    /** @type {number} */
    let direction = this.wallet
        ? (this.transaction.to === this.wallet.address
            ? TRANSACTION_DIRECTION_IN
            : (this.transaction.from === this.wallet.address ? TRANSACTION_DIRECTION_OUT : TRANSACTION_DIRECTION_UNKNOWN))
        : 0;

    /** @type {HTMLElement} */
    let valueElement = this.element.querySelector(".transactions-logs-value");
    valueElement.innerHTML =
        (direction === TRANSACTION_DIRECTION_IN ? "+" : (direction === TRANSACTION_DIRECTION_OUT ? "&ndash;" : ""))
        + this.transaction.getBalance().fullSimpleString;

    if (direction === TRANSACTION_DIRECTION_IN) {
        valueElement.classList.add("color-green");
    } else if (direction === TRANSACTION_DIRECTION_OUT) {
        valueElement.classList.add("color-red");
    }
};

TransactionSubView.prototype.onRepeatClicked = function () {
    /** @type {TransferParams} */
    let transferParams = {
        to: this.transaction.to,
        value: this.transaction.value,
        data: this.transaction.data
    };
    showTransfer(this.app, this.transaction.wallet, null, transferParams);
};