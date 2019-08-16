const bitcoinjs = require("bitcoinjs-lib");
const bip38 = require("bip38");

class Wallet {
    constructor (type = "legacy", keyPair = null, testnet = false) {
        this._network = testnet ? bitcoinjs.networks.testnet : bitcoinjs.networks.bitcoin;
        this._keyPair = keyPair ? keyPair : bitcoinjs.ECPair.makeRandom({ network: this._network });
        this.privateKey = this._keyPair.privateKey ? this._keyPair.privateKey.toString("hex") : null;
        this.publicKey = this._keyPair.publicKey.toString("hex");
        this.address = Wallet.publicKeyToAddress(this.publicKey, type, testnet);
    }

    toWIF () {
        const wif = this._keyPair.toWIF();
        if (this.address.substr(0, 1) === "1" || this.address.substr(0, 1) === "m") {
            return wif;
        } else if (this.address.substr(0, 1) === "3") {
            return "p2wpkh-p2sh:" + wif;
        } else if (this.address.substr(0, 3) === "bc1") {
            return  "p2wpkh:" + wif;
        }
    }

    static fromWIF (wif, type = "legacy", testnet = false) {
        const network = testnet ? bitcoinjs.networks.testnet : bitcoinjs.networks.bitcoin;
        const typedWif = wif.split(":");
        if (typedWif.length === 2) {
            wif = typedWif[1];
            switch (typedWif[0]) {
                case "p2wpkh":
                    type = "bech32";
                    break;
                case "p2wpkh-p2sh":
                    type = "segwit";
                    break;
            }
        }
        const keyPair = bitcoinjs.ECPair.fromWIF(wif, network);
        const wallet = new Wallet(type, keyPair, testnet);
        return wallet;
    }

    toBIP38 (password) {
        const encryptedKey = bip38.encrypt(Buffer.from(this.privateKey, "hex"), true, password);
        return encryptedKey;
    }

    static fromBIP38 (encryptedKey, password, type = "legacy", testnet = false) {
        const decryptedKey = bip38.decrypt(encryptedKey, password);
        const network = testnet ? bitcoinjs.networks.testnet : bitcoinjs.networks.bitcoin;
        const keyPair = bitcoinjs.ECPair.fromPrivateKey(decryptedKey.privateKey,{network});
        return new Wallet(type, keyPair, testnet);
    }

    static fromPrivateKey (privateKey, type = "legacy", testnet = false) {
        privateKey = privateKey.replace(/^0x/, "");
        const network = testnet ? bitcoinjs.networks.testnet : bitcoinjs.networks.bitcoin;
        const keyPair = bitcoinjs.ECPair.fromPrivateKey(Buffer.from(privateKey, "hex"), {network});
        return new Wallet(type, keyPair, testnet);
    }

    static fromPublicKey (publicKey, type = "legacy", testnet = false) {
        publicKey = publicKey.replace(/^0x/, "");
        const network = testnet ? bitcoinjs.networks.testnet : bitcoinjs.networks.bitcoin;
        const keyPair = bitcoinjs.ECPair.fromPublicKey(Buffer.from(publicKey, "hex"),{network});
        return new Wallet(type, keyPair, testnet);
    }

    static publicKeyToAddress (publicKey, type = "legacy", testnet = false) {
        publicKey = publicKey.replace(/^0x/, "");
        const network = testnet ? bitcoinjs.networks.testnet : bitcoinjs.networks.bitcoin;
        const keyPair = bitcoinjs.ECPair.fromPublicKey(Buffer.from(publicKey, "hex"),{network});
        let wallet = null;
        switch (type) {
            case "legacy":
                wallet = bitcoinjs.payments.p2pkh({pubkey: keyPair.publicKey, network});
                break;
            case "segwit":
                wallet = bitcoinjs.payments.p2sh({
                    redeem: bitcoinjs.payments.p2wpkh({pubkey: keyPair.publicKey, network})
                });
                break;
            case "bech32":
                wallet = bitcoinjs.payments.p2wpkh({pubkey: keyPair.publicKey, network});
                break;
        }
        return wallet ? wallet.address : null;
    }
}

module.exports = Wallet;
