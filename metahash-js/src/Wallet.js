const ripemd160 = require('crypto-js/ripemd160');
const sha256 = require('crypto-js/sha256');
const encHex = require('crypto-js/enc-hex');
const KeyEncoder = require('key-encoder');
const PEM = require('./PEM');

const pack = require('locutus/php/misc/pack');
const EC = require('elliptic').ec;

const defaultCurve = 'secp256k1';

const curves = {
    'secp256k1': new EC('secp256k1'),
    'secp256r1': new EC('p256')
};

const secp256k1EncoderOptions = {
    curveParameters: [1, 3, 132, 0, 10],
    privatePEMOptions: {label: 'EC PRIVATE KEY'},
    publicPEMOptions: {label: 'PUBLIC KEY'},
    curve: curves['secp256k1']
};

const secp256r1EncoderOptions = {
    curveParameters: [1, 2, 840, 10045, 3, 1, 7],
    privatePEMOptions: {label: 'EC PRIVATE KEY'},
    publicPEMOptions: {label: 'PUBLIC KEY'},
    curve: curves['secp256r1']
};

const keyEncoders = {
    'secp256k1': new KeyEncoder(secp256k1EncoderOptions),
    'secp256r1': new KeyEncoder(secp256r1EncoderOptions)
};

function binToHex(value) {
    let i, l, o = '', n;
    value += '';
    for (i = 0, l = value.length; i < l; i++) {
        n = value.charCodeAt(i).toString(16);
        o += n.length < 2 ? '0' + n : n;
    }
    return o;
}

function intToHexHandler(firstFormat, firstValue, secondFormat, SecondValue) {
    return binToHex(pack(firstFormat, firstValue)) + (secondFormat ? binToHex(pack(secondFormat, SecondValue)) : '');
}

function intToHex(value) {
    if (value < 250) return intToHexHandler('C', value);
    else if (value < 65536) return intToHexHandler('C', 250, 'v', value);
    else if (value < 4294967296) return intToHexHandler('C', 251, 'V', value);
    else return intToHexHandler('C', 252, '@', value);
}

class Wallet {
    constructor(curve = 'secp256k1', keyPair = null, options = null) {
        if (!options || options === null){
            options = {};
        }
        this._keyPair = keyPair ? keyPair : curves[curve].genKeyPair(options);
        this.privateKeyRaw = this._keyPair.priv ? this._keyPair.getPrivate('hex') : null;
        this.publicKeyRaw = this._keyPair.getPublic('hex');
        this.privateKey = this.privateKeyRaw ? keyEncoders[curve].encodePrivate(this.privateKeyRaw, 'raw', 'der') : null;
        this.publicKey = keyEncoders[curve].encodePublic(this.publicKeyRaw, 'raw', 'der');
        this.address = Wallet.publicKeyToAddress(this.publicKeyRaw);
    }

    createTx({to, value, fee, nonce, data = ''}) {
        const dataHex = binToHex(data);
        const message = to.substr(2) + intToHex(value) + intToHex(fee) + intToHex(nonce) + intToHex(data.length) + dataHex;

        const hash = sha256(encHex.parse(message));
        const sign = this._keyPair.sign(hash.toString(encHex)).toDER('hex');

        return {
            to: to,
            value: String(value),
            fee: String(fee),
            nonce: String(nonce),
            data: dataHex,
            pubkey: this.publicKey,
            sign: sign
        }
    }

    toPEM() {
        return keyEncoders['secp256k1'].encodePrivate(this.privateKey, 'der', 'pem');
    }

    toEncryptedPEM(password) {
        return PEM.encrypt('EC', this.privateKey, password, 'AES-128-CBC');
    }

    static fromPEM(pem) {
        const privateKey = keyEncoders['secp256k1'].encodePrivate(pem, 'pem', 'der');
        return Wallet.fromPrivateKey(privateKey);
    }

    static fromEncryptedPEM(encryptedPEM, password) {
        const privateKey = PEM.decrypt(encryptedPEM, password);
        if (
            !(privateKey.length === 236 && privateKey.substr(0, 4) === '3074') &&
            !(privateKey.length === 242 && privateKey.substr(0, 4) === '3077')
        ) {
            throw new Error('Invalid key or password');
        }
        return Wallet.fromPrivateKey(privateKey);
    }

    static fromPrivateKey(privateKey) {
        privateKey = privateKey.replace(/^0x/, '');
        let curve = defaultCurve;
        if (privateKey.length > 66) {
            const keyPrefix = privateKey.substr(0, 4);
            switch (keyPrefix) {
                case '3074':
                    curve = 'secp256k1';
                    break;
                case '3077':
                    curve = 'secp256r1';
                    break;
            }
            privateKey = keyEncoders[curve].encodePrivate(privateKey, 'der', 'raw');
        }
        return new Wallet(curve, curves[curve].keyFromPrivate(privateKey, 'hex'));
    }

    static fromPublicKey(publicKey) {
        publicKey = publicKey.replace(/^0x/, '');
        let curve = defaultCurve;
        if (publicKey.length > 132) {
            const keyPrefix = privateKey.substr(0, 4);
            switch (keyPrefix) {
                case '3056':
                    curve = 'secp256k1';
                    break;
                case '3059':
                    curve = 'secp256r1';
                    break;
            }
            publicKey = keyEncoders[curve].encodePublic(publicKey, 'der', 'raw');
        }
        return new Wallet(curve, curves[curve].keyFromPublic(publicKey, 'hex'));
    }

    static publicKeyToAddress(publicKey) {
        const publicKeySha256 = sha256(encHex.parse(publicKey));
        const publicKeySha256Ripemd160 = '00' + ripemd160(publicKeySha256).toString();
        const publicKeySha256Ripemd160Sha256 = sha256(encHex.parse(publicKeySha256Ripemd160)).toString();
        const publicKeySha256Ripemd160Sha256Sha256 = sha256(encHex.parse(publicKeySha256Ripemd160Sha256)).toString();
        const address = '0x' + publicKeySha256Ripemd160 + publicKeySha256Ripemd160Sha256Sha256.substr(0, 8);
        return address;
    }
}

module.exports = Wallet;
