/**
 * @param {ViewConfig|{wallet: Wallet}} config
 * @constructor
 */
class DelegationsView extends View {
    constructor (config) {
        config = Object.assign(config, {
            dataSelector: "view.delegations",
        });
        super(config, config);
        View.apply(this, arguments);
        /** @type {Wallet} */
        this.wallet = config.wallet;
        /**
         * @type {HTMLElement|xD}
         * @private
         */
        this._delegationsWrapper = xD(this.element.qs("delegations"));
        /**
         * @type {HTMLElement|xD}
         * @private
         */
        this._delegationsTemplate = xD(this.element.qs("subview.delegations"));
        /**
         * @type {Object<string, DelegationSubView>}
         * @private
         */
        this._delegationSubViews = {};
        this.wallet.getDelegations();
    }
    onStarted () {
        /** @type {HTMLElement|xD} */
        this.walletBlockElement = this.element.qs("subview.walletcard");
        if (!this.wallet.privateKeyExists) {
            this.walletBlockElement.parentElement.classList.add("desaturated");
        } else {
            this.walletBlockElement.parentElement.classList.remove("desaturated");
        }
        /** @type {WalletCardSubView} */
        this.walletCardSubView = new WalletCardSubView({
            app: this.app,
            element: this.element.qs("subview.walletcard"),
            wallet: this.wallet
        });
        this.walletCardSubView.start();
        this.walletCardSubView.show();
        this.element.qs("actions.transfer").onclick = function () {
            showTransfer(this.app, this.wallet);
        }.bind(this);
        this.element.qs("actions.forging").onclick = function () {
            this.app.prevView();
        }.bind(this);
        this.element.qs("actions.qr").onclick = function () {
            this.app.alertView(new QrCodeAlertView( /** @type {ViewConfig} */ {
                app: this.app,
                wallet: this.wallet
            }));
        }.bind(this);
        this.element.qs("actions.allnodes").onclick = function () {
            this.app.pushView(new NodesView( /** @type {ViewConfig} */ {
                app: this.app
            }));
        }.bind(this);
        /** @type {ClipboardJS} */
        this._addressClipboard = new ClipboardJS(this.element.qs("actions.copyaddress"), {
            text: function () {
                return this.wallet.address;
            }.bind(this)
        });
        this._addressClipboard.on("success", function (e) {
            this.app.showNotification({
                text: __("common.copied"),
                type: NOTIFICATION_SUCCESS,
                feedback: FEEDBACK_LIGHT
            });
            e.clearSelection();
        }.bind(this));
        this["eventListener.Wallet.onDelegationsFetched"] = function (params) {
            if (params.wallet !== this.wallet) {
                return;
            }
            let emptyBlock = this.element.qs("empty-block");
            if (Object.keys(this.wallet.delegations).length === 0) {
                emptyBlock.show();
            } else {
                emptyBlock.hide();
                this.drawDelegationSubViews();
            }
        }.bind(this);
        Events.addListener("Wallet.onDelegationsFetched", this["eventListener.Wallet.onDelegationsFetched"], this);
        /**
         * @type {HTMLElement|xD}
         * @private
         */
        this._walletDelegationsWrapper = xD(this.element.qs("delegations-wrapper"));
        /**
         * @type {HTMLElement|xD}
         * @private
         */
        this._walletDelegationsGradient = xD(this.element.qs("delegations-wrapper-gradient"));
        this._walletDelegationsWrapper.addEventListener("scroll", this.onScroll.bind(this), false);
    }
    /**
     * @param {Event} e
     */
    onScroll (e) {
        let scrollTopCurrent = parseInt(e.target.scrollTop);
        this._walletDelegationsGradient.style.opacity = String((scrollTopCurrent >= 10) ? Math.min((scrollTopCurrent - 10) / 10, 1) : 0);
    }
    onShown () {
        this.walletCardSubView.show();
    }
    onStopped () {
        this.walletCardSubView.stop();
        this.clearDelegationSubViews();
        Events.removeListener("Wallet.onDelegationsFetched", this["eventListener.Wallet.onDelegationsFetched"], this);
        this._walletDelegationsWrapper.removeEventListener("scroll", this.onScroll.bind(this), false);
    }
    update () {
        this.walletCardSubView.update();
    }
    clearDelegationSubViews () {
        for (let delegationSubView of Object.values(this._delegationSubViews)) {
            delegationSubView.element.parentNode.removeChild(delegationSubView.element);
        }
        this._delegationSubViews = {};
    }
    drawDelegationSubViews () {
        this.clearDelegationSubViews();
        for (let delegation of Object.values(this.wallet.delegations)) {
            /** @type {DelegationSubView} */
            let delegationSubView;
            if (!this._delegationSubViews[delegation.tx]) {
                delegationSubView = this.getDelegationSubView(delegation);
                this._delegationSubViews[delegation.tx] = delegationSubView;
                this._delegationsWrapper.appendChild(delegationSubView.element);
            } else {
                delegationSubView = this._delegationSubViews[delegation.tx];
            }
            delegationSubView.show();
            delegationSubView.update();
        }
    }
    /**
     * @param {Delegation} delegation
     * @return {TransactionSubView}
     */
    getDelegationSubView (delegation) {
        /** @type {HTMLElement} */
        let template = this._delegationsTemplate.cloneNode(true);
        template.removeAttribute("data-selector");
        /** @type {DelegationSubView} */
        let delegationSubView = new DelegationSubView({
            app: this.app,
            element: template,
            delegation: delegation,
            wallet: this.wallet
        });
        delegationSubView.start();
        return delegationSubView;
    }
}