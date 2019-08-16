const fetch = (typeof window !== 'undefined' && window.fetch) ? window.fetch : require('node-fetch');
const DNSoverHTTPS = require('dohdec/lib/doh');
const doh = new DNSoverHTTPS();

const PROXY_NODE_PORT = 9999;
const TOR_NODE_PORT = 5795;

class API {
    constructor(proxyApiUrl = null, torApiUrl = null) {
        this.apiUrls = {
            proxy: proxyApiUrl,
            tor: torApiUrl
        };
    }

    request(method, params) {
        const query = {
            jsonrpc: '2.0',
            method: method,
            params: params
        };

        const type = ['mhc_send', 'mhc_test_send'].indexOf(method) !== -1 ? 'proxy' : 'tor';

        return new Promise((resolve, reject) => {
            if (!this.apiUrls[type]) {
                if (type === 'proxy') {
                    API.getProxyNodes().then((nodes) => {
                        this.apiUrls[type] = nodes[0];
                        resolve();
                    }).catch((error) => {
                        reject(error);
                    });
                } else {
                    API.getTorNodes().then((nodes) => {
                        this.apiUrls[type] = nodes[0];
                        resolve();
                    }).catch((error) => {
                        reject(error);
                    });
                }
            } else {
                resolve();
            }
        })
            .then(() => {
                return fetch(this.apiUrls[type], {
                    method: 'POST',
                    body: JSON.stringify(query)
                });
            })
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                return data.error ? Promise.reject(data.error) : Promise.resolve(typeof data.params === 'undefined' ? data.result : data);
            });
    }

    fetchBalance({address}) {
        return this.request('fetch-balance', {
            address: address
        });
    }

    fetchBalances({addresses}) {
        return this.request('fetch-balances', {
            addresses: addresses
        });
    }

    fetchHistory({address, beginTx, countTxs}) {
        const params = {address};
        if (typeof beginTx !== 'undefined') { params.beginTx = beginTx; }
        if (typeof countTxs !== 'undefined') { params.countTxs = countTxs; }
        return this.request('fetch-history', params);
    }

    getAddressDelegations({address, beginTx, countTxs}) {
        const params = {address};
        if (typeof beginTx !== 'undefined') { params.beginTx = beginTx; }
        if (typeof countTxs !== 'undefined') { params.countTxs = countTxs; }
        return this.request('get-address-delegations', params);
    }

    getTx({hash}) {
        return this.request('get-tx', {
            hash: hash
        });
    }

    sendTx({to, value, fee, nonce, data, pubkey, sign}) {
        return this.request('mhc_send', {to, value, fee, nonce, data, pubkey, sign});
    }

    getNonce({address}) {
        return this.fetchBalance({address}).then((data) => {
            return data.count_spent + 1;
        });
    }

    static getProxyNodes(net = 'main') {
        return new Promise((resolve, reject) => {
            doh.lookup('proxy.net-' + net + '.metahashnetwork.com', 'A').then((nodesResult) => {
                const nodes = [];
                if (nodesResult.Status === 0) {
                    nodes.push(...nodesResult.Answer.map(answer => 'http://' + answer.data + ':' + PROXY_NODE_PORT));
                }
                resolve(nodes);
            }).catch((error) => {
                reject(error);
            });
        });
    }

    static getTorNodes(net = 'main') {
        return new Promise((resolve, reject) => {
            doh.lookup('tor.net-' + net + '.metahashnetwork.com', 'A').then((nodesResult) => {
                const nodes = [];
                if (nodesResult.Status === 0) {
                    nodes.push(...nodesResult.Answer.map(answer => 'http://' + answer.data + ':' + TOR_NODE_PORT));
                }
                resolve(nodes);
            }).catch((error) => {
                reject(error);
            });
        });
    }

    static getNodes(net = 'main') {
        return new Promise((resolve, reject) => {
            API.getProxyNodes(net).then((proxyNodes) => {
                API.getTorNodes(net).then((torNodes) => {
                    resolve({
                        tor: torNodes,
                        proxy: proxyNodes
                    });
                }).catch((error) => {
                    reject(error);
                });
            }).catch((error) => {
                reject(error);
            });
        });
    }
}

module.exports = API;

