const CryptoJS = require('crypto-js');

const ALGORITHMS = {
    'AES-256-CBC': {decrypt: decryptAES, encrypt: encryptAES, keyLength: 32, ivLength: 16},
    'AES-192-CBC': {decrypt: decryptAES, encrypt: encryptAES, keyLength: 24, ivLength: 16},
    'AES-128-CBC': {decrypt: decryptAES, encrypt: encryptAES, keyLength: 16, ivLength: 16},
    'DES-EDE3-CBC': {decrypt: decrypt3DES, encrypt: encrypt3DES, keyLength: 24, ivLength: 8},
    'DES-CBC': {decrypt: decryptDES, encrypt: encryptDES, keyLength: 8, ivLength: 8}
};

function encryptAES(dataHex, keyHex, ivHex) {
    return encryptGeneral(CryptoJS.AES, dataHex, keyHex, ivHex);
}

function encrypt3DES(dataHex, keyHex, ivHex) {
    return encryptGeneral(CryptoJS.TripleDES, dataHex, keyHex, ivHex);
}

function encryptDES(dataHex, keyHex, ivHex) {
    return encryptGeneral(CryptoJS.DES, dataHex, keyHex, ivHex);
}

function decryptAES(dataHex, keyHex, ivHex) {
    return decryptGeneral(CryptoJS.AES, dataHex, keyHex, ivHex);
}

function decrypt3DES(dataHex, keyHex, ivHex) {
    return decryptGeneral(CryptoJS.TripleDES, dataHex, keyHex, ivHex);
}

function decryptDES(dataHex, keyHex, ivHex) {
    return decryptGeneral(CryptoJS.DES, dataHex, keyHex, ivHex);
}

function decryptGeneral(f, dataHex, keyHex, ivHex) {
    const data = CryptoJS.enc.Hex.parse(dataHex);
    const key = CryptoJS.enc.Hex.parse(keyHex);
    const iv = CryptoJS.enc.Hex.parse(ivHex);
    const encrypted = {};
    encrypted.key = key;
    encrypted.iv = iv;
    encrypted.ciphertext = data;
    const decrypted = f.decrypt(encrypted, key, {iv: iv});
    return CryptoJS.enc.Hex.stringify(decrypted);
}

function encryptGeneral(f, dataHex, keyHex, ivHex) {
    const data = CryptoJS.enc.Hex.parse(dataHex);
    const key = CryptoJS.enc.Hex.parse(keyHex);
    const iv = CryptoJS.enc.Hex.parse(ivHex);
    const encryptedHex = f.encrypt(data, key, {iv: iv});
    return CryptoJS.enc.Base64.stringify(encryptedHex.ciphertext);
}

function parsePKCS5PEM(sPKCS5PEM) {
    const info = {};
    const matchResult1 = sPKCS5PEM.match(new RegExp('DEK-Info: ([^,]+),([0-9A-Fa-f]+)', 'm'));
    if (matchResult1) {
        info.cipher = matchResult1[1];
        info.ivSalt = matchResult1[2];
    }
    const matchResult2 = sPKCS5PEM.match(new RegExp('-----BEGIN ([A-Z]+) PRIVATE KEY-----'));
    if (matchResult2) {
        info.type = matchResult2[1];
    }
    let i1 = -1;
    let lenNEWLINE = 0;
    if (sPKCS5PEM.indexOf('\r\n\r\n') !== -1) {
        i1 = sPKCS5PEM.indexOf('\r\n\r\n');
        lenNEWLINE = 2;
    }
    if (sPKCS5PEM.indexOf('\n\n') !== -1) {
        i1 = sPKCS5PEM.indexOf('\n\n');
        lenNEWLINE = 1;
    }
    const i2 = sPKCS5PEM.indexOf('-----END');
    if (i1 !== -1 && i2 !== -1) {
        info.data = sPKCS5PEM.substring(i1 + lenNEWLINE * 2, i2 - lenNEWLINE).replace(/\s+/g, '');
    }
    return info;
}

