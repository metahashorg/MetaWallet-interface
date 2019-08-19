/**
 * @param {{
 *     to: string,
 *     value: number,
 *     tx: string,
 *     wallet: Wallet,
 * }} delegationConfig
 * @constructor
 */
class Delegation {
    constructor (delegationConfig) {
        // console.log("+Delegation", delegationConfig);
        /** @type {Wallet} */
        this.wallet = delegationConfig.wallet;
        /** @type {string} */
        this.to = delegationConfig.state.to;
        /** @type {number} */
        this.value = delegationConfig.state.value;
        /** @type {string} */
        this.tx = delegationConfig.state.tx;
        /** @type {number} */
        this.count = 1;
    }
}