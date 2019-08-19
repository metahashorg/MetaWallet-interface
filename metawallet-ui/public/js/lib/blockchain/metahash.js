/** @type {Object} */
let MetaHashLib = {};

/**
 * Check MHC address
 * @param {string} address
 * @return {boolean}
 */
MetaHashLib.addressCheck = function (address) {
    return address.length === 52 && address.substr(0, 3) === "0x0";
};

/**
 * Get MHC address icon
 * @param {string} address
 * @return {string}
 */
MetaHashLib.addressIcon = function (address) {
    return "https://icons.metahash.io/" + address;
};

/**
 * Get MetaPay parameters
 * @param {string} metaPayUrl
 * @return {MetaPayParams}
 */
MetaHashLib.getMetapayParams = function (metaPayUrl) {
    console.log("metaPayUrl", metaPayUrl);

    let matches = metaPayUrl.match(/([^\/]+)\/\/([^\/]+)\/\?([^$]+)/);
    let url = {
        protocol: matches[1],
        host: matches[2],
        searchParams: matches[3],
    };
    console.log("metaPayUrl clean", url);

    if (url.protocol !== "metapay:" || url.host !== "pay.metahash.org") {
        return {
            protocol: url.protocol,
            pathname: url.pathname,
            valid: false
        };
    }

    let metaPayParams = {};
    url.searchParams.split("&").forEach(function ( /** @type {string} */ keyValue) {
        keyValue = keyValue.split("=").map(function ( /** @type {string} */ s) {
            return s.trim();
        });
        metaPayParams[keyValue[0]] = keyValue[1];
    });

    if (metaPayParams.to === null) {
        return {
            to: metaPayParams.to,
            valid: false
        };
    }

    metaPayParams.vendorKnown = false;
    metaPayParams.vendorName = "Unknown";
    metaPayParams.currency = metaPayParams.currency || CURRENCY_CODES[CURRENCY_ID_MHC];
    metaPayParams.currencyId = metaPayParams.currency.toUpperCase() === CURRENCY_CODES[CURRENCY_ID_MHC].toUpperCase() ? CURRENCY_ID_MHC : CURRENCY_ID_TMH;
    metaPayParams.value = parseFloat(metaPayParams.value) * 1e6;
    metaPayParams.data = metaPayParams.data || "";
    metaPayParams.description = metaPayParams.description || "";
    metaPayParams.valid = true;

    console.log("metaPayParams", metaPayParams);

    return metaPayParams;
};

/**
 * @param {number} currencyId
 * @return {MetaHashAPI}
 */
MetaHashLib.getApi = function (currencyId) {
    /** @type {string} */
    const proxyNode = currencyId === CURRENCY_ID_MHC ? API_ENDPOINT_PROXY : API_ENDPOINT_PROXY_TEST;
    /** @type {string} */
    const torrentNode = currencyId === CURRENCY_ID_MHC ? API_ENDPOINT_TOR : API_ENDPOINT_TOR_TEST;

    return new MetaHash.API(proxyNode, torrentNode);
};

/**
 * @param {Wallet} wallet
 * @param {string} privateKey
 * @param {Object} transfer
 * @return {Promise<*>}
 */
MetaHashLib.sendTx = function (wallet, privateKey, transfer) {
    return new Promise(function (resolve, reject) {
        /** @type {MetaHashAPI} */
        let metahashApi = MetaHashLib.getApi(wallet.currencyId);

        /** @type {MetaHashWallet} */
        let metahashWallet = MetaHash.Wallet.fromPrivateKey(privateKey);

        metahashApi.getNonce({
            address: metahashWallet.address
        }).then((nonce) => {
            transfer.nonce = nonce;
            let tx = metahashWallet.createTx(transfer);
            try {
                metahashApi.sendTx(tx)
                    .then(function (result) {
                        console.log("sendTx", "result", result);
                        resolve({
                            api: metahashApi,
                            wallet: metahashWallet,
                            transaction: result.params
                        });
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

/**
 * @info test
 * @param {number} amount
 * @return {string}
 */
MetaHashLib.makeDelegateData = function (amount) {
    return `{"method":"delegate","params":{"value":"${amount}"}}`;
};

/**
 * @return {string}
 */
MetaHashLib.makeUnDelegateData = function (amount) {
    return "{\"method\":\"undelegate\"}";
};