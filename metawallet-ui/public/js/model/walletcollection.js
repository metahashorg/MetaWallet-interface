/**
 * @param {{
 *     app: MetaWallet
 * }} config
 * @constructor
 */
class WalletCollection {
    constructor (config) {
        /**
         * @type {Object}
         * @private
         */
        this._config = config;
        /** @type {MetaWallet} */
        this.app = config.app;
        /** @type {Object<string, NativeWallet>} */
        this.nativeWallets = {};
        /** @type {Object<string, Wallet>} */
        this.wallets = {};
        /**
         * @type {number}
         * @private
         */
        this._walletsLoaded = 0;
        /**
         * @type {number}
         * @private
         */
        this._walletTransactionsLoaded = 0;
        /**
         * Total balance for each currency type
         * @type {Object<string, Currency>}
         */
        this.currencies = {};
        /** @type {Currency} */
        this.baseCurrency = new Currency({
            walletCollection: this,
            currency: this.app.settings.get("base.currency")
        });
        /** @type {Currency} */
        this.mhcCurrency = new Currency({
            walletCollection: this,
            currency: CURRENCY_ID_MHC
        });
        /**
         * Assets conversion rates
         * @type {Object<string, number>}
         */
        this.rates = {};
        /**
         * Assets rates history
         * @type {Object<string, Object<{data: Array<number>, first: number, last: number, diff: number, diffPercent: number, low: number, high: number}>>}
         */
        this.history = {};
        /**
         * @type {number}
         * @private
         */
        this._time = 0;
        /**
         * @type Ethereum.API
         */
        this.etheriumApi = new Ethereum.API("https://cloudflare-eth.com/");
        setInterval(function () {
            this.loadRates();
        }.bind(this), DEFAULT_RATE_PERIOD);
        this.loadRates();
        this.loadRatesHistory();
        Events.addListener("Settings.set.base.period", function () {
            this.loadRatesHistory();
        }, this);
        Events.addListener("Settings.set.base.currency", function () {
            this.baseCurrency = new Currency({
                walletCollection: this,
                currency: this.app.settings.get("base.currency")
            });
            this.loadRatesHistory();
        }, this);
    }
    /**
     * @return {Promise<*>}
     */
    initNativeWallets () {
        return new Promise(function (resolve, reject) {
            bridgeCallHandler("getWallets", {
                    email: this.app.user.email
                })
                .then(function (data) {
                    let nativeWallets = JSON.parse(data);
                    nativeWallets.forEach(function ( /** @type {NativeWallet} */ nativeWallet) {
                        this.nativeWallets[nativeWallet.address] = nativeWallet;
                    }.bind(this));
                    resolve();
                }.bind(this))
                .catch(function () {
                    reject();
                });
        }.bind(this));
    }
    /**
     * Load assets rates
     * @todo переписать на metagate.js
     */
    loadRates () {
        apiXhr(getJsonRpcXhrParams("currency.stat", {
                params: [{
                    type: "last"
                }]
            }))
            .then(function (response) {
                if (response.result === API_OK) {
                    this.rates = {};
                    this.rates[DEFAULT_BASE_CURRENCY + "-" + DEFAULT_BASE_CURRENCY] = 1;
                    // response.data holds rates of assets to USD (DEFAULT_BASE_CURRENCY)
                    for (let i in response.data) {
                        if (!response.data.hasOwnProperty(i)) {
                            continue;
                        }
                        let rate = response.data[i];
                        let code = DEFAULT_BASE_CURRENCY + "-" + rate.id;
                        this.rates[code] = rate.id === CURRENCY_ID_TMH ? 0 : parseFloat(rate.val);
                    }
                    Events.trigger("WalletCollection.onRatesLoaded");
                }
            }.bind(this));
    }
    /**
     * Get exchange rate (what amount of baseCurrency is equal to 1.00 of currency)
     * @param {number} baseCurrency
     * @param {number} currency
     * @return {number}
     */
    getRate (baseCurrency, currency) {
        // console.log("WalletCollection.getRate", baseCurrency, currency);
        if (baseCurrency === currency) {
            return 1;
        }
        let rate1 = this.rates[DEFAULT_BASE_CURRENCY + "-" + baseCurrency];
        let rate2 = this.rates[DEFAULT_BASE_CURRENCY + "-" + currency];
        return rate2 / rate1;
    }
    /**
     * Load assets rates history
     *
     * @todo переписать на metagate.js
     */
    loadRatesHistory () {
        let time = {
            day: "time24",
            week: "week",
            month: "month",
        } [this.app.settings.get("base.period")];
        if (!time) {
            return;
        }
        this.loadRates();
        apiXhr(getJsonRpcXhrParams("currency.stat", {
                params: [{
                    type: time
                }]
            }))
            .then(function (response) {
                if (response.result === API_OK) {
                    this.history = {};

                    function getRateByTimestamp (data, timestamp) {
                        for (let rate of data) {
                            if (rate.ts === timestamp) {
                                return parseFloat(rate.val);
                            }
                        }
                    }
                    for (let currencyId in response.data) {
                        if (!response.data.hasOwnProperty(currencyId)) {
                            continue;
                        }
                        currencyId = parseInt(currencyId);
                        if (CURRENCY_ID_TMH === currencyId) {
                            continue;
                        }
                        let history = {
                            data: [],
                            first: 0,
                            last: 0,
                            diff: 0,
                            diffPercent: 0,
                            low: 0,
                            high: 0
                        };
                        for (let rate of response.data[currencyId]) {
                            // rate holds exchnage rates of MHC to other assets
                            let val = this.baseCurrency.id === CURRENCY_ID_MHC && [CURRENCY_ID_MHC, CURRENCY_ID_TMH].indexOf(currencyId) !== -1 ? 1 : {
                                1000: parseFloat(rate.val),
                                1: 0,
                                2: parseFloat(rate.to_btc),
                                3: parseFloat(rate.to_eth),
                                4: 1 / parseFloat(rate.val) * getRateByTimestamp(response.data[CURRENCY_ID_MHC], rate.ts)
                            } [this.baseCurrency.id];
                            history.data.push(val);
                        }
                        history.high = Math.max.apply(null, history.data);
                        history.low = Math.min.apply(null, history.data);
                        history.first = history.data[0];
                        history.last = history.data[history.data.length - 1];
                        history.diff = history.last - history.first;
                        history.diffPercent = history.last / history.first - 1;
                        this.history[CURRENCY_CODES[currencyId]] = history;
                    }
                    Events.trigger("WalletCollection.onRatesHistoryLoaded");
                }
            }.bind(this));
    }
    /**
     * Load wallets
     * @param {boolean=} forceLoad
     * @return {boolean}
     * @todo переписать на metagate.js
     */
    load (forceLoad) {
        forceLoad = typeof forceLoad !== "undefined" ? forceLoad : false;
        if (!forceLoad && this._time > Date.now() - WALLETCOLLECTION_RELOAD_TIME * 1000) {
            Events.trigger("WalletCollection.onLoaded");
            return false;
        }
        this.initNativeWallets()
            .then(function () {
                this._walletsLoaded = 0;
                this._walletTransactionsLoaded = 0;
                this.loadRates();
                apiXhr(getJsonRpcXhrParams("address.list", {
                        token: this.app.user.token
                    }))
                    .then(function (response) {
                        if (response.result === API_OK) {
                            this._time = Date.now();
                            let sortedData = response.data.map(function (data) {
                                let pos = {};
                                pos[CURRENCY_ID_MHC] = 1;
                                pos[CURRENCY_ID_BTC] = 2;
                                pos[CURRENCY_ID_ETH] = 3;
                                pos[CURRENCY_ID_TMH] = 99;
                                data["_pos"] = pos[parseInt(data["currency"])];
                                data["currency"] = parseInt(data["currency"]);
                                return data;
                            });
                            sortedData.sort((a, b) => a["_pos"] - b["_pos"]);
                            // init wallets from MetaGate
                            let adresses = [];
                            sortedData.forEach(function ( /** @type {MetaGateWallet} */ metagateWallet) {
                                if (adresses.indexOf(metagateWallet.address) !== -1) {
                                    return;
                                }
                                adresses.push(metagateWallet.address);
                                if (!this.currencies[metagateWallet.currency]) {
                                    this.currencies[CURRENCY_CODES[metagateWallet.currency]] = new Currency({
                                        walletCollection: this,
                                        currency: metagateWallet.currency
                                    });
                                } else {
                                    this.currencies[metagateWallet.currency].init();
                                }
                                if (!this.wallets[metagateWallet.address]) {
                                    // this.wallets[metagateWallet.address] = new Wallet({walletCollection: this}, metagateWallet, (this.nativeWallets[metagateWallet.address] || null));
                                    this.wallets[metagateWallet.address] = this.nativeWallets[metagateWallet.address] ?
                                        Wallet.fromMetaGateAndNativeWallets({
                                            walletCollection: this
                                        }, metagateWallet, this.nativeWallets[metagateWallet.address]) :
                                        Wallet.fromMetaGateWallet({
                                            walletCollection: this
                                        }, metagateWallet);
                                } else {
                                    this.wallets[metagateWallet.address].init(metagateWallet);
                                }
                            }.bind(this));
                            // init wallets from Native App if they were not found in MetaGate
                            for (let address in this.nativeWallets) {
                                if (!this.nativeWallets.hasOwnProperty(address)) {
                                    continue;
                                }
                                if (!this.wallets[address]) {
                                    // this.wallets[address] = new Wallet({walletCollection: this}, null, this.nativeWallets[address]);
                                    this.wallets[address] = Wallet.fromNativeWallet({
                                        walletCollection: this
                                    }, this.nativeWallets[address]);
                                }
                            }
                            for (let currencyId of CURRENCIES) {
                                if (currencyId !== DEFAULT_BASE_CURRENCY && !this.currencies[CURRENCY_CODES[currencyId]]) {
                                    let currency = new Currency({
                                        walletCollection: this,
                                        currency: currencyId
                                    });
                                    this.currencies[currency.code] = currency;
                                }
                            }
                            if (!len(this.wallets)) {
                                Events.trigger("WalletCollection.onLoaded");
                            }
                        }
                    }.bind(this));
            }.bind(this))
            .catch(function (e) {
                console.log("WalletCollection.load", e.message);
            }.bind(this));
        return true;
    }
    /**
     * @param {Wallet} wallet
     */
    onWalletLoaded (wallet) {
        // this.currencies[wallet.currency.code].balance += wallet.balance;
        // this.currencies[wallet.currency.code].tokens += wallet.tokens;
        // this.currencies[wallet.currency.code].wallets++;
        this.currencies[wallet.currency.code].balance = 0;
        this.currencies[wallet.currency.code].tokens = 0;
        this.currencies[wallet.currency.code].wallets = 0;
        Object.values(this.wallets).forEach(function ( /** @type {Wallet} */ currencyWallet) {
            if (wallet.currency.code !== currencyWallet.currency.code) {
                return;
            }
            this.currencies[wallet.currency.code].balance += currencyWallet.balance;
            this.currencies[wallet.currency.code].tokens += currencyWallet.tokens;
            this.currencies[wallet.currency.code].wallets++;
        }.bind(this));
        this._walletsLoaded++;
        if (this._walletsLoaded === len(this.wallets)) {
            Events.trigger("WalletCollection.onLoaded");
        }
    }
    onTransactionsLoaded () {
        this._walletTransactionsLoaded++;
        if (this._walletTransactionsLoaded === len(this.wallets)) {
            Events.trigger("WalletCollection.onTransactionsLoaded");
        }
    }
    // /**
    //  * @param {number} currencyId
    //  * @param {string} address
    //  * @return {?Wallet}
    //  */
    // WalletCollection.prototype.getWallet = function (currencyId, address) {
    //     Object.values(this.wallets).forEach(function (wallet) {
    //         if (wallet.currency.id === currencyId && wallet.address === address) {
    //             return wallet;
    //         }
    //     });
    //
    //     return null;
    // };
    /**
     * @param {number=} currencyId
     * @return {Array<Wallet>}
     */
    getWalletsSortedByTime (currencyId) {
        /** @type {Array<Wallet>} */
        let wallets = [];
        if (currencyId) {
            Object.values(this.wallets).forEach(function ( /** @type {Wallet} */ wallet) {
                if (wallet.currency.id !== currencyId) {
                    return;
                }
                wallets.push(wallet);
            });
        } else {
            wallets = Object.values(this.wallets);
        }
        return wallets.sort((a, b) => b.balance - a.balance);
    }
    /**
     * @param {number} currencyId
     * @return {Array<Transaction>}
     */
    getTransactionsSortedByTime (currencyId) {
        // console.log("WalletCollection.getTransactionsSortedByTime");
        /** @type {Array<Transaction>} */
        let transactions = [];
        Object.values(this.wallets).forEach(function ( /** @type {Wallet} */ wallet) {
            if (wallet.currency.id !== currencyId) {
                return;
            }
            transactions = transactions.concat(wallet.transactions);
        });
        return transactions.sort((a, b) => b.time - a.time);
    }
}