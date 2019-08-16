/**
 * @param {{
 *     walletCollection: WalletCollection
 * }} config
 * @param {?MetaGateWallet=} metagateWallet
 * @param {?NativeWallet=} nativeWallet
 * @param {MetaHashWallet|EthereumWallet|BitcoinWallet=} blockchainWallet
 * @param {?{currencyId: number, address: string=, name: string=, pkPassword: string=}=} newWallet
 * @constructor
 */
function Wallet (config, metagateWallet, nativeWallet, blockchainWallet, newWallet) {
    /**
     * @type {Object}
     * @private
     */
    this._config = config;

    /** @type {WalletCollection} */
    this.walletCollection = config.walletCollection;

    /** @type {App|MetaWallet} */
    this.app = this.walletCollection.app;

    /** @type {number} */
    this.balance = 0;

    /** @type {string} */
    this.balanceHash = "";

    /** @type {number} */
    this.delegated = 0;

    /** @type {number} */
    this.tokens = 0;

    /** @type {number} */
    this.transactionsCount = 0;

    /** @type {Array<Transaction>} */
    this.transactions = [];

    /**
     * All transactions have been fetched
     * @type {boolean}
     * @private
     */
    this._transactionsFetched = false;

    /** @type {Array<Transaction>} */
    this.rewardsTransaction = [];

    /** @type {Object<string, Delegation>} */
    this.delegations = {};

    /** @type {Object<string, Delegation>} */
    this.delegationTransactions = [];

    if (!metagateWallet && !nativeWallet && !blockchainWallet && !newWallet) {

        /** @type {?MetaGateWallet} */
        this.metagateWallet = null;

        /** @type {?NativeWallet} */
        this.nativeWallet = null;

        /** @type {MetaHashWallet|EthereumWallet|BitcoinWallet|null} */
        this.blockchainWallet = null;

        /** @type {number} */
        this.currencyId = 0;

        /** @type {?Currency} */
        this.currency = null;

        /** @type {string} */
        this.address = "";

        /** @type {string} */
        this.name = "";

        /** @type {?string} */
        this.privateKey = null;

        /** @type {boolean} */
        this.privateKeyExists = false;

        /** @type {?string} */
        this.privateKeyPassword = null;

        /** @type {number} */
        this.time = 0; // strtotime("2000-01-01 00:00:01");

        return;
    }

    /** @type {MetaGateWallet} */
    this.metagateWallet = metagateWallet || null;

    /** @type {?NativeWallet} */
    this.nativeWallet = nativeWallet || null;

    /** @type {MetaHashWallet|EthereumWallet|BitcoinWallet|null} */
    this.blockchainWallet = blockchainWallet || null;

    /** @type {number} */
    this.currencyId = metagateWallet ? parseInt(metagateWallet.currency) : (nativeWallet ? nativeWallet.currencyId : newWallet.currencyId);

    /** @type {Currency} */
    this.currency = new Currency({walletCollection: this.walletCollection, currency: this.currencyId});

    /** @type {string} */
    this.address = (metagateWallet || nativeWallet || metahashWallet || newWallet).address;

    /** @type {string} */
    this.name = metagateWallet ? b64DecodeUnicode(metagateWallet.name) : (nativeWallet ? nativeWallet.name : (newWallet ? newWallet.name : ""));

    /** @type {?string} */
    this.privateKey = nativeWallet ? nativeWallet.privateKey : (metahashWallet ? metahashWallet.privateKey : null);

    /** @type {boolean} */
    this.privateKeyExists = nativeWallet ? nativeWallet.privateKeyExists : !!metahashWallet;

    /** @type {?string} */
    this.privateKeyPassword = newWallet ? newWallet.pkPassword : null;

    /** @type {number} */
    this.time = strtotime(metagateWallet && metagateWallet.use_last_ts_utc ? metagateWallet.use_last_ts_utc : "2000-01-01 00:00:01");

    if (typeof this.address !== "undefined") {
        this.fetchBalance();
    }
}

/**
 * @param {{
 *     walletCollection: WalletCollection
 * }} config
 * @param {MetaGateWallet} metaGateWallet
 * @return {Wallet}
 */
