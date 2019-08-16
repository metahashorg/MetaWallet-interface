/**
 * @param {ViewConfig|{currency: Currency}} config
 * @constructor
 */
function CurrencySubView (config) {
    config = Object.assign(config, {
        type: VIEW_SUBVIEW
    });

    View.apply(this, arguments);

    /** @type {Currency} */
    this.currency = config.currency;
}

extendFunction(CurrencySubView, View);

CurrencySubView.prototype.onStarted = function () {
    if (CURRENCY_DISABLED.includes(this.currency.id)) {
        this.element.classList.add("desaturated");
    }

    xD(this.element.querySelector(".currency-card")).bind("click", function () {
        if (CURRENCY_DISABLED.includes(this.currency.id)) {
            this.app.showNotification({text: __("error.notavailable"), type: NOTIFICATION_WARNING, hideTimeout: UI_ERROR_NOTIFICATION_LONG_TIMEOUT * 1000});
        } else {
            console.log("CurrencySubView", "click");
            this.app.pushView(new WalletsView( /** @type {ViewConfig} */ {
                app: this.app,
                currencyId: this.currency.id
            }));
        }
    }.bind(this), this.app);
};

CurrencySubView.prototype.update = function () {
    // console.log("CurrencySubView.update");

    this.element.querySelector(".currency-logo i").classList.add("icon-" + this.currency.code);
    this.element.querySelector(".currency-stats--wallets b").innerHTML = String(this.currency.wallets);
    // this.element.querySelector(".currency-stats--tokens b").innerHTML = String(this.currency.tokens);

    this.element.querySelector(".js--currency-amount").innerHTML = this.currency.getBalance().integerLocaleString;
    this.element.querySelector(".currency-amount-small").innerHTML = "." + this.currency.getBalance().decimal.substr(0, 2);
    this.element.querySelector(".currency-amount-smaller").innerHTML = this.currency.ticker;

    this.element.querySelector(".currency-amount-recalc").innerHTML = formatNum(this.currency.getBaseCurrencyRecalc().recalc, -2) + " " + this.app.walletCollection.baseCurrency.ticker;
    this.element.querySelector(".js--currency-rate").innerHTML = formatNum(this.currency.getBaseCurrencyRecalc().rate, -2) + " " + this.app.walletCollection.baseCurrency.ticker;

    if (this.app.walletCollection.history[this.currency.code]) {
        drawChart(this.app.walletCollection.history[this.currency.code].data, this.element.querySelector(".currency-graph"), false, CURRENCY_DISABLED.includes(this.currency.id));
    }
};