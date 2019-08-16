const ethereumjsWallet = require('ethereumjs-wallet');
const EthereumTx = require('ethereumjs-tx').Transaction;
const Web3 = require('web3');
const ABIERC20 = require('./ERC20.json');

class Wallet {
    constructor(wallet = null) {
        this._wallet = wallet ? wallet : ethereumjsWallet.generate();
        this.privateKey = this._wallet._privKey ? this._wallet.getPrivateKeyString() : null;
        this.publicKey = this._wallet.getPublicKeyString();
        this.address = this._wallet.getChecksumAddressString();
    }

    createTx({from, to, value, data, gasPrice, gasLimit, nonce}) {
        const txParams = {
            from,
            to,
            value,
            data,
            gasPrice,
            gasLimit,
            nonce
        };
        const tx = new EthereumTx(txParams);
        const privateKey = Buffer.from(this.privateKey.replace(/^0x/, ''), 'hex');
        tx.sign(privateKey);
        return '0x' + tx.serialize().toString('hex');
    }

    createERC20TransferTx({contract, from, to, value, gasPrice, gasLimit, nonce}) {
        const web3 = new Web3();
        const erc20 = new web3.eth.Contract(ABIERC20);
        const data = erc20.methods.transfer(to, value).encodeABI();

        const txParams = {
            from,
            to: contract,
            data,
            gasPrice,
            gasLimit,
            nonce
        };
        const tx = new EthereumTx(txParams);
        const privateKey = Buffer.from(this.privateKey.replace(/^0x/, ''), 'hex');
        tx.sign(privateKey);
        return '0x' + tx.serialize().toString('hex');
    }

    toV3JSON(password) {
        return this._wallet.toV3String(password);
    }

    static fromV3JSON(json, password) {
        const wallet = ethereumjsWallet.fromV3(json, password);
        return new Wallet(wallet);
    }

    static fromPrivateKey(privateKey) {
        privateKey = privateKey.replace(/^0x/, '');
        const wallet = ethereumjsWallet.fromPrivateKey(Buffer.from(privateKey, 'hex'));
        return new Wallet(wallet);
    }

    static fromPublicKey(publicKey) {
        publicKey = publicKey.replace(/^0x/, '');
        const wallet = ethereumjsWallet.fromPublicKey(Buffer.from(publicKey, 'hex'));
        return new Wallet(wallet);
    }

    static publicKeyToAddress(publicKey) {
        publicKey = publicKey.replace(/^0x/, '');
        const wallet = ethereumjsWallet.fromPublicKey(Buffer.from(publicKey, 'hex'));
        return wallet.getChecksumAddressString();
    }
}

module.exports = Wallet;