Wallet.fromMetaGateWallet = function (config, metaGateWallet) {
    /** @type {Wallet} */
    let wallet = new Wallet(config);

    /** @type {MetaGateWallet} */
    wallet.metagateWallet = metaGateWallet;

    /** @type {number} */
    wallet.currencyId = metaGateWallet.currency;

    /** @type {Currency} */
    wallet.currency = new Currency({walletCollection: wallet.walletCollection, currency: wallet.currencyId});

    /** @type {string} */
    wallet.address = metaGateWallet.address;

    /** @type {string} */
    wallet.name = b64DecodeUnicode(metaGateWallet.name);

    /** @type {number} */
    wallet.time = metaGateWallet.use_last_ts_utc ? strtotime(metaGateWallet.use_last_ts_utc) : 0;

    wallet.fetchBalance();

    return wallet;
};

/**
 * @param {{
 *     walletCollection: WalletCollection
 * }} config
 * @param {NativeWallet} nativeWallet
 * @return {Wallet}
 */
Wallet.fromNativeWallet = function (config, nativeWallet) {
    /** @type {Wallet} */
    let wallet = new Wallet(config);

    /** @type {?NativeWallet} */
    wallet.nativeWallet = nativeWallet;

    /** @type {number} */
    wallet.currencyId = nativeWallet.currencyId;

    /** @type {Currency} */
    wallet.currency = new Currency({walletCollection: wallet.walletCollection, currency: wallet.currencyId});

    /** @type {string} */
    wallet.address = nativeWallet.address;

    /** @type {string} */
    wallet.name = nativeWallet.name;

    /** @type {?string} */
    wallet.privateKey = nativeWallet.privateKey;

    /** @type {boolean} */
    wallet.privateKeyExists = nativeWallet.privateKeyExists;

    wallet.fetchBalance();

    return wallet;
};

/**
 * @param {{
 *     walletCollection: WalletCollection
 * }} config
 * @param {MetaGateWallet} metaGateWallet
 * @param {NativeWallet} nativeWallet
 * @return {Wallet}
 */
Wallet.fromMetaGateAndNativeWallets = function (config, metaGateWallet, nativeWallet) {
    /** @type {Wallet} */
    let wallet = new Wallet(config);

    /** @type {MetaGateWallet} */
    wallet.metagateWallet = metaGateWallet;

    /** @type {number} */
    wallet.currencyId = metaGateWallet.currency;

    /** @type {Currency} */
    wallet.currency = new Currency({walletCollection: wallet.walletCollection, currency: wallet.currencyId});

    /** @type {string} */
    wallet.address = metaGateWallet.address;

    /** @type {string} */
    wallet.name = b64DecodeUnicode(metaGateWallet.name);

    /** @type {?string} */
    wallet.privateKey = nativeWallet.privateKey;

    /** @type {boolean} */
    wallet.privateKeyExists = nativeWallet.privateKeyExists;

    /** @type {number} */
    wallet.time = metaGateWallet.use_last_ts_utc ? strtotime(metaGateWallet.use_last_ts_utc) : 0;

    wallet.fetchBalance();

    return wallet;
};

/**
 * @param {{
 *     walletCollection: WalletCollection
 * }} config
 * @param {MetaHashWallet|EthereumWallet|BitcoinWallet} blockchainWallet
 * @param {{currencyId: number, address: string=, name: string=, pkPassword: string=}} newWallet
 * @return {Wallet}
 */
Wallet.newWallet = function (config, blockchainWallet, newWallet) {
    /** @type {Wallet} */
    let wallet = new Wallet(config);

    /** @type {number} */
    wallet.currencyId = newWallet.currencyId;

    /** @type {Currency} */
    wallet.currency = new Currency({walletCollection: wallet.walletCollection, currency: wallet.currencyId});

    /** @type {string} */
    wallet.address = blockchainWallet.address;

    /** @type {string} */
    wallet.name = newWallet.name;

    /** @type {?string} */
    wallet.privateKey = blockchainWallet.privateKey;

    /** @type {boolean} */
    wallet.privateKeyExists = true;

    /** @type {?string} */
    wallet.privateKeyPassword = newWallet.pkPassword;

    /** @type {MetaHashWallet|EthereumWallet|BitcoinWallet|null} */
    wallet.blockchainWallet = blockchainWallet;

    return wallet;
};

