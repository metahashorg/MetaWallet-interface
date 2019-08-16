/**
 * @param {App|MetaWallet} app
 * @param {Wallet} wallet
 * @return {Promise<any>}
 */
function importPk (app, wallet) {
    return new Promise(function (resolve, reject) {
        bridgeCallHandler("openQRscan")
            .then(function (data) {
                console.log("openQRscan", data, data.code, strsplit(data.code, 64));

                let hashType = BlockchainLib.hashType(data.code);
                if (!BlockchainLib.checkHashTypeForCurrency(hashType, wallet.currencyId)) {
                    reject({error: __("importpk.wrongcurrency", {currency: CURRENCY_CODES[wallet.currencyId]})});
                    return;
                }

                switch (hashType) {
                    // MetaHash
                    case HASH_TYPE_METAHASH_KEY_PRIVATE_PEM_ENC:
                        importPkEncrypted(app, wallet, data.code)
                            .then(function () {
                                resolve();
                            })
                            .catch(function () {
                                reject();
                            });
                        break;
                    case HASH_TYPE_METAHASH_KEY_PRIVATE_OPEN:
                    case HASH_TYPE_METAHASH_KEY_PRIVATE_PEM_OPEN:
                        /** @type {MetaHashWallet} */
                        let metahashWallet = hashType === HASH_TYPE_METAHASH_KEY_PRIVATE_OPEN
                            ? MetaHash.Wallet.fromPrivateKey(data.code)
                            : MetaHash.Wallet.fromPEM(data.code);
                        importPkDecrypted(app, wallet, metahashWallet)
                            .then(function () {
                                resolve();
                            })
                            .catch(function () {
                                reject();
                            });
                        break;
                    case HASH_TYPE_METAHASH_ADDRESS:
                        importPkAddress(app, wallet, data.code)
                            .then(function () {
                                resolve();
                            })
                            .catch(function () {
                                reject();
                            });
                        break;
                    // Ethereum
                    case HASH_TYPE_ETH_KEYV3: // encrypted V3 JSON
                        if (data.code.substr(0, 5) === "eth:{") {
                            data.code = data.code.substr(4);
                        }
                        importPkEncrypted(app, wallet, data.code)
                            .then(function () {
                                resolve();
                            })
                            .catch(function () {
                                reject();
                            });
                        break;
                    case HASH_TYPE_ETH_ADDRESS:
                        importPkAddress(app, wallet, data.code)
                            .then(function () {
                                resolve();
                            })
                            .catch(function () {
                                reject();
                            });
                        break;
                    // Bitcoin
                    case HASH_TYPE_BTC_ADDRESS:
                        importPkAddress(app, wallet, data.code)
                            .then(function () {
                                resolve();
                            })
                            .catch(function () {
                                reject();
                            });
                        break;
                    case HASH_TYPE_BTC_KEY_PRIVATE_RAW: // bitcoin private raw
                    case HASH_TYPE_BTC_KEY_METAGATE: // metagate bitcoin QR

                        if (data.code.slice(0, 4) === "btc:"){
                            // @info ключ был импортирован из MetaGate
                            data.code = data.code.substr(4).split(" ")[0];
                        }

                        let code = data.code;
                        /** @type {BitcoinWallet} */
                        let bitcoinWallet = code.length === 52 ? Bitcoin.Wallet.fromWIF(code, BITCOIN_KEYTYPE, BITCOIN_TESTNET) : Bitcoin.Wallet.fromPrivateKey(code, BITCOIN_KEYTYPE, BITCOIN_TESTNET);
                        importPkDecrypted(app, wallet, bitcoinWallet)
                            .then(function () {
                                resolve();
                            })
                            .catch(function () {
                                reject();
                            });
                        break;
                    default:
                        reject();
                }
            }.bind(this))
            .catch(function () { // nothing was scanned
                reject();
            });
        });
}

/**
 * @param {App|MetaWallet} app
 * @param {Wallet} wallet
 * @param {string} encryptedWallet
 * @return {Promise<*>}
 */
function importPkEncrypted (app, wallet, encryptedWallet) {
    console.log("importPkEncrypted", encryptedWallet);

    return new Promise(function (resolve, reject) {
        app.alertView(new WalletImportEncryptedAlertView(/** @type {ViewConfig} */ {app: app, wallet: wallet, encryptedWallet: encryptedWallet}))
           .then(function () {
               resolve();
           })
           .catch(function () {
               reject();
           });
    });
}

/**
 * @param {App|MetaWallet} app
 * @param {Wallet} wallet
 * @param {MetaHashWallet} metahashWallet
 * @return {Promise<*>}
 */
function importPkDecrypted (app, wallet, metahashWallet) {
    console.log("importPkDecrypted", metahashWallet);

    return new Promise(function (resolve, reject) {
        app.alertView(new WalletImportDecryptedAlertView(/** @type {ViewConfig} */ {app: app, wallet: wallet, blockchainWallet: metahashWallet}))
            .then(function () {
                resolve();
            })
            .catch(function () {
                reject();
            });
    });
}

/**
 * @param {App|MetaWallet} app
 * @param {Wallet} wallet
 * @param {string} address
 * @return {Promise<*>}
 */
function importPkAddress (app, wallet, address) {
    console.log("importPkAddress", address);

    //todo проверить, что мы пришли сюда из окна добавления нового кошелька, а не из импорта ключа в кошелек

    return new Promise(function (resolve, reject) {
        app.alertView(new WalletImportAddressAlertView(/** @type {ViewConfig} */ {app: app, wallet: wallet, address: address}))
            .then(function () {
                resolve();
            })
            .catch(function () {
                reject();
            });
    });
}