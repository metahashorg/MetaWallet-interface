/** @type {Object} */
let EthereumLib = {};

/**
 * @return {EthereumAPI}
 */
EthereumLib.getApi = function () {
    return new Ethereum.API(API_ENDPOINT_ETHEREUM);
};

/**
 * @param {Wallet} wallet
 * @param {string} privateKey
 * @param {Object} transfer
 * @return {Promise<*>}
 */
EthereumLib.sendTx = function (wallet, privateKey, transfer) {
    return new Promise(function (resolve, reject) {
        /** @type {EthereumAPI} */
        let ethereumApi = EthereumLib.getApi();

        /** @type {EthereumWallet} */
        let ethereumWallet = Ethereum.Wallet.fromPrivateKey(privateKey);

        ethereumApi.getNonce({
                address: wallet.address
            })
            .then((nonce) => {
                /** @type {EthereumTxParams} */
                const txParams = {
                    from: wallet.address,
                    to: transfer.to,
                    value: ethereumApi.web3.utils.numberToHex(Math.floor(parseFloat(transfer.value) * Math.pow(10, 18))),
                    data: transfer.data,
                    gasPrice: ethereumApi.web3.utils.numberToHex(transfer.fee),
                    gasLimit: "0x5208",
                    nonce: ethereumApi.web3.utils.numberToHex(nonce)
                };
                const tx = ethereumWallet.createTx(txParams);

                try {
                    ethereumApi.sendTx({
                            tx: tx
                        })
                        .then(function (result) {
                            console.log("sendTx", "result", result);

                            new Task( /** @type {TaskConfig} */ {
                                interval: 2 * 1000,
                                callback: function () {
                                    ethereumApi.getTx({
                                        hash: result.txHash
                                    }).then((result) => {
                                        console.log("getTx", result);
                                        if (result && typeof result.hash !== "undefined") {
                                            resolve({
                                                api: ethereumApi,
                                                wallet: ethereumWallet,
                                                transaction: result.hash
                                            });
                                            this.stop();
                                        }
                                    });
                                }
                            }).start();
                        })
                        .catch(function (e) {
                            console.log("sendTx", "error", e.message);
                            reject();
                        });
                } catch (e) {
                    console.log("sendTx", "error", e.message);
                    reject();
                }
            });
    });
};