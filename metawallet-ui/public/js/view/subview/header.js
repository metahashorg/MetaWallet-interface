/**
 * @param {ViewConfig} config
 * @constructor
 */
function HeaderSubView (config) {
    config = Object.assign(config, {
        type: VIEW_SUBVIEW
    });

    View.apply(this, arguments);
}

extendFunction(HeaderSubView, View);

HeaderSubView.prototype.onStarted = function () {
    // console.log("HeaderSubView.onStarted");

    this.initBaseParamsButtons();
};

HeaderSubView.prototype.update = function () {
    let mhcCurrency = this.app.walletCollection.mhcCurrency;
    let baseCurrency = this.app.walletCollection.baseCurrency;

    let amountMhc = 0;
    for (let currencyName in this.app.walletCollection.currencies) {
        if (!this.app.walletCollection.currencies.hasOwnProperty(currencyName)) {
            continue;
        }
        if (currencyName !== CURRENCY_CODES[CURRENCY_ID_MHC]) {
            continue;
        }
        if (DEV_CURRENCIES.indexOf(currencyName) !== -1) {
            continue;
        }

        /** @type {Currency} */
        let currency = this.app.walletCollection.currencies[currencyName];

        let rateMhc = this.app.walletCollection.getRate(mhcCurrency.id, currency.id);
        amountMhc += rateMhc * currency.balance;
    }

    let mhcBalance = mhcCurrency.getBalance(amountMhc);

    let rateBaseCurrency = this.app.walletCollection.getRate(baseCurrency.id, mhcCurrency.id);
    let amountBaseCurrency = formatNum(rateBaseCurrency * (amountMhc / CURRENCY_COEFFICIENT[CURRENCY_ID_MHC]), baseCurrency.decimals);

    this.element.querySelector(".home-header-stats .js--currency-amount").innerHTML = mhcBalance.integerLocaleString;
    this.element.querySelector(".home-header-stats .currency-amount-small").innerHTML = String(mhcBalance.decimal);
    this.element.querySelector(".home-header-stats .currency-amount-smaller").innerHTML = mhcCurrency.ticker;
    this.element.querySelector(".home-header-value").innerHTML = amountBaseCurrency + " " + baseCurrency.ticker;

    this.element.querySelector(".home-graph-params-value .js--rate").innerHTML = formatNum(rateBaseCurrency, -2);
    let rateDiffElement = this.element.querySelector(".home-graph-params-value .js--rate--diff");
    rateDiffElement.classList.remove("color-green");
    rateDiffElement.classList.remove("color-red");
    let rateDiff = this.app.walletCollection.history[mhcCurrency.code] ? this.app.walletCollection.history[mhcCurrency.code].diffPercent : 0;
    if (rateDiff > 0) {
        rateDiffElement.classList.add("color-green");
        rateDiff = "+" + formatNum(rateDiff * 100, 2) + "%";
        rateDiffElement.innerHTML = rateDiff;
    } else if (rateDiff < 0) {
        rateDiffElement.classList.add("color-red");
        rateDiff = formatNum(rateDiff * 100, 2) + "%";
        rateDiffElement.innerHTML = rateDiff;
    } else {
        rateDiffElement.innerHTML = "";
    }

    if (this.app.walletCollection.history[this.app.walletCollection.mhcCurrency.code]) {
        drawChart(this.app.walletCollection.history[this.app.walletCollection.mhcCurrency.code].data, this.element.querySelector(".home-graph-divider"), false);
    }
};

HeaderSubView.prototype.initBaseParamsButtons = function () {
    // console.log("HeaderSubView.initBaseParamsButtons");

    this.element.querySelectorAll(".btn-sort-small").forEach(function (/** @type {HTMLElement} */ btnElement) {
        let param = btnElement.getAttribute("data-param");
        btnElement.querySelector(".btn-sort-small-value").innerHTML = __("wallets.settings.base." + param + "." + this.app.settings.get("base." + param));
        btnElement.onclick = function () {
            this.removeActiveClass();

            /** @type {HTMLElement|xD} */
            let paramValuesElement = xD(this.element.querySelector(".home-graph-params-sort-select[data-param=" + param + "]"));
            if (paramValuesElement.isHidden()) {
                this.element.querySelectorAll(".home-graph-params-sort-select").forEach(function (/** @type {HTMLElement} */ element) {
                    xD(element).hide();
                });
                paramValuesElement.show("flex");
                paramValuesElement.querySelectorAll("[data-param-value]").forEach(function (/** @type {HTMLElement} */ element) {
                    if (element.getAttribute("data-param-value") === String(this.app.settings.get("base." + param))) {
                        element.classList.add("active");
                    } else {
                        element.classList.remove("active");
                    }
                    element.onclick = function () {
                        let value = element.getAttribute("data-param-value");
                        if (param === "currency") {
                            value = parseInt(value);
                        }
                        this.app.settings.set("base." + param, value);
                        btnElement.querySelector(".btn-sort-small-value").innerHTML = __("wallets.settings.base." + param + "." + this.app.settings.get("base." + param));
                        paramValuesElement.hide();
                        this.removeActiveClass();
                    }.bind(this);
                }.bind(this));
                btnElement.classList.add("active");
            } else {
                paramValuesElement.hide();
            }
        }.bind(this);
    }.bind(this));
};

HeaderSubView.prototype.removeActiveClass = function () {
    this.element.querySelectorAll(".btn-sort-small").forEach(function (/** @type {HTMLElement} */ element) {
        element.classList.remove("active");
    });
};