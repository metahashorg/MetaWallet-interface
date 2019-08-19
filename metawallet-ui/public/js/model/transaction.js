const TRANSACTION_DIRECTION_UNKNOWN = 0;
const TRANSACTION_DIRECTION_IN = 1;
const TRANSACTION_DIRECTION_OUT = 2;

const TRANSACTION_STATUS_UNKNOWN = 0;
const TRANSACTION_STATUS_PROGRESS = 10;
const TRANSACTION_STATUS_DONE = 20;
const TRANSACTION_STATUS_WRONG = 40;

const TRANSACTION_TYPE_BLOCK = "block";
const TRANSACTION_TYPE_FORGING = "forging";
const TRANSACTION_TYPE_PAYMENT = "payment";

/**
 * @param {{
 *     walletCollection: WalletCollection
 *     wallet: Wallet,
 *     transaction: MetaHashTransaction
 * }} config
 * @constructor
 */
class Transaction {
    constructor (config) {
        /**
         * @type {Object}
         * @private
         */
        this._config = config;
        /** @type {WalletCollection} */
        this.walletCollection = config.walletCollection;
        /** @type {?Wallet} */
        this.wallet = config.wallet || null;
        /** @type {string} */
        this.hash = config.transaction.transaction;
        /** @type {string} */
        this.from = config.transaction.from;
        /** @type {string} */
        this.to = config.transaction.to === ADDRESS_FORGING ? __("wallets.metahash.name." + config.transaction.to) : config.transaction.to;
        /** @type {number} */
        this.value = config.transaction.value;
        /** @type {string} */
        this.data = config.transaction.data ? hex2ascii(config.transaction.data) : "";
        /** @type {?number} */
        this.direction = null;
        if (this.wallet) {
            this.direction = this.to === this.wallet.address ? TRANSACTION_DIRECTION_IN : (this.from === this.wallet.address ? TRANSACTION_DIRECTION_OUT : TRANSACTION_DIRECTION_UNKNOWN);
        }
        /** @type {number} */
        this.intStatus = config.transaction.intStatus;
        /** @type {number} */
        this.status = [20, 101, 102, 103, 104].indexOf(config.transaction.intStatus) !== -1 ?
            TRANSACTION_STATUS_DONE :
            (config.transaction.intStatus === TRANSACTION_STATUS_WRONG ? TRANSACTION_STATUS_WRONG : TRANSACTION_STATUS_UNKNOWN);
        /** @type {number} */
        this.time = parseInt(config.transaction.timestamp);
        /** @type {string} */
        this.type = config.transaction.type; // block, forging, payment
    }
    /**
     * @return {Balance}
     */
    getBalance () {
        return this.wallet.currency.getBalance(this.value);
    }
    /**
     * @return {string}
     */
    getName () {
        // console.log("Transaction", this._config.transaction.to, this.intStatus, this.data);
        if (this._config.transaction.to === ADDRESS_FORGING && this.intStatus === 20 && this.data.match(/(method)/)) {
            const delegateInfo = JSON.parse(this.data);
            if (delegateInfo.method === "delegate") {
                return delegateInfo.params.value === "100000000" ? __("transaction.metahash.name.forging") : __("transaction.metahash.name.forging.active");
            }
            if (delegateInfo.method === "undelegate") {
                return __("transaction.metahash.name.forging.stop");
            }
        }
        return this.intStatus ? __("transaction.metahash.name." + this.intStatus) : "";
    }
}