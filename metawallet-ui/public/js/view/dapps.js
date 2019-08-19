/**
 * @param {ViewConfig} config
 * @constructor
 */
class DAppsView extends View {
    constructor (config) {
        config = Object.assign(config, {
            dataSelector: "view.dapps"
        });
        super(config, config);
        View.apply(this, arguments);
    }

    onStarted () {
        /** @type {HTMLElement} */
        this.pageWrapper = this.element.querySelector(".page-wrapper");
        /** @type {HTMLElement} */
        this.searchWrapper = this.element.querySelector(".support-search");
        this.searchWrapper.classList.remove("fixed");
        this.searchWrapperOffsetTop = 0;
        /** @type {HTMLElement} */
        this.searchBorder = this.searchWrapper.querySelector(".support-search__bottom-border");
        this.searchBorder.style.opacity = "0";
        /** @type {HTMLElement} */
        this.navbarTitle = this.element.querySelector(".page-nav-center");
        this.navbarTitle.style.opacity = "0";
        this.pageWrapper.addEventListener("scroll", this.onScroll.bind(this), false);
        /** @type {HTMLElement|xD} */
        this.searchElement = this.element.qs("dapps.search");
        this.searchElement.onkeyup = function ( /** @type {KeyboardEvent} */ event) {
            this.searchDApps(event);
        }.bind(this);
        /**
         * @type {HTMLElement|xD}
         * @private
         */
        this._dappsWrapper = xD(this.element.qs("dapps.list"));
        /**
         * @type {HTMLElement|xD}
         * @private
         */
        this._dappTemplate = xD(this.element.qs("dapps.template"));
        /**
         * @type {Object<string, DAppSubView>}
         * @private
         */
        this._dappSubViews = {};
        /** @type {Object<string, DApp>} */
        this.dapps = {};
        /** @type {number} */
        this._offset = 0;
        /** @type {number} */
        this._limit = 25;
        this.loadDApps();
    }
    onShown () {
        this.pageWrapper.scrollTop = 0;
    }
    onStopped () {
        this.pageWrapper.removeEventListener("scroll", this.onScroll.bind(this), false);
    }
    /**
     * @param {Event} e
     */
    onScroll (e) {
        // console.log(e);
        // reinit
        if (this.searchWrapperOffsetTop <= 0) {
            this.searchWrapperOffsetTop = this.searchWrapper.offsetTop;
        }
        let scrollTopCurrent = parseInt(e.target.scrollTop);
        let scrollTopPercent = Math.min(Math.max(scrollTopCurrent / this.searchWrapperOffsetTop, 0), 1);
        this.searchBorder.style.opacity = scrollTopPercent + "";
        this.searchWrapper.classList.toggle("fixed", scrollTopCurrent >= this.searchWrapperOffsetTop);
        this.navbarTitle.style.opacity = scrollTopCurrent >= 95 ? "1" : "0";
    }
    loadDApps () {
        // console.log("DAppsView.loadDApps");
        apiXhr(getJsonRpcXhrParams("dapps.list", {
                params: [{
                    offset: this._offset,
                    limit: this._limit
                }]
            }))
            .then(function (response) {
                if (response.result === API_OK) {
                    for (let dappConfig of response.data.list) {
                        let dapp = new DApp(dappConfig);
                        this.dapps[dapp.address] = dapp;
                    }
                    this._offset += this._limit;
                    if (response.data.list.length === this._limit) {
                        this.loadDApps();
                    } else {
                        this.drawDAppSubViews();
                    }
                }
            }.bind(this));
    }
    /**
     * @param {KeyboardEvent=} event
     */
    searchDApps (event) {
        // console.log("DAppsView.searchDApps");
        let value = this.searchElement.value.trim();
        if (this.pageWrapper.scrollTop > 175) {
            this.pageWrapper.scrollTo(0, 175);
        }
        if (!value.length) {
            for (let dapp of Object.values(this.dapps)) {
                this._dappSubViews[dapp.address].show();
            }
            return;
        }
        for (let dapp of Object.values(this.dapps)) {
            if (dapp.search(value)) {
                this._dappSubViews[dapp.address].show();
            } else {
                this._dappSubViews[dapp.address].hide();
            }
        }
    }
    clearDAppSubViews () {
        // console.log("DAppsView.clearDAppSubViews");
        for (let dappSubView of Object.values(this._dappSubViews)) {
            dappSubView.element.parentNode.removeChild(dappSubView.element);
        }
        this._dappSubViews = {};
    }
    drawDAppSubViews () {
        // console.log("DAppsView.drawDAppSubViews");
        this.clearDAppSubViews();
        for (let dapp of Object.values(this.dapps)) {
            let dappSubView = this.getDAppSubView(dapp);
            this._dappSubViews[dapp.address] = dappSubView;
            this._dappsWrapper.appendChild(dappSubView.element);
            dappSubView.show();
        }
    }
    /**
     * @param {DApp} dapp
     * @return {DAppSubView}
     */
    getDAppSubView (dapp) {
        // console.log("DAppsView.getDAppSubView", dapp);
        /** @type {HTMLElement} */
        let template = this._dappTemplate.cloneNode(true);
        template.removeAttribute("data-selector");
        /** @type {DAppSubView} */
        let dappSubView = new DAppSubView({
            app: this.app,
            element: template,
            dapp: dapp
        });
        dappSubView.start();
        return dappSubView;
    }
}