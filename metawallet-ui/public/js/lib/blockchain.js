/** @type {Object} */
let BlockchainLib = {};

/**
 * @param {number} currencyId
 * @return {MetaHashAPI|EthereumAPI|null}
 */
BlockchainLib.getApi = function (currencyId) {
    switch (currencyId) {
        case CURRENCY_ID_MHC:
        case CURRENCY_ID_TMH:
            return MetaHashLib.getApi(currencyId);
        case CURRENCY_ID_ETH:
            return EthereumLib.getApi();
        case CURRENCY_ID_BTC:
            return BitcoinLib.getApi();
    }
};

/**
 * Get qr/string hash type
 * @param {string} hash
 * @return {number}
 */
BlockchainLib.hashType = function (hash) {

    const hLength = hash.length;

    // адрес MHC
    if (hLength === 52 && (hash.slice(0, 3) === "0x0" || hash.slice(0, 3) === "0x6")) {
        return HASH_TYPE_METAHASH_ADDRESS;
    }

    if (hLength === 42) {
        // адрес ETH
        if (hash.slice(0, 2) === "0x") {
            return HASH_TYPE_ETH_ADDRESS;
        }
        // адрес BTC-segwit
        if (hash.slice(0, 2) === "bc1") {
            return HASH_TYPE_BTC_ADDRESS;
        }
    }

    // адрес BTC
    if (hLength > 26 && hLength < 35 && (hash.slice(0, 1) === "1" || hash.slice(0, 1) === "3" || hash.slice(0, 1) === "m")) {
        return HASH_TYPE_BTC_ADDRESS;
    }

    // специфичный формат MetaGate для Bitcoin
    if (hLength === 91 && hash.slice(0, 4) === "btc:") {
        return HASH_TYPE_BTC_KEY_METAGATE;
    }

    // RAW приватный ключ Bitcoin в RAW или WIF
    if (hLength === 64 || hLength === 52) {
        return HASH_TYPE_BTC_KEY_PRIVATE_RAW;
    }

    if ((hLength === 236 || hLength === 242) && (hash.slice(0, 14) === "30740201010420" || hash.slice(0, 14) === "30770201010420")) {
        return HASH_TYPE_METAHASH_KEY_PRIVATE_OPEN;
    }

    if ((hLength === 177 || hLength === 182) && (hash.slice(0, 48) === "3056301006072a8648ce3d020106052b8104000a03420004" || hash.slice(0, 54) === "3059301306072a8648ce3d020106082a8648ce3d03010703420004")) {
        return METAHASH_HASH_TYPE_KEY_PUBLIC;
    }

    if (hash.slice(0, 30) === "-----BEGIN EC PRIVATE KEY-----") {
        if (hash.indexOf("ENCRYPTED") !== -1) {
            return HASH_TYPE_METAHASH_KEY_PRIVATE_PEM_ENC;
        }

        return HASH_TYPE_METAHASH_KEY_PRIVATE_PEM_OPEN;
    }

    if (hash.slice(0, 27) === "metapay://pay.metahash.org/") {
        return METAHASH_HASH_TYPE_METAPAY;
    }

    if (hash.slice(0, 5) === "eth:{" || hash.indexOf("kdfparams") !== -1) {
        console.log("HASH_TYPE_ETH_KEYV3");
        return HASH_TYPE_ETH_KEYV3;
    }

    return HASH_TYPE_UNDEFINED;
};

/**
 * @param {number} hashType
 * @param {number} currencyId
 * @return {boolean}
 */
BlockchainLib.checkHashTypeForCurrency = function (hashType, currencyId) {
    switch (currencyId) {
        case CURRENCY_ID_MHC:
        case CURRENCY_ID_TMH:
            return [HASH_TYPE_METAHASH_ADDRESS, HASH_TYPE_METAHASH_KEY_PRIVATE_PEM_OPEN, HASH_TYPE_METAHASH_KEY_PRIVATE_OPEN, HASH_TYPE_METAHASH_KEY_PRIVATE_PEM_ENC].indexOf(hashType) !== -1;
        case CURRENCY_ID_ETH:
            return [HASH_TYPE_ETH_ADDRESS, HASH_TYPE_ETH_KEYV3].indexOf(hashType) !== -1;
        case CURRENCY_ID_BTC:
            return [HASH_TYPE_BTC_ADDRESS, HASH_TYPE_BTC_KEY_METAGATE, HASH_TYPE_BTC_KEY_PRIVATE_RAW].indexOf(hashType) !== -1;
        default:
            return false;
    }
};