function getKeyAndUnusedIvByPasscodeAndIvsalt(algorithm, password, ivSaltHex) {
    const saltHex = ivSaltHex.substring(0, 16);

    const salt = CryptoJS.enc.Hex.parse(saltHex);
    const data = CryptoJS.enc.Utf8.parse(password);

    const nRequiredBytes = ALGORITHMS[algorithm].keyLength + ALGORITHMS[algorithm].ivLength;
    let hexValueJoined = '';
    let lastValue = null;
    for (; ;) {
        const hash = CryptoJS.algo.MD5.create();
        if (lastValue !== null) {
            hash.update(lastValue);
        }
        hash.update(data);
        hash.update(salt);
        lastValue = hash.finalize();
        hexValueJoined = hexValueJoined + CryptoJS.enc.Hex.stringify(lastValue);
        if (hexValueJoined.length >= nRequiredBytes * 2) {
            break;
        }
    }
    const result = {};
    result.keyHex = hexValueJoined.substr(0, ALGORITHMS[algorithm].keyLength * 2);
    result.ivHex = hexValueJoined.substr(ALGORITHMS[algorithm].keyLength * 2, ALGORITHMS[algorithm].ivLength * 2);
    return result;
}

function decryptKeyB64(privateKeyB64, algorithm, sharedKeyHex, ivSaltHex) {
    const privateKeyWA = CryptoJS.enc.Base64.parse(privateKeyB64);
    const privateKeyHex = CryptoJS.enc.Hex.stringify(privateKeyWA);
    const f = ALGORITHMS[algorithm].decrypt;
    return f(privateKeyHex, sharedKeyHex, ivSaltHex);
}

function encryptKeyHex(privateKeyHex, algorithm, sharedKeyHex, ivSaltHex) {
    const f = ALGORITHMS[algorithm].encrypt;
    return f(privateKeyHex, sharedKeyHex, ivSaltHex);
}

class PEM {
    static encrypt(pemHead, privateKey, password, algorithm = 'AES-256-CBC') {
        if (typeof ALGORITHMS[algorithm] == 'undefined') {
            throw 'Unsupported algorithm: ' + algorithm;
        }

        const ivLength = ALGORITHMS[algorithm].ivLength;
        const ivSaltHex = CryptoJS.enc.Hex.stringify(CryptoJS.lib.WordArray.random(ivLength)).toUpperCase();

        const sharedKeyInfo = getKeyAndUnusedIvByPasscodeAndIvsalt(algorithm, password, ivSaltHex);
        const sharedKeyHex = sharedKeyInfo.keyHex;

        const encryptedKeyB64 = encryptKeyHex(privateKey, algorithm, sharedKeyHex, ivSaltHex);

        const pemBody = encryptedKeyB64.replace(/(.{64})/g, '$1\r\n');

        return '-----BEGIN ' + pemHead + ' PRIVATE KEY-----\r\n'
            + 'Proc-Type: 4,ENCRYPTED\r\n'
            + 'DEK-Info: ' + algorithm + ',' + ivSaltHex + '\r\n'
            + '\r\n'
            + pemBody
            + '\r\n-----END ' + pemHead + ' PRIVATE KEY-----\r\n';
    }

    static decrypt(encryptedPEM, password) {
        const info = parsePKCS5PEM(encryptedPEM);
        const sharedKeyAlgName = info.cipher;
        const ivSaltHex = info.ivSalt;
        const privateKeyB64 = info.data;

        const sharedKeyInfo = getKeyAndUnusedIvByPasscodeAndIvsalt(sharedKeyAlgName, password, ivSaltHex);
        const sharedKeyHex = sharedKeyInfo.keyHex;

        return decryptKeyB64(privateKeyB64, sharedKeyAlgName, sharedKeyHex, ivSaltHex);
    }
}

module.exports = PEM;
