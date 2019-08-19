/**
 * @param {ViewConfig|{currencyId: number, selectedAddress: string}} config
 * @constructor
 */
class WalletSelectAlertView extends View {
    constructor (config) {
        config = Object.assign(config, {
            dataSelector: "view.alert.selectwallet",
            type: VIEW_ALERT,
            cssDisplayProp: "flex"
        });
        super(config, config);
        View.apply(this, arguments);
        /** @type {number} */
        this.currencyId = config.currencyId;
        /** @type {string} */
        this.selectedAddress = config.selectedAddress || "";
        /**
         * @type {HTMLElement|xD}
         * @private
         */
        this._walletsWrapper = xD(this.element.qs("wallets"));
        /**
         * @type {HTMLElement|xD}
         * @private
         */
        this._walletTemplate = xD(this.element.qs("template.wallet"));
        /**
         * @type {Object<string, HTMLElement>}
         * @private
         */
        this._walletBlocks = {};
    }
    onStarted () {
        this.drawWalletBlocks();
    }
    onStopped () {
        this.clearWalletBlocks();
    }
    clearWalletBlocks () {
        // console.log("WalletsView.clearWalletBlocks");
        for (let walletBlock of Object.values(this._walletBlocks)) {
            walletBlock.parentNode.removeChild(walletBlock);
        }
        this._walletBlocks = {};
    }
    drawWalletBlocks () {
        // console.log("WalletsView.drawWalletBlocks");
        this.clearWalletBlocks();
        let wallets = this.app.walletCollection.getWalletsSortedByTime(this.currencyId);
        for (let wallet of wallets) {
            /** @type {HTMLElement} */
            let walletBlock = this.getWalletBlock(wallet);
            this._walletBlocks[wallet.address] = walletBlock;
            this._walletsWrapper.append(walletBlock);
        }
    }
    /**
     * @param {Wallet} wallet
     * @return {HTMLElement}
     */
    getWalletBlock (wallet) {
        // console.log("WalletsView.getWalletBlock", wallet);
        /** @type {HTMLElement|xD} */
        let walletBlock = xD(this._walletTemplate.cloneNode(true));
        walletBlock.removeAttribute("data-selector");
        walletBlock.qs("name").innerHTML = wallet.getName();
        walletBlock.qs("balance").innerHTML = wallet.getBalance().fullSimpleString;
        walletBlock.qs("checkbox").value = wallet.address;
        walletBlock.qs("checkbox").checked = this.selectedAddress === wallet.address;
        if (!wallet.privateKeyExists) {
            walletBlock.classList.add("disabled");
        }
        walletBlock.onclick = function () {
            if (wallet.privateKeyExists) {
                this._resolve(wallet);
            } else {
                this.app.showNotification({
                    text: __("error.pknotfound"),
                    type: NOTIFICATION_ERROR,
                    hideTimeout: UI_ERROR_NOTIFICATION_LONG_TIMEOUT * 1000
                });
            }
        }.bind(this);
        return walletBlock;
    }
}
