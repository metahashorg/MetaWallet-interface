/**
 * @param {ViewConfig|{wallet: Wallet}} config
 * @constructor
 */
class WalletCardSubView extends View {
    constructor (config) {
        config = Object.assign(config, {
            type: VIEW_SUBVIEW
        });
        super(config, config);
        View.apply(this, arguments);
        /** @type {Wallet} */
        this.wallet = config.wallet;
    }
    onStarted () {
        this["eventListener.WalletCollection.onLoaded"] = function () {
            this.update();
        }.bind(this);
        Events.addListener("WalletCollection.onLoaded", this["eventListener.WalletCollection.onLoaded"], this);
        this.update();
    }
    onStopped () {
        Events.removeListener("WalletCollection.onLoaded", this["eventListener.WalletCollection.onLoaded"], this);
    }
    update () {
        this.titleElement = this.element.querySelector(".wallet-block__title");
        if (this.titleElement) {
            this.titleElement.innerHTML = this.wallet.getName();
        }
        this.element.querySelector(".wallet-block__img").src = MetaHashLib.addressIcon(this.wallet.address);
        this.element.querySelector(".wallet-block__address").innerHTML = BlockchainLib.hashCollapse(this.wallet.address);
        this.element.querySelector(".wallet-block__amount-big").innerHTML = this.wallet.getBalance().integerLocaleString;
        this.element.querySelector(".wallet-block__amount-small").innerHTML = this.wallet.getBalance().decimal;
        this.element.querySelector(".wallet-block__amount-smaller").innerHTML = this.wallet.currency.ticker;
        this.element.querySelector(".wallet-block__amount-recalc").innerHTML = formatNum(this.wallet.getBaseCurrencyRecalc().recalc, -2) + " " + this.app.walletCollection.baseCurrency.ticker;
        if (this.wallet.currencyId !== CURRENCY_ID_MHC && this.wallet.currencyId !== CURRENCY_ID_TMH) {
            xD(this.element.qs("wallet.delegated").parentElement).hide();
        } else {
            xD(this.element.qs("wallet.delegated").parentElement).show();
            this.element.qs("wallet.delegated").innerHTML = this.wallet.getDelegated().localeString + " " + this.wallet.currency.ticker;
        }
    }
}