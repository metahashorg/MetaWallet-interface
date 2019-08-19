/**
 * @param {ViewConfig|{node: ServerNode}} config
 * @constructor
 */
class NodeSubView extends View {
    constructor (config) {
        config = Object.assign(config, {
            type: VIEW_SUBVIEW
        });
        super(config, config);
        View.apply(this, arguments);
        /** @type {ServerNode} */
        this.node = config.node;
    }
    onStarted () {
        this.element.onclick = function () {
            this.app.pushView(new NodeView( /** @type {ViewConfig} */ {
                    app: this.app,
                    node: this.node
                }))
                .then(function ( /** @type {Transfer} */ transfer) {
                    metawallet.alertView(new TransactionView( /** @type {ViewConfig} */ {
                        app: this.app,
                        wallet: transfer.wallet,
                        transfer: transfer
                    }));
                }.bind(this))
                .catch(function (e) {
                    console.log("NodeSubView.NodeView", e);
                });
        }.bind(this);
    }
    onShown () {
        this.update();
    }
    update () {
        this.element.setAttribute("data-dapp-address", this.node.address);
        this.element.querySelector(".wallet-node-title").innerHTML = this.node.name;
        this.element.querySelector(".wallet-node-type").innerHTML = this.node.type.join();
        const nodeStatusClass = "wallet-delegation-status--" + this.node.getNodeStatusColor();
        this.element.querySelector(".wallet-delegation-status").classList.add(nodeStatusClass);
        this.element.querySelector(".wallet-node-value").innerHTML = this.node.getDelegations();
        let nodeDetailsElement = this.element.querySelector(".wallet-node-details");
        nodeDetailsElement.classList.remove("color-yellow", "color-red", "color-green-2");
        const nodeStatusHardCapClass = this.node.getNodeStatusHardCapColor();
        nodeDetailsElement.classList.add(nodeStatusHardCapClass);
        nodeDetailsElement.innerHTML = this.node.getHardCap();
    }
}