/**
 * @param {{
 *     walletCollection: WalletCollection
 * }} config
 * @param {number} currencyId
 * @return {Wallet}
 */
Wallet.blankWallet = function (config, currencyId) {
    /** @type {Wallet} */
    let wallet = new Wallet(config);

    /** @type {number} */
    wallet.currencyId = currencyId;

    /** @type {Currency} */
    wallet.currency = new Currency({walletCollection: wallet.walletCollection, currency: wallet.currencyId});

    return wallet;
};

/**
 * @return {string}
 */
Wallet.prototype.getEncryptedPkForNativeApp = function () {
    if (!this.blockchainWallet || !this.privateKeyPassword) {
        return "";
    }

    return BlockchainLib.getPrivateKeyForQrCode(this.currencyId, this.blockchainWallet, this.privateKeyPassword);
};

/**
 * @param {MetaGateWallet} metagateWallet
 */
Wallet.prototype.init = function (metagateWallet) {
    this.metagateWallet = metagateWallet;
    this.name = b64DecodeUnicode(metagateWallet.name);
    this.balance = 0;
    this.delegated = 0;
    this.transactionsCount = 0;
    this.time = strtotime(metagateWallet && metagateWallet.use_last_ts_utc ? metagateWallet.use_last_ts_utc : "2000-01-01 00:00:01");
    this.transactions = [];

    this._transactionsFetched = false;
    this.fetchBalance();
};

/**
 * Short wallet name
 * @return {string}
 */
Wallet.prototype.getName = function () {
    return escapeHtml(this.name) || HashDictionary.get(this.currencyId, this.address) || BlockchainLib.hashCollapse(this.address);
};

/**
 * Short wallet name
 * @return {string}
 */
Wallet.prototype.getNameShort = function () {
    return BlockchainLib.hashCollapse(escapeHtml(this.name) || HashDictionary.get(this.currencyId, this.address) || this.address);
};

/**
 * @return {string}
 */
Wallet.prototype.getFileName = function () {
    return this.address + ".ec.priv";
};

/**
 * Fetch wallet balance from chain
 * @param {boolean=} refresh
 */
Wallet.prototype.fetchBalance = function (refresh) {
    // console.log("Wallet.fetchBalance", this.address, refresh);

    refresh = typeof refresh !== "undefined" ? refresh : false;

    if (this.currencyId === CURRENCY_ID_ETH || this.currencyId === CURRENCY_ID_BTC) {
        apiXhr(getJsonRpcXhrParams("address.balance", {token: this.app.user.token, params: [{address: [this.address], currency: this.currencyId}]}))
            .then(function (response) {
                if (response.result === API_OK && response.data.length === 1 ) {
                    this.balance = parseFloat(response.data[0].balance);
                    this.delegated = 0;
                    this.transactionsCount = 0;
                    this.walletCollection.onWalletLoaded(this);
                    Events.trigger("Wallet.onBalanceFetched", {wallet: this});
                    this.fetchTransactions();
                }
            }.bind(this));
        return;
    }

    /** @type {MetaHashAPI} */
    let metaHashApi = MetaHashLib.getApi(this.currencyId);
    metaHashApi.fetchBalance({address: this.address})
        .then(function (/** @type {MetaHashBalance} */ metaHashBalance) {
            this.balance = (metaHashBalance.received - metaHashBalance.spent) || 0;
            this.delegated = (metaHashBalance.delegate - metaHashBalance.undelegate) || 0;
            this.transactionsCount = (metaHashBalance.count_received + metaHashBalance.count_spent) || 0;
            this.walletCollection.onWalletLoaded(this);
            Events.trigger("Wallet.onBalanceFetched", {wallet: this});

            if (refresh && this.balanceHash !== metaHashBalance.hash) { // balance refresh
                this.balanceHash = metaHashBalance.hash;
                this.fetchTransactions(true);
            } else if (this.transactionsCount > 0 && !refresh) { // load more transactions when scrolling the list
                this.fetchTransactions();
            } else {
                this._transactionsFetched = true;
            }
        }.bind(this))
        .catch(function () {
            setTimeout(function () {
                this.fetchBalance(refresh);
            }.bind(this), CHAIN_FETCH_RETRY_TIMEOUT * 1000);
        }.bind(this));
};