/**
 * @param {string} hash
 * @param {number} len
 * @return {string}
 */
BlockchainLib.hashCollapse = function (hash, len = 10) {
    // @todo hash[0:12] + "…" + hash[49:52]
    return hash.slice(0, len) + "..." + hash.slice(-Math.floor(len / 2));
};

/**
 * @param {number} currencyId
 * @return {MetaHashWallet|EthereumWallet|BitcoinWallet|null}
 */
BlockchainLib.getNewBlockchainWallet = function (currencyId) {
    switch (currencyId) {
        case CURRENCY_ID_MHC:
        case CURRENCY_ID_TMH:
            return new MetaHash.Wallet(METAHASH_WALLET_SECP256K1);
        case CURRENCY_ID_ETH:
            return new Ethereum.Wallet();
        case CURRENCY_ID_BTC:
            return new Bitcoin.Wallet(BITCOIN_KEYTYPE, null, BITCOIN_TESTNET);
        default:
            return null;
    }
};

/**
 * @param {number} currencyId
 * @param {string} encryptedWallet
 * @param {string} password
 * @return {MetaHashWallet|EthereumWallet|BitcoinWallet|null}
 */
BlockchainLib.fromEncryptedWallet = function (currencyId, encryptedWallet, password) {
    try {
        switch (currencyId) {
            case CURRENCY_ID_MHC:
            case CURRENCY_ID_TMH:
                return /** @type {MetaHashWallet} */ MetaHash.Wallet.fromEncryptedPEM(encryptedWallet, password);
            case CURRENCY_ID_ETH:
                return /** @type {EthereumWallet} */ Ethereum.Wallet.fromV3JSON(encryptedWallet, password);
            case CURRENCY_ID_BTC:
                return /** @type {BitcoinWallet} */ Bitcoin.Wallet.fromBIP38(encryptedWallet, password, BITCOIN_KEYTYPE, BITCOIN_TESTNET);
        }
    } catch (e) {
        return null;
    }
};

/**
 * @param {number} currencyId
 * @param {string} privateKey
 * @return {MetaHashWallet|EthereumWallet|BitcoinWallet|null}
 */
BlockchainLib.fromPrivateKey = function (currencyId, privateKey) {
    try {
        switch (currencyId) {
            case CURRENCY_ID_MHC:
            case CURRENCY_ID_TMH:
                return /** @type {MetaHashWallet} */ MetaHash.Wallet.fromPrivateKey(privateKey);
            case CURRENCY_ID_ETH:
                return /** @type {EthereumWallet} */ Ethereum.Wallet.fromPrivateKey(privateKey);
            case CURRENCY_ID_BTC:
                return /** @type {BitcoinWallet} */ Bitcoin.Wallet.fromPrivateKey(privateKey, BITCOIN_KEYTYPE, BITCOIN_TESTNET);
        }
    } catch (e) {
        // console.log("e",e);
        return null;
    }
};

/**
 * @param {number} currencyId
 * @param {MetaHashWallet|EthereumWallet|BitcoinWallet} blockchainWallet
 * @param {string} password
 * @return {?string}
 */
BlockchainLib.getPrivateKeyForQrCode = function (currencyId, blockchainWallet, password) {
    switch (currencyId) {
        case CURRENCY_ID_MHC:
        case CURRENCY_ID_TMH:
            return blockchainWallet.toEncryptedPEM(password);
        case CURRENCY_ID_ETH:
            return blockchainWallet.toV3JSON(password);
        case CURRENCY_ID_BTC:
            return blockchainWallet.toBIP38(password);
    }
};

/**
 * @param {number} currencyId
 * @param {Wallet} wallet
 * @param {string} privateKey
 * @param {Object} transfer
 * @return {Promise<*>}
 */
BlockchainLib.sendTx = function (currencyId, wallet, privateKey, transfer) {
    switch (currencyId) {
        case CURRENCY_ID_MHC:
        case CURRENCY_ID_TMH:
            return MetaHashLib.sendTx(wallet, privateKey, transfer);
        case CURRENCY_ID_ETH:
            return EthereumLib.sendTx(wallet, privateKey, transfer);
        case CURRENCY_ID_BTC:
            return BitcoinLib.sendTx(wallet, privateKey, transfer);
    }
};