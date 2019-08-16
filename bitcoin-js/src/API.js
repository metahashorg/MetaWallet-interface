const bitcoinjs = require("bitcoinjs-lib");

class API {
    constructor () {
        this.bitcoinjs = bitcoinjs;
    }

    async fetchBalance ({
        address
    }) {
        const response = await fetch(`https://api.blockcypher.com/v1/btc/test3/addrs/${address}/balance`);
        return response.json();
    }

    async fetchHistory ({
        address,
        countTxs
    }) {
        if (typeof countTxs === "undefined") {
            countTxs = 25;
        }
        const response = await fetch(`https://api.blockcypher.com/v1/btc/test3/addrs/${address}?limit=${countTxs}`);
        const responseJSON = await response.json();
        return responseJSON.txrefs;
    }

    async fetchUnspentOutputs ({
        address,
        countTxs
    }) {
        if (typeof countTxs === "undefined") {
            countTxs = 25;
        }
        const response = await fetch(`https://api.blockcypher.com/v1/btc/test3/addrs/${address}?unspentOnly=true&limit=${countTxs}`);
        const responseJSON = await response.json();
        return responseJSON;
    }

    static async getFee () {
        try {
            const response = await fetch("https://bitcoinfees.earn.com/api/v1/fees/recommended");
            const responseJSON = await response.json();
            return (responseJSON.fastestFee * 255);
        } catch (e) {
            return 0;
        }
    }

    async getTx ({
        hash
    }) {
        const response = await fetch(`https://api.blockcypher.com/v1/btc/test3/txs/${hash}?limit=0&includeHex=false`);
        return response.json();
    }

    async sendTx ({
        wallet,
        address,
        value,
        fee
    }) {

        if (typeof fee === "undefined" || fee === -1) {
            fee = await API.getFee();
        }

        return new Promise((resolve, reject) => {
            try {
                this.fetchUnspentOutputs({
                    address: wallet.address
                }).then(result => {
                    // полный расход
                    const totalValue = (value + fee);
                    if (totalValue > result.final_balance) {
                        reject("Insufficient balance");
                        return;
                    }

                    const txb = new this.bitcoinjs.TransactionBuilder(wallet._network);
                    txb.setVersion(1);

                    let currentValue = 0;
                    let inputCoints = 0;
                    for (const utx of result.txrefs) {
                        // собираем входы
                        txb.addInput(utx.tx_hash, utx.tx_output_n);
                        currentValue += utx.value;
                        inputCoints++;
                        if (currentValue >= totalValue) {
                            // нужная сумма набралась
                            break;
                        }
                    }

                    if (totalValue > currentValue) {
                        // недостаточно средств
                        reject("Insufficient funds");
                        return;
                    }

                    // добавляем получателя
                    txb.addOutput(address, value);

                    // сдача
                    const change = currentValue - (value + fee);
                    if (change) {
                        // возвращаем сдачу себе
                        txb.addOutput(wallet.address, change);
                    }

                    for (let index = 0; index < inputCoints; index++) {
                        txb.sign(index, wallet._keyPair);
                    }

                    const raw = txb.build().toHex();
                    fetch("https://api.blockcypher.com/v1/btc/test3/txs/push", {
                            method: "POST",
                            body: JSON.stringify({
                                tx: raw
                            })
                        })
                        .then(response => {
                            resolve(response.json());
                        }).catch(error => {
                            reject(error);
                        });
                });
            } catch (error) {
                reject(error);
            }
        });
    }
}

module.exports = API;