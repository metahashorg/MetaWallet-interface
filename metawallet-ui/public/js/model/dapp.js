/**
 * @param {{
 *     address: string,
 *     name: string,
 *     description: string,
 *     icon: string,
 *     keywords: string
 * }} dappConfig
 * @constructor
 */
class DApp {
    constructor (dappConfig) {
        // console.log("+DApp", dappConfig);
        /**
         * @type {Object}
         * @private
         */
        this._dappConfig = dappConfig;
        /** @type {string} */
        this.address = dappConfig.address;
        /** @type {string} */
        this.name = dappConfig.name;
        /** @type {string} */
        this.description = dappConfig.description;
        /** @type {string} */
        this.icon = dappConfig.icon;
        /** @type {string} */
        this.keywords = dappConfig.keywords;
        /** @type {Array<string>} */
        this._keywords = this.name.toLowerCase().split(" ").concat(this.description.toLowerCase().split(" "));
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
}