importScripts("/js/const.js");
importScripts("/js/vendor/metahash.js");
importScripts("/js/vendor/ethereum.js");
importScripts("/js/vendor/bitcoin.js");
importScripts("/js/lib/blockchain/metahash.js");
importScripts("/js/lib/blockchain/ethereum.js");
importScripts("/js/lib/blockchain/bitcoin.js");
importScripts("/js/lib/blockchain.js");

onmessage = function (/** @type {MessageEvent} */ event) {
    console.log("-> worker:", event.data);

    /** @type {MetaHashWallet|EthereumWallet|BitcoinWallet|null} */
    let blockchainWallet = BlockchainLib.fromEncryptedWallet(event.data.currencyId, event.data.encryptedWallet, event.data.password);
    if (blockchainWallet) {
        postMessage({result: 1, /*blockchainWallet: blockchainWallet, */privateKey: blockchainWallet.privateKey});
    } else {
        postMessage({result: 0});
    }
};