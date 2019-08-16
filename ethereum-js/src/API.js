const Web3 = require('web3');
const ABIERC20 = require('./ERC20.json');

class API {
    constructor(provider) {
        this.web3 = new Web3(provider);
        this.erc20 = new this.web3.eth.Contract(ABIERC20);
    }

    estimateGas({from, to, value, data, gasPrice, gasLimit, nonce}) {
        return new Promise((resolve, reject) => {
            this.web3.eth.estimateGas({from, to, value, data, gasPrice, gasLimit, nonce}, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }

    fetchBalance({address, contract}) {
        return new Promise((resolve, reject) => {
            if (contract) {
                const erc20 = this.erc20.clone();
                erc20.options.address = contract;
                erc20.methods.balanceOf(address).call().then((result) => {
                    resolve(result.toString());
                }).catch((error) => {
                    reject(error);
                })
            } else {
                this.web3.eth.getBalance(address, (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                });
            }
        });
    }

    getTx({hash}) {
        return new Promise((resolve, reject) => {
            this.web3.eth.getTransaction(hash, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }

    sendTx({tx}) {
        return new Promise((resolve, reject) => {
            this.web3.eth.sendSignedTransaction(tx, (error, txHash) => {
                    // console.log("sendSignedTransaction error, txHash", error, txHash);
                    if (error) {
                        reject(error);
                    }else{
                        resolve({txHash});
                    }
                })
                .on('transactionHash',  function (txHash) {
                    // console.log('transactionHash', hash);
                    resolve({txHash});
                })
                // .on('receipt', receipt => {
                //     resolve(receipt);
                // })
                .on('error', (error) => {
                    reject(error);
                });
        });
    }

    getNonce({address}) {
        return new Promise((resolve, reject) => {
            this.web3.eth.getTransactionCount(address, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }
}

module.exports = API;
