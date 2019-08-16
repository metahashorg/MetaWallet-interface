/**
 * @param {{
 *     app: MetaWallet
 * }} config
 * @constructor
 */
function NodeCollection (config) {
    console.log("+NodeCollection", config);

    /**
     * @type {Object}
     * @private
     */
    this._config = config;

    /** @type {MetaWallet} */
    this.app = config.app;

    /** @type {Object<string, ServerNode>} */
    this.nodes = {};

    /** @type {Object<string, string>} */
    this.nodeNames = {};

    /**
     * @type {bool}
     * @private
     */
    this._nodesLoaded = false;
}

NodeCollection.prototype.loadNodes = function () {

    return new Promise(function (resolve, reject) {
        if (this._nodesLoaded){
            resolve();
            return;
        }

        // @info подставлять реальную сеть для разных монет
        apiXhr(getJsonRpcXhrParams("node.list", {params: {net: "main"}}))
            .then(function (response) {
                if (response.result === API_OK) {
                    for (let nodeConfig of response.data) {
                        // nodeConfig.sort = parseFloat(nodeConfig.sort);
                        let node = new ServerNode(nodeConfig);
                        this.nodes[node.address] = node;
                        this.nodeNames[node.address] = node.name;
                    }

                    this.app.nodeCollection = this;
                    this._nodesLoaded = true;
                    resolve();
                }
            }.bind(this));

    }.bind(this));
};

/**
 * @param {number=} currencyId
 * @return {Array<Wallet>}
 */
NodeCollection.prototype.getNodesSortedByDefault = function (currencyId) {

    /** @type {Array<ServerNode>} */
    let nodes = [];
    Object.values(this.nodes).forEach(function (/** @type {ServerNode} */ node) {
        nodes.push(node);
    });

    return nodes.sort((a, b) => b.sort - a.sort);
};

/**
 * @return {Array<Wallet>}
 */
NodeCollection.prototype.getNodes = function () {

    /** @type {Array<ServerNode>} */
    let nodes = [];
    Object.values(this.nodes).forEach(function (/** @type {ServerNode} */ node) {
        nodes.push(node);
    });

    return nodes;
};

/**
 * @return {Array<Wallet>}
 */
NodeCollection.prototype.getRecomendedNodes = function () {

    /** @type {Array<ServerNode>} */
    let nodes = [];
    Object.values(this.nodes).forEach(function (/** @type {ServerNode} */ node) {
        nodes.push(node);
    });

    return nodes.filter((n)=>{
        // @info надо уточнить
        return n.balance.delegated >= PROXYNODE_BALANCE_START && !n.fake && n.online && (PROXYNODE_HARDCAP - PROXYNODE_HARDCAP_SOFT - n.balance.delegated) > 0;// && n.trust > 0.2; 
    } );
};
