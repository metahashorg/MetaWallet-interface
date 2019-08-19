/**
 * @param {{
 *     address: string,
 *     name: string,
 *     description: string,
 *     icon: string,
 *     keywords: string
 * }} nodeConfig
 * @constructor
 */
class ServerNode {
    constructor (nodeConfig) {
        // console.log("+ServerNode", nodeConfig);
        /**
         * @type {Object}
         * @private
         */
        // this._nodeConfig = nodeConfig;
        /** @type {string} */
        this.address = nodeConfig.address;
        /** @type {string} */
        this.name = nodeConfig.name;
        /** @type {string} */
        this.type = nodeConfig.type;
        /** @type {string} */
        this.balance = JSON.parse(nodeConfig.balance);
        /** @type {string} */
        this.bech = JSON.parse(nodeConfig.bench);
        /** @type {number} */
        this.status = parseFloat(nodeConfig.status);
        /** @type {string} */
        this.sort = nodeConfig.sort;
        /** @type {bool} */
        this.online = nodeConfig.online === 1;
        /** @type {bool} */
        this.fake = nodeConfig.fake;
        /** @type {number} */
        this.trust = parseFloat(nodeConfig.trust);
        /** @type {number} */
        this.avgRps = parseInt(nodeConfig.avgRps);
        /** @type {number} */
        this.roi = parseFloat(nodeConfig.roi);
        /** @type {Array<string>} */
        this._keywords = this.name.toLowerCase().split(" ").concat(this.address.toLowerCase().split(" "));
    }
    /**
     * @param {string} str
     * @return {boolean}
     */
    search (str) {
        str = str.toLowerCase();
        for (let keyword of this._keywords) {
            if (keyword.indexOf(str) !== -1) {
                return true;
            }
        }
        return false;
    }
    /**
     * @return {string}
     */
    getNodeName () {
        return this.name;
    }
    /**
     * @return {string}
     */
    getNodeStatusColor () {
        return this.online ? "green" : "red";
    }
    /**
     * @return {string}
     */
    getNodeLastCheck () {
        return this.online ? "Ok" : "Error";
    }
    /**
     * @return {string}
     */
    getDelegations () {
        return metawallet.walletCollection.mhcCurrency.getBalance(this.balance.delegated).fullSimpleString;
    }
    /**
     * @return {string}
     */
    getHargCap () {
        return metawallet.walletCollection.mhcCurrency.getBalance(Math.abs(PROXYNODE_HARDCAP - this.balance.delegated)).fullSimpleString + " to hardcap";
    }
    /**
     * @return {string}
     */
    getNodeStatusHardCapColor () {
        const hardCapBalance = PROXYNODE_HARDCAP - this.balance.delegated;
        let color = "color-green-2";
        if (hardCapBalance < PROXYNODE_HARDCAP_SOFT && hardCapBalance > 0) {
            color = "color-yellow";
        } else if (hardCapBalance <= 0) {
            color = "color-red";
        }
        return color;
    }
    /**
     * @return {string}
     */
    getNodeGeo () {
        return __("node.geo." + this.bech.geo || "unknown");
    }
}