/**
 * Fetch transactions from chain
 * @param {boolean=} refresh
 * @return {boolean}
 */
Wallet.prototype.fetchTransactions = function (refresh) {
    // console.log("Wallet.fetchTransactions", this.address, refresh);

    refresh = typeof refresh !== "undefined" ? refresh : false;

    if (this._transactionsFetched && !refresh) {
        return false;
    }

    if (this.currencyId === CURRENCY_ID_ETH || this.currencyId === CURRENCY_ID_BTC) {
        apiXhr(getJsonRpcXhrParams("address.transaction", {token: this.app.user.token, params: [{address: this.address, currency: this.currencyId}]}))
            .then(function (response) {
                if (response.result === API_OK ) {
                    let transactions = [];
                    let n = 0;
                    response.data.forEach(function (apiTransaction) {

                        n++;
                        if (n >= 100){
                            // @info ?сохранять локально остальные транзакции и использовать их в постраничной догрузке
                            return;
                        }

                        /** @type {MetaHashTransaction} */
                        let metaHashTransaction = {};
                        metaHashTransaction.transaction = apiTransaction.transaction;
                        metaHashTransaction.from = apiTransaction.from_account;
                        metaHashTransaction.to = apiTransaction.to_account;
                        metaHashTransaction.value = apiTransaction.amount;
                        metaHashTransaction.type = "";
                        metaHashTransaction.confirm = apiTransaction.confirmations;
                        metaHashTransaction.currency_code = apiTransaction.currency;
                        metaHashTransaction.timestamp = apiTransaction.ts;
                        metaHashTransaction.fee = apiTransaction.fee;
                        metaHashTransaction.realFee = apiTransaction.fee;
                        metaHashTransaction.status = apiTransaction.confirmations > 5 ? 20 : 1;
                        metaHashTransaction.intStatus = apiTransaction.confirmations > 5 ? 20 : 1;

                        /** @type {Transaction} */
                        let transaction = new Transaction({walletCollection: this.walletCollection, currency: this.currency, wallet: this, transaction: metaHashTransaction});
                        this.transactions.push(transaction);
                        transactions.push(transaction);
                    }.bind(this));
                    this._transactionsFetched = true;
                    Events.trigger("Wallet.onMoreTransactionsFetched", {wallet: this, transactions: transactions});
                }
            }.bind(this))
            .catch(function () {
            }.bind(this));

        return false;
    }

    /** @type {MetaHashAPI} */
    let metahashApi = MetaHashLib.getApi(this.currencyId);

    let eventCode = this.transactions.length ? (refresh ? "onRefreshedTransactionsFetched" : "onMoreTransactionsFetched") : "onTransactionsFetched";
    let beginTx = refresh ? 0 : this.transactions.length;

    metahashApi.fetchHistory({address: this.address, beginTx: beginTx, countTxs: TRANSACTIONS_PER_FETCH})
        .then(function (/** @type {Array<MetaHashTransaction>} */ result) {
            // console.log(result);

            if (result.length < TRANSACTIONS_PER_FETCH) {
                this._transactionsFetched = true;
            }

            if (refresh) { // need to reverse the array to prepend transactions to list in appropriate order
                result = result.reverse();
            }

            /** @type {Array<Transaction>} */
            let transactions = [];
            result.forEach(function (/** @type {MetaHashTransaction} */ metaHashTransaction) {
                if (refresh && this.findTransaction(metaHashTransaction.transaction)) {
                    return;
                }
                // console.log("+", metaHashTransaction.transaction);

                /** @type {Transaction} */
                let transaction = new Transaction({walletCollection: this.walletCollection, currency: this.currency, wallet: this, transaction: metaHashTransaction});
                if (refresh) {
                    this.transactions.unshift(transaction);
                } else {
                    this.transactions.push(transaction);
                }
                transactions.push(transaction);
            }.bind(this));

            if (!refresh || transactions.length) {
                Events.trigger("Wallet." + eventCode, {wallet: this, transactions: transactions});
            }
            if (eventCode === "onTransactionsFetched") {
                this.walletCollection.onTransactionsLoaded();
            }
        }.bind(this))
        .catch(function () {
            setTimeout(function () {
                this.fetchTransactions();
            }.bind(this), CHAIN_FETCH_RETRY_TIMEOUT * 1000);
        }.bind(this));

    return true;
};

