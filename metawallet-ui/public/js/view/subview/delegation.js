/**
 * @param {ViewConfig|{delegation: Delegation, wallet: Wallet=}} config
 * @constructor
 */
function DelegationSubView (config) {
    config = Object.assign(config, {
        type: VIEW_SUBVIEW
    });

    View.apply(this, arguments);

    /** @type {Delegation} */
    this.delegation = config.delegation;

    /** @type {Wallet} */
    this.wallet = config.wallet;

    /** @type {ServerNode} */
    this.node = metawallet.nodeCollection.nodes[this.delegation.to] || null;
}

extendFunction(DelegationSubView, View);

DelegationSubView.prototype.onStarted = function () {
    this.element.onclick = function () {
        this.app.pushView(new NodeView(/** @type {ViewConfig} */ {app: this.app, node: this.node}));
    }.bind(this);
};

DelegationSubView.prototype.onShown = function () {
    this.update();
};

DelegationSubView.prototype.update = function () {
    this.element.setAttribute("node-address", this.delegation.to);

    this.element.querySelector(".wallet-delegation-title").innerHTML = this.node.getNodeName();
    this.element.querySelector(".wallet-delegation-value").innerHTML = this.wallet.currency.getBalance(this.delegation.value).fullSimpleString;

    const nodeStatusClass = "wallet-delegation-status--" + this.node.getNodeStatusColor();
    this.element.querySelector(".wallet-delegation-status").classList.add(nodeStatusClass);

    this.element.querySelector(".wallet-delegation-process").innerHTML = window.pluralize(this.delegation.count, "delegation");
};