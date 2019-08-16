/**
 * @param {ViewConfig} config
 * @constructor
 */
function CurrenciesView (config) {
    config = Object.assign(config, {
        dataSelector: "view.currencies",
        clone: true
    });

    View.apply(this, arguments);
}

extendFunction(CurrenciesView, View);

CurrenciesView.TAB_CURRENCIES = 1;
CurrenciesView.TAB_WALLETS = 2;
CurrenciesView.TABS = [CurrenciesView.TAB_CURRENCIES, CurrenciesView.TAB_WALLETS];

CurrenciesView.prototype.onStarted = function () {
    this["eventListener.WalletCollection.onLoaded"] = function () {
        this.drawCurrencySubViews();
        this.drawWalletSubViews();
        this.headerSubView.update();
        this._pullToRefresh.hideAnim();
        this._pullToRefresh2.hideAnim();
    }.bind(this);
    Events.addListener("WalletCollection.onLoaded", this["eventListener.WalletCollection.onLoaded"], this);

    this["eventListener.WalletCollection.onRatesHistoryLoaded"] = function () {
        this.drawCurrencySubViews();
        this.drawWalletSubViews();
        this.headerSubView.update();
    }.bind(this);
    Events.addListener("WalletCollection.onRatesHistoryLoaded", this["eventListener.WalletCollection.onRatesHistoryLoaded"], this);

    /**
     * @type {HTMLElement|xD}
     * @private
     */
    this._currenciesWrapper = xD(this.element.querySelector(".home-currency-list"));

    /**
     * @type {HTMLElement|xD}
     * @private
     */
    this._currencyTemplate = xD(this.element.qs("currency-template"));

    /**
     * @type {Object<string, CurrencySubView>}
     * @private
     */
    this._currencySubViews = {};

    /**
     * @type {HTMLElement|xD}
     * @private
     */
    this._walletsWrapper = xD(this.element.querySelector(".home-wallet-list"));

    /**
     * @type {HTMLElement|xD}
     * @private
     */
    this._walletTemplate = xD(this.element.qs("wallet-template"));

    /**
     * @type {Object<string, WalletSubView>}
     * @private
     */
    this._walletSubViews = {};

    /**
     * @type {PullToRefresh}
     * @private
     */
    this._pullToRefresh = new PullToRefresh({
        app: this.app,
        selector: this.element.querySelector(".home-currency-list-wrapper"),
        spinnerTop: 277,
        topCallback: function () {
            this.app.walletCollection.load(true);
        }.bind(this),
        callbackTimeout: 1000,
        fixBounce: {
            pageElement: this.element.querySelector(".page-inner"),
            outerElement: this.element.querySelector(".home-currency-list-wrapper"),
            innerElement: this._currenciesWrapper
        }
    });

    /**
     * @type {PullToRefresh}
     * @private
     */
    this._pullToRefresh2 = new PullToRefresh({
        app: this.app,
        selector: this.element.querySelector(".home-wallet-list-wrapper"),
        spinnerTop: 277,
        topCallback: function () {
            this.app.walletCollection.load(true);
        }.bind(this),
        callbackTimeout: 1000,
        fixBounce: {
            pageElement: this.element.querySelector(".page-inner"),
            outerElement: this.element.querySelector(".home-wallet-list-wrapper"),
            innerElement: this._walletsWrapper
        }
    });

    this.initTabs();

    /** @type {HeaderSubView} */
    this.headerSubView = new HeaderSubView(/** @type {ViewConfig} */ {app: this.app, element: this.element.qs("header"), view: this.view});
    this.headerSubView.start();
    this.headerSubView.show();

    if (this.app.walletCollection.load()) {
        this._pullToRefresh.showAnim();
    }
};

CurrenciesView.prototype.onStopped = function () {
    Events.removeListener("WalletCollection.onLoaded", this["eventListener.WalletCollection.onLoaded"], this);
    Events.removeListener("WalletCollection.onRatesHistoryLoaded", this["eventListener.WalletCollection.onRatesHistoryLoaded"], this);

    this._pullToRefresh.remove();
    this.clearCurrencySubViews();
    this._pullToRefresh2.remove();
    this.clearWalletSubViews();
};

CurrenciesView.prototype.onBeforeHidden = function () {
    // this._pullToRefresh.resetScroll(); // need to do it here because when DIV is "display: none" scroll can not be adjusted
    // this._pullToRefresh2.resetScroll();
};

CurrenciesView.prototype.onShown = function () {
    this.drawCurrencySubViews();
    this._pullToRefresh.fixBounce();

    this.drawWalletSubViews();
    this._pullToRefresh2.fixBounce();

    this.updateCharts();

    bridgeCallHandler("getView")
        .then(function (data) {
            if (data.view === "MetaPayAlertView") {
                showMetaPay(this.app, data.params);
                return;
            }
            let view = new window[data.view](/** @type {ViewConfig} */ Object.assign({app: this.app}, data.params || {}));
            switch (view.type) {
                case VIEW_PAGE:
                    this.app.switchView(view);
                    break;
                case VIEW_ALERT:
                    this.app.alertView(view);
                    break;
            }
        }.bind(this))
        .catch(function () {
            if (window.onDefaultViewShown && window.onDefaultViewShown.length) {
                window.onDefaultViewShown.forEach(function (/** @type {Function} */callback) {
                    callback();
                });
                delete window.onDefaultViewShown;
            }
        });

    this.app.showTutorial();
};

