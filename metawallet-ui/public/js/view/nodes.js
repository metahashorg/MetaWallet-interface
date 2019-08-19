/**
 * @param {ViewConfig} config
 * @constructor
 */
class NodesView extends View {
    constructor (config) {
        config = Object.assign(config, {
            dataSelector: "view.nodes"
        });
        super(config, config);
        View.apply(this, arguments);
        /**
         * @type {HTMLElement|xD}
         * @private
         */
        this._nodesWrapper = xD(this.element.qs("nodes.list"));
        /**
         * @type {HTMLElement|xD}
         * @private
         */
        this._nodeTemplate = xD(this.element.qs("node.template"));
        /**
         * @type {Object<string, NodeSubView>}
         * @private
         */
        this._nodeSubViews = {};
        /** @type {Object<string, ServerNode>} */
        this.nodes = {};
    }
    onStarted () {
        this.loadNodes();
        /** @type {HTMLElement|xD} */
        this.searchElement = this.element.qs("nodes.search");
        this.searchElement.value = "";
        this.searchElement.onkeyup = function ( /** @type {KeyboardEvent} */ event) {
            this.searchNodes(event);
        }.bind(this);
        /** @type {HTMLElement|xD} */
        let nodesFilterRecommended = this.element.qs("nodes.filter.recommended");
        /** @type {HTMLElement|xD} */
        let nodesFilterAll = this.element.qs("nodes.filter.all");
        nodesFilterRecommended.classList.add("active");
        nodesFilterAll.classList.remove("active");
        nodesFilterRecommended.onclick = function () {
            nodesFilterRecommended.classList.add("active");
            nodesFilterAll.classList.remove("active");
            this.clearNodesSubViews();
            this.nodes = this.app.nodesCollection.getRecomendedNodes();
            this.drawNodesSubViews();
        }.bind(this);
        nodesFilterAll.onclick = function () {
            nodesFilterRecommended.classList.remove("active");
            nodesFilterAll.classList.add("active");
            this.clearNodesSubViews();
            this.nodes = this.app.nodesCollection.getNodes();
            this.drawNodesSubViews();
        }.bind(this);
        /**
         * @type {HTMLElement|xD}
         * @private
         */
        this._walletNodesWrapper = xD(this.element.qs("nodes-wrapper"));
        /**
         * @type {HTMLElement|xD}
         * @private
         */
        this._walletNodesGradient = xD(this.element.qs("nodes-wrapper-gradient"));
        this._walletNodesWrapper.addEventListener("scroll", this.onScroll.bind(this), false);
    }
    onStopped () {
        this._walletNodesWrapper.removeEventListener("scroll", this.onScroll.bind(this), false);
        this.clearNodesSubViews();
    }
    /**
     * @param {Event} e
     */
    onScroll (e) {
        let scrollTopCurrent = parseInt(e.target.scrollTop);
        this._walletNodesGradient.style.opacity = String((scrollTopCurrent >= 10) ? Math.min((scrollTopCurrent - 10) / 10, 1) : 0);
    }
    loadNodes () {
        this.app.nodesCollection.loadNodes().then(function () {
            this.nodes = this.app.nodesCollection.getRecomendedNodes();
            this.drawNodesSubViews();
        }.bind(this));
    }
    /**
     * @param {KeyboardEvent=} event
     */
    searchNodes (event) {
        let value = this.searchElement.value.trim();
        if (!value.length) {
            for (let node of Object.values(this.nodes)) {
                this._nodeSubViews[node.address].show();
            }
            return;
        }
        for (let node of Object.values(this.nodes)) {
            if (node.search(value)) {
                this._nodeSubViews[node.address].show();
            } else {
                this._nodeSubViews[node.address].hide();
            }
        }
    }
    clearNodesSubViews () {
        for (let nodeSubView of Object.values(this._nodeSubViews)) {
            nodeSubView.element.parentNode.removeChild(nodeSubView.element);
        }
        this._nodeSubViews = {};
    }
    drawNodesSubViews () {
        this.clearNodesSubViews();
        /** @type {ServerNode>} */
        for (let node of Object.values(this.nodes)) {
            let nodeSubView = this.getNodeSubView(node);
            this._nodeSubViews[node.address] = nodeSubView;
            this._nodesWrapper.appendChild(nodeSubView.element);
            if (node.online) {
                nodeSubView.show();
            }
        }
    }
    /**
     * @param {Node} node
     * @return {NodeSubView}
     */
    getNodeSubView (node) {
        /** @type {HTMLElement} */
        let template = this._nodeTemplate.cloneNode(true);
        template.removeAttribute("data-selector");
        /** @type {NodeSubView} */
        let nodeSubView = new NodeSubView({
            app: this.app,
            element: template,
            node: node
        });
        nodeSubView.start();
        return nodeSubView;
    }
}