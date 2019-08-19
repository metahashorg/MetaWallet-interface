/**
 * @param {ViewConfig|{delegation: Delegation, wallet: Wallet=}} config
 * @constructor
 */
class DelegationNodeSubView extends View {
    constructor (config) {
        config = Object.assign(config, {
            type: VIEW_SUBVIEW,
            cssDisplayProp: "flex",
        });
        super(config, config);
        View.apply(this, arguments);
        /** @type {Delegation} */
        this.delegation = config.delegation;
        /** @type {Wallet} */
        this.wallet = config.wallet;
        /** @type {ServerNode} */
        this.node = config.node;
    }
    onStarted () {
        this.element.querySelector(".delegation-log-info-button").onclick = function () {
            showUnDelegate(this.app, {
                node: this.node,
                delegation: this.delegation
            });
        }.bind(this);
    }
    onShown () {
        this.update();
    }
    update () {
        this.element.setAttribute("delegation-tx", this.delegation.to);
        this.element.querySelector(".delegation-log-info-action-value span").innerHTML = this.delegation.count;
        this.element.querySelector(".delegation-log-info-value").innerHTML = this.delegation.wallet.currency.getBalance(this.delegation.value).fullSimpleString;
        this.element.querySelector(".delegation-log-info-wallet").innerHTML = this.delegation.wallet.getNameShort();
    }
}