/**
 * @param {string} hash
 * @return {?Transaction}
 */
Wallet.prototype.findTransaction = function (hash) {
    for (let i = 0; i < this.transactions.length; i++) {
        if (this.transactions[i].hash === hash) {
            return this.transactions[i];
        }
    }

    return null;
};

/**
 * @return {Array<Transaction>}
 */
Wallet.prototype.getTransactionsSortedByTime = function () {
    return this.transactions.sort((a, b) => b.time - a.time);
};

/**
 * @return {Balance}
 */
Wallet.prototype.getBalance = function () {
    return this.currency.getBalance(this.balance);
};

/**
 * @return {{delegated: number, localeString: string}}
 */
Wallet.prototype.getDelegated = function () {
    const delegatedAmount = this.delegated || 0;
    let delegated = {
        delegated: delegatedAmount,
        localeString: (delegatedAmount / CURRENCY_COEFFICIENT[this.currencyId]).toLocaleString("en", { maximumFractionDigits: this.currency.decimals }), // @todo использовать выбранную локаль?
    };

    return delegated;
};

/**
 * @return {{rate: number, recalc: number}}
 */
Wallet.prototype.getBaseCurrencyRecalc = function () {
    /** @type {number} */
    let rate = this.currency.id === 1 ? 0 : this.walletCollection.getRate(this.walletCollection.baseCurrency.id, this.currency.id);

    let recalc = {
        rate: rate,
        recalc: this.balance / Math.pow(10, this.currency.decimals) * rate
    };
    if (recalc.recalc < 1 / Math.pow(10, this.currency.decimals)) {
        recalc.recalc = 0;
    }

    return recalc;
};

/**
 * @return {string}
 */
Wallet.prototype.getIcon = function () {
    return MetaHashLib.addressIcon(this.address);
};

/**
 * @return {boolean}
 */
Wallet.prototype.checkAddress = function () {
    return MetaHashLib.addressCheck(this.address);
};

/**
 * @return {Array<Transaction>}
 */
Wallet.prototype.getRewards = function () {
    // @todo для BTC/ETH другое API
    if (this.currencyId !== CURRENCY_ID_TMH && this.currencyId !== CURRENCY_ID_MHC) {
        return;
    }

    xhr(getJsonRpcXhrParams("plus.address.rewards", {params: {address: this.address, countTxs: 25}}, this.currencyId))
        .then(function (response) {
            if (response.result) {
                response.result.forEach(function (/** @type {MetaHashTransaction} */ transaction) {
                    this.rewardsTransaction.push(new Transaction({walletCollection: this.walletCollection, currency: this.currency, wallet: this, transaction: transaction}));
                }.bind(this));
                Events.trigger("Wallet.onRewardsTransactionsFetched", {wallet: this});
            }
        }.bind(this))
        .catch(function () {
            setTimeout(function () {
                this.getRewards();
            }.bind(this), CHAIN_FETCH_RETRY_TIMEOUT * 1000);
        }.bind(this));
};

/**
 * @return {Array<Transaction>}
 */
Wallet.prototype.getRewardsTransactionsSortedByBlockNumber = function () {
    return this.rewardsTransaction.sort((a, b) => b["block_number"] - a["block_number"]);
};

/**
 * @return {Array<Transaction>}
 */
