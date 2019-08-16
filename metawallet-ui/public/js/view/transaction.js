/**
 * @param {ViewConfig|{wallet: Wallet, transaction: Transaction, transfer: Transfer}} config
 * @constructor
 */
function TransactionView (config) {
    config = Object.assign(config, {
        dataSelector: "view.alert.transaction",
        type: VIEW_ALERT_SLIDE,
    });

    View.apply(this, arguments);

    /** @type {Wallet} */
    this.wallet = config.wallet;

    /** @type {?Transaction} */
    this.transaction = config.transaction || null;

    /** @type {?Transfer} */
    this.transfer = config.transfer || null;
}

extendFunction(TransactionView, View);

TransactionView.prototype.onStarted = function () {
    if (!this.transaction/* && !this.transfer*/) {
        this.getTransaction();
    }
};

TransactionView.prototype.onStopped = function () {
    if (this.__getTransactionInt) {
        clearInterval(this.__getTransactionInt);
        delete this.__getTransactionInt;
    }
};

TransactionView.prototype.onShown = function () {
    this.update();
};

TransactionView.prototype.getTransaction = function () {
    this.__getTransactionInt = setInterval(function () {
        this.transfer.api.getTx({hash: this.transfer.transaction})
            .then(function (data) {

                // @info эфир
                if (typeof data.hash !== "undefined" && typeof data.transaction === "undefined"){
                    data.transaction = Object.assign({}, data);
                    data.transaction.transaction = data.hash;
                    data.transaction.value = data.value / 1e18;
                    // data.transaction.status = "ok";
                    // data.transaction.intStatus = 10;
                }

                if (data.transaction) {
                    clearInterval(this.__getTransactionInt);
                    delete this.__getTransactionInt;

                    this.transaction = new Transaction({walletCollection: this.app.walletCollection, wallet: this.wallet, transaction: data.transaction});
                    this.update();

                    // this.app.walletCollection.load(true);
                }
            }.bind(this))
            .catch(function (error) {
                console.log(error);
            }.bind(this));
    }.bind(this), 500);
};

TransactionView.prototype.update = function () {
    /** @type {Transaction|Transfer} */
    let t = this.transaction || this.transfer;

    this.element.qs("transaction.time").html(t.time ? timeToDateTime(t.time, true) : "");
    this.element.qs("transaction.type").html(t.getName ? t.getName() : "");

    this.element.qs("transaction.from.name").html("");
    this.element.qs("transaction.from.address").html(t.from);

    this.element.qs("transaction.to.name").html("");
    this.element.qs("transaction.to.address").html(t.to);

    this.element.qs("transaction.value").innerHTML =
        (t.type ? (t.direction === TRANSACTION_DIRECTION_IN ? "+" : (t.direction === TRANSACTION_DIRECTION_OUT ? "&ndash;" : "")) : "") +
        this.wallet.currency.getBalance(t.value).fullSimpleString;

    this.element.qs("transaction.value").classList.remove("color-green");
    this.element.qs("transaction.value").classList.remove("color-red");
    if (t.direction === TRANSACTION_DIRECTION_IN) {
        this.element.qs("transaction.value").classList.add("color-green");
    } else if (t.direction === TRANSACTION_DIRECTION_OUT) {
        this.element.qs("transaction.value").classList.add("color-red");
    }

    this.element.qs("transaction.data").html(t.data || "");

    this.element.qs("transaction.status").html(__("transactionview.status." + t.status));

    /** @type {HTMLElement|xD} */
    let animsElement = this.element.qs("transaction.status.anim");
    animsElement.hide();

    let buttonsElement = this.element.qs("transaction.status.buttons");
    buttonsElement.hide();

    // /** @type {HTMLElement|xD} */
    // let textsElement = this.element.qs("transaction.status.steps");
    // textsElement.hide();

    // @info добавить проверку на биткоин|эфир и показывать инфу о долгих транзакциях
    if (this.transaction) {
        buttonsElement.show();
        animsElement.hide();

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

        this.element.qs("actions.info").onclick = function () {
            bridgeCallHandler("openUrl", {url: EXPLORER_ENDPOINT_TX[this.wallet.currencyId] + this.transaction.hash});
        }.bind(this);
    }

    if (this.transfer && !this.transaction && [CURRENCY_ID_BTC, CURRENCY_ID_ETH].indexOf(this.wallet.currencyId) === -1) { // transaction in progress
        animsElement.show();
        // textsElement.show();

        animsElement.querySelector(".icon-loader-1").classList.remove("animation-stop", "animation-progress", "animation-complete");
        animsElement.querySelector(".icon-loader-2").classList.remove("animation-stop", "animation-progress", "animation-complete");
        animsElement.querySelector(".icon-loader-3").classList.remove("animation-stop", "animation-progress", "animation-complete");

        if (this.transaction && this.transaction.status === TRANSACTION_STATUS_DONE) {
            animsElement.querySelector(".icon-loader-1").classList.add("animation-complete");
            animsElement.querySelector(".icon-loader-2").classList.add("animation-complete");
            animsElement.querySelector(".icon-loader-3").classList.add("animation-complete");
        } else if (this.transfer) {
            animsElement.querySelector(".icon-loader-1").classList.add("animation-complete");
            animsElement.querySelector(".icon-loader-2").classList.add("animation-progress");
        }

        // this.element.qs("transaction.status.step1").querySelector(".transfer-story").classList.remove("transfer-story--success", "transfer-story--progress");
        // this.element.qs("transaction.status.step2").querySelector(".transfer-story").classList.remove("transfer-story--success", "transfer-story--progress");
        // this.element.qs("transaction.status.step3").querySelector(".transfer-story").classList.remove("transfer-story--success", "transfer-story--progress");
        // this.element.qs("transaction.status.step4").querySelector(".transfer-story").classList.remove("transfer-story--success", "transfer-story--progress");
        //
        // if (this.transaction && this.transaction.status === TRANSACTION_STATUS_DONE) {
        //     this.element.qs("transaction.status.step1").querySelector(".transfer-story").classList.add("transfer-story--success");
        //     this.element.qs("transaction.status.step2").querySelector(".transfer-story").classList.add("transfer-story--success");
        //     this.element.qs("transaction.status.step3").querySelector(".transfer-story").classList.add("transfer-story--success");
        //     this.element.qs("transaction.status.step4").querySelector(".transfer-story").classList.add("transfer-story--success");
        // } else if (this.transfer) {
        //     this.element.qs("transaction.status.step1").querySelector(".transfer-story").classList.add("transfer-story--success");
        //     this.element.qs("transaction.status.step2").querySelector(".transfer-story").classList.add("transfer-story--success");
        //     this.element.qs("transaction.status.step3").querySelector(".transfer-story").classList.add("transfer-story--progress");
        // }

    }
};

TransactionView.prototype.onRepeatClicked = function () {
    this._resolve(function () {
        this.app.prevView()
            .then(function () {
                /** @type {TransferParams} */
                let transferParams = {
                    to: this.transaction.to,
                    value: this.transaction.value,
                    data: this.transaction.data
                };
                showTransfer(this.app, this.transaction.wallet, null, transferParams);
            }.bind(this));
    }.bind(this));
};