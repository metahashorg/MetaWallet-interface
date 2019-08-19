/** @type {Object} */
let BitcoinLib = {};

/**
 * @return {BitcoinAPI}
 */
BitcoinLib.getApi = function () {
    return new Bitcoin.API();
};

/**
 * @param {Wallet} wallet
 * @param {string} privateKey
 * @param {Object} transfer
 * @return {Promise<*>}
 */
BitcoinLib.sendTx = function (wallet, privateKey, transfer) {
    // console.log("BitcoinLib.sendTx", _wallet, privateKey, transfer);
    return new Promise(function (resolve, reject) {
        /** @type {BitcoinAPI} */
        let bitcoinAPI = BitcoinLib.getApi();

        /** @type {BitcoinWallet} */
        let bitcoinWallet = Bitcoin.Wallet.fromPrivateKey(privateKey, BITCOIN_KEYTYPE, BITCOIN_TESTNET);

        bitcoinAPI.sendTx({
                wallet: bitcoinWallet,
                address: transfer.to,
                value: parseInt(transfer.value),
                // fee: parseInt($sendTxFee.value) // @info добавить выбор
            })
            .then(response => {
                // console.log("response", response);
                resolve({
                    api: bitcoinAPI,
                    wallet: bitcoinWallet,
                    transaction: response.tx.hash
                });
            })
            .catch(function (e) {
                // console.log("sendTx", "error", e.message);
                reject();
            });
    });
};