Wallet.prototype.getDelegations = function () {

    return new Promise(function (resolve, reject) {
        // @todo для BTC/ETH другое API
        if (this.currencyId !== CURRENCY_ID_TMH && this.currencyId !== CURRENCY_ID_MHC) {
            resolve();
            return;
        }

        // @info ничего не делегировано
        if (this.delegated === 0){
            resolve();
            return;
        }

        // @info надо учитывать текущие смещения и общий статус загруженнности списка
        this.delegations = [];
        this.app.nodesCollection.loadNodes().then(function (){
            console.log("get-address-delegations", this.delegated, this.address);
            xhr(getJsonRpcXhrParams("get-address-delegations", {params: {address: this.address, countTxs: 25}}, this.currencyId))
                .then(function (response) {
                    if (response.result) {
                        response.result.states.forEach(function (/** @type {MetaHashDelegation} */ state) {
                            if(state.to !== ADDRESS_FORGING){
                                if (typeof this.delegations[state.to] === "undefined"){
                                    this.delegations[state.to] = new Delegation({wallet: this, state: state});
                                } else {
                                    this.delegations[state.to].count +=1;
                                    this.delegations[state.to].value += state.value;
                                }

                                this.delegationTransactions.push(new Delegation({wallet: this, state: state}));
                            }
                        }.bind(this));
                        Events.trigger("Wallet.onDelegationsFetched", {wallet: this});
                        resolve();
                    }
                }.bind(this))
                .catch(function (e) {
                    console.log("getDelegations:e:", e);
                    setTimeout(function () {
                        this.getDelegations();
                    }.bind(this), CHAIN_FETCH_RETRY_TIMEOUT * 1000);
                }.bind(this));
        }.bind(this));
    }.bind(this));
};

/**
 * @return {Promise<*>}
 */
Wallet.prototype.addToMetaGate = function () {
    // @todo при пустом this.app.user.token - прекращать работу
    return new Promise(function (resolve, reject) {
        /** @type {Object<string, string>} */
        let apiParams = {
            currency: String(this.currencyId),
            address: this.address,
            password: "",
            name: (typeof this.name === "undefined" ? "" : b64EncodeUnicode(this.name)),
            pubkey: this.blockchainWallet.publicKey
        };
        // console.log("apiParams", apiParams);
        apiXhr(getJsonRpcXhrParams("address.create", {token: this.app.user.token, params: [apiParams]}))
            .then(function () {
                this.addToNativeApp()
                    .then(function () {
                        resolve();
                    })
                    .catch(function () {
                        reject();
                    });
            }.bind(this))
            .catch(function () {
                reject();
            }.bind(this));
        }.bind(this));
};

/**
 * @return {Promise<*>}
 */
Wallet.prototype.addToNativeApp = function () {
    return new Promise(function (resolve, reject) {
        /** @type {NativeWallet} */
        let nativeWallet = {
            email: this.app.user.email,
            currencyId: this.currencyId,
            address: this.address,
            name: this.name,
            privateKeyExists: !!this.blockchainWallet,
            privateKey: this.getEncryptedPkForNativeApp(),
        };
        // console.log("nativeParams", nativeWallet);
        bridgeCallHandler("addWallet", nativeWallet)
            .then(function () {
                this.nativeWallet = nativeWallet;
                this.privateKey = nativeWallet.privateKey;
                this.privateKeyExists = nativeWallet.privateKeyExists;
                resolve();
            }.bind(this))
            .catch(function () {
                reject();
            });
    }.bind(this));
};

/**
 * @return {string}
 * @return {Promise<*>}
 */
Wallet.prototype.rename = function (newName) {
    return new Promise(function (resolve, reject) {
        /** @type {Object<string, string>} */
        let apiParams = {
            currency: String(this.currencyId),
            address: this.address,
            name: b64EncodeUnicode(newName),
        };

        apiXhr(getJsonRpcXhrParams("address.name.set", {token: this.app.user.token, params: [apiParams]}))
            .then(function () {
                this.name = newName;
                resolve();
            }.bind(this))
            .catch(function () {
                reject();
            }.bind(this));
    }.bind(this));
};