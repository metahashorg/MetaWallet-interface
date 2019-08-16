/**
 * @param {ViewConfig|{node: ServerNode}} config
 * @constructor
 */
function NodeView (config) {
    config = Object.assign(config, {
        dataSelector: "view.node"
    });

    View.apply(this, arguments);

    /** @type {ServerNode} */
    this.node = config.node;

        /**
     * @type {HTMLElement|xD}
     * @private
     */
    this._delegationsWrapper = xD(this.element.qs("delegations.list"));

    /**
     * @type {HTMLElement|xD}
     * @private
     */
    this._delegationTemplate = xD(this.element.qs("delegation.template"));

    /**
     * @type {Object<string, DelegationNodeSubView>}
     * @private
     */
    this._delegationSubViews = {};

    /** @type {Object<string, Delegation>} */
    this.delegations = [];
}

extendFunction(NodeView, View);

NodeView.prototype.onStarted = function () {
    this.update();
};

NodeView.prototype.onStopped = function () {
    this.clearDelegationSubViews();
};

NodeView.prototype.update = function () {
    this.element.setAttribute("data-dapp-address", this.node.address);

    this.element.querySelector(".page-nav-center").innerHTML = BlockchainLib.hashCollapse(this.node.address);
    this.element.querySelector(".wallet-node-title").innerHTML = this.node.name;
    this.element.querySelector(".wallet-node-value").innerHTML = this.node.getDelegations();

    const nodeStatusClass = "wallet-delegation-status--" + this.node.getNodeStatusColor();
    this.element.querySelector(".wallet-delegation-status").classList.add(nodeStatusClass);

    let nodeDetailsElement = this.element.querySelector(".wallet-node-details");
    nodeDetailsElement.classList.remove("color-yellow","color-red","color-green-2");
    const nodeStatusHardCapClass = this.node.getNodeStatusHardCapColor();
    nodeDetailsElement.classList.add(nodeStatusHardCapClass);
    nodeDetailsElement.innerHTML = this.node.getHargCap();

    this.element.qs("node-trust").innerHTML = this.node.trust;
    this.element.querySelector(".percent").style.width = (this.node.trust * 100).toString() + "%";

    this.element.qs("node-roi").innerHTML = this.node.roi;
    this.element.qs("node-geo").innerHTML = this.node.getNodeGeo();
    this.element.qs("node-avgRps").innerHTML = this.node.avgRps;
    this.element.qs("node-last-check").innerHTML = this.node.getNodeLastCheck();

    const walletWithDelegations = Object.values(this.app.walletCollection.wallets).filter( a => a.delegated > 0);
    // кошельки с делегироваными средствами
    if (walletWithDelegations.length > 0){

        let getDelegations = [];
        walletWithDelegations.forEach(wallet => {
            if(Object.keys(wallet.delegations).length === 0){
                getDelegations.push(wallet.getDelegations());
            }
        });

        Promise.all(getDelegations)
            .then(_ => {
                walletWithDelegations.forEach(wallet=>{
                    let currentNodeDelegations = wallet.delegationTransactions.filter( tx => tx.to === this.node.address );
                    currentNodeDelegations.forEach(transaction => {
                        this.delegations.push(transaction);
                    });
                });

                this.drawDelegationSubViews();
            });
    }

    this.element.qs("actions.delegate").onclick = function () {
        // тут промис
        showDelegate(this.app, {node: this.node, currencyId: CURRENCY_ID_MHC});
    }.bind(this);

    this.element.qs("actions.undelegateall").onclick = function () {
        this.app.showNotification({
            text: __( "error.notavailable" ),
            type: "warning",
        });
    }.bind(this);

    this.element.qs("actions.info").onclick = function () {
        bridgeCallHandler("openUrl", {url: EXPLORER_ENDPOINT_ADDRESS[CURRENCY_ID_MHC] + this.node.address});
    }.bind(this);
};

NodeView.prototype.clearDelegationSubViews = function () {
    for (let delegationSubView of Object.values(this._delegationSubViews)) {
        delegationSubView.element.parentNode.removeChild(delegationSubView.element);
    }
    this._delegationSubViews = {};
};

NodeView.prototype.drawDelegationSubViews = function () {
    this.clearDelegationSubViews();

    let delegations = {};
    /** @type {Delegation>} */
    for (let delegationItem of Object.values(this.delegations)) {
        if (!delegations[delegationItem.wallet.address]) {
            delegationItem.count = 1;
            delegations[delegationItem.wallet.address] = delegationItem;
        } else {
            delegations[delegationItem.wallet.address].count += 1;
            delegations[delegationItem.wallet.address].value += delegationItem.value;
        }
    }

    /** @type {Delegation>} */
    for (let delegation of Object.values(delegations)) {
        let delegationSubView = this.getDelegationSubView(delegation);
        this._delegationSubViews[delegation.tx] = delegationSubView;
        this._delegationsWrapper.appendChild(delegationSubView.element);

        delegationSubView.show();
        delegationSubView.update();
    }
};

/**
 * @param {Node} node
 * @return {NodeSubView}
 */
NodeView.prototype.getDelegationSubView = function (delegation) {

    /** @type {HTMLElement} */
    let template = this._delegationTemplate.cloneNode(true);
    template.removeAttribute("data-selector");

    /** @type {DelegationNodeSubView} */
    let delegationSubView = new DelegationNodeSubView({app: this.app, element: template, delegation: delegation, node: this.node});
    delegationSubView.start();

    return delegationSubView;
};