CurrenciesView.prototype.initTabs = function () {
    /** @type {Object<number, TabConfig>} */
    let tabs = {};
    tabs[CurrenciesView.TAB_CURRENCIES] = {
        id: CurrenciesView.TAB_CURRENCIES,
        callback: function () {
            this._pullToRefresh.fixBounce();
            this.updateCurrencySubViewCharts();
        }.bind(this)
    };
    tabs[CurrenciesView.TAB_WALLETS] = {
        id: CurrenciesView.TAB_WALLETS,
        callback: function () {
            this._pullToRefresh2.fixBounce();
        }.bind(this)
    };

    /** @type {TabsSubView} */
    this.tabsSubView = new TabsSubView({app: this.app, element: this.element, tabs: tabs});
    this.tabsSubView.start();
    this.tabsSubView.show();
};

// Currencies Tab

/**
 * Update currencies rates charts
 */
CurrenciesView.prototype.updateCharts = function () {
    if (this.app.walletCollection.history[this.app.walletCollection.mhcCurrency.code]) {
        this.headerSubView.update();
    }

    for (let currency of Object.values(this.app.walletCollection.currencies)) {
        if (!this.app.walletCollection.history[currency.code]) {
            continue;
        }
        this._currencySubViews[currency.code].update();
    }
};

CurrenciesView.prototype.clearCurrencySubViews = function () {
    for (let currencySubView of Object.values(this._currencySubViews)) {
        currencySubView.element.parentNode.removeChild(currencySubView.element);
    }
    this._currencySubViews = {};
};

CurrenciesView.prototype.drawCurrencySubViews = function () {
    /**
     * During initial render should apply fadeIn animation to blocks for ui smoothness
     * Afterwards should not do it to avoid blinking
     * @type {boolean}
     * @private
     */
    this.__firstDraw = typeof this.__firstDraw === "undefined";

    this.clearCurrencySubViews();

    for (let currency of Object.values(this.app.walletCollection.currencies)) {
        /** @type {CurrencySubView} */
        let currencySubView;
        if (!this._currencySubViews[currency.code]) {
            currencySubView = this.getCurrencySubView(currency);
            this._currencySubViews[currency.code] = currencySubView;
            this._currenciesWrapper.appendChild(currencySubView.element);
        } else {
            currencySubView = this._currencySubViews[currency.code];
        }
        currencySubView.show();
        currencySubView.update();
        if (this.__firstDraw) {
            TweenMax.fromTo(currencySubView.element, .1, {opacity: 0}, {opacity: 1});
        }
    }
    this.updateCurrencySubViewCharts(); // need redraw charts after element added to DOM

    this.__firstDraw = false;
    this._pullToRefresh.fixBounce();
};

CurrenciesView.prototype.updateCurrencySubViewCharts = function () {
    if (!this._currencySubViews.length) {
        return;
    }

    Object.values(this.app.walletCollection.currencies).forEach(function (/** @type {CurrencySubView} */ currencySubView) {
        currencySubView.update();
    });
};

/**
 * @param {Currency} currency
 * @return {CurrencySubView}
 */
CurrenciesView.prototype.getCurrencySubView = function (currency) {
    /** @type {CurrencySubView} */
    let currencySubView = new CurrencySubView({app: this.app, element: this._currencyTemplate.cloneNode(true), currency: currency});
    currencySubView.start();

    return currencySubView;
};

// Recent Wallets Tab

CurrenciesView.prototype.clearWalletSubViews = function () {
    for (let walletSubView of Object.values(this._walletSubViews)) {
        walletSubView.element.parentNode.removeChild(walletSubView.element);
    }
    this._walletSubViews = {};
};

CurrenciesView.prototype.drawWalletSubViews = function () {
    this.clearWalletSubViews();

    for (let wallet of this.app.walletCollection.getWalletsSortedByTime()) {
        if (this.app.settings.get("wallets.show") === WALLETS_SHOW_NATIVE && !wallet.nativeWallet) {
            continue;
        }

        /** @type {WalletSubView} */
        let walletSubView;
        if (!this._walletSubViews[wallet.address]) {
            walletSubView = this.getWalletSubView(wallet);
            this._walletSubViews[wallet.address] = walletSubView;
            this._walletsWrapper.appendChild(walletSubView.element);
        } else {
            walletSubView = this._walletSubViews[wallet.address];
        }
        walletSubView.show();
        walletSubView.update(); // need redraw charts after element added to DOM
    }

    this._pullToRefresh2.fixBounce();
};

/**
 * @param {Wallet} wallet
 * @return {WalletSubView}
 */
CurrenciesView.prototype.getWalletSubView = function (wallet) {
    /** @type {WalletSubView} */
    let walletSubView = new WalletSubView({app: this.app, element: this._walletTemplate.cloneNode(true), wallet: wallet});
    walletSubView.start();

    return walletSubView;
};
