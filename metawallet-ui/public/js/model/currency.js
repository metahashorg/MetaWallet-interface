/**
 * @param {{
 *     walletCollection: WalletCollection,
 *     currency: string|number
 * }} config
 * @constructor
 */
class Currency {
    constructor (config) {
        // console.log("+Currency", config);
        /**
         * @type {Object}
         * @private
         */
        this._config = config;
        /** @type {WalletCollection} */
        this.walletCollection = config.walletCollection;
        /** @type {Currency} */
        this.baseCurrency = this.walletCollection.baseCurrency;
        this.id = parseInt(config.currency);
        /** @type {string} */
        this.code = CURRENCY_CODES[config.currency];
        /** @type {string} */
        this.ticker = this.id === CURRENCY_ID_MHC ? "#" + this.code.toUpperCase() : this.code.toUpperCase();
        /** @type {number} */
        this.decimals = CURRENCY_DECIMALS[config.currency];
        /** @type {number} */
        this.balance = 0;
        /** @type {number} */
        this.wallets = 0;
        /** @type {number} */
        this.tokens = 0;
    }
    init () {
        this.baseCurrency = this.walletCollection.baseCurrency;
        this.balance = 0;
    }
    /**
     * @param {number=} value
     * @return {Balance}
     */
    getBalance (value) {
        value = typeof value === "undefined" ? this.balance : value;
        return Currency.getBalance(value, this);
    }
    /**
     * @param {number=} value
     * @return {number}
     */
    getValue (value) {
        return Currency.getValue(value, this);
    }
    /**
     * @return {{rate: number, recalc: number}}
     */
    getBaseCurrencyRecalc () {
        /** @type {number} */
        let rate = this.id === 1 ? 0 : this.walletCollection.getRate(this.walletCollection.baseCurrency.id, this.id);
        let recalc = {
            rate: rate,
            recalc: this.balance / Math.pow(10, this.decimals) * rate
        };
        if (recalc.recalc < 1 / Math.pow(10, this.decimals)) {
            recalc.recalc = 0;
        }
        return recalc;
    }
    /**
     * @param {number} value
     * @param {Currency} currency
     * @return {Balance}
     */
    static getBalance (value, currency) {
        const realValue = value / CURRENCY_COEFFICIENT[currency.id];
        const realValueChunk = String(realValue).split(".");
        const integer = parseInt(realValueChunk[0]);
        try {
            let balance = {
                balance: realValue,
                integer: integer,
                integerLocaleString: integer.toLocaleString("en", {
                    maximumFractionDigits: CURRENCY_MAX_DECIMALS[currency.id]
                }),
                decimal: realValueChunk.length === 1 ? "0" : String(realValueChunk[1]),
                localeString: realValue.toLocaleString("en", {
                    maximumFractionDigits: CURRENCY_MAX_DECIMALS[currency.id]
                }),
            };
            let decimalString = balance.decimal.length === currency.decimals ?
                String(balance.decimal) :
                balance.decimal + "0".repeat(Math.max(0, currency.decimals - balance.decimal.length));
            // 0.100000
            balance.decimal = decimalString;
            balance.simpleString = balance.localeString;
            balance.fullSimpleString = balance.localeString + " " + currency.ticker;
            return balance;
        } catch (error) {
            console.log("getBalance:error", error);
        }
    }
    /**
     * @param {number} value
     * @param {Currency} currency
     * @return {number}
     */
    static getValue (value, currency) {
        return value * Math.pow(10, currency.decimals);
    }
}