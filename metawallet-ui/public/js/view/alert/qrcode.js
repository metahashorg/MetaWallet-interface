/**
 * @param {ViewConfig|{mode: number, wallet: Wallet}} config
 * @constructor
 */
function QrCodeAlertView (config) {
    config = Object.assign(config, {
        dataSelector: "view.alert.qrcode",
        type: VIEW_ALERT,
        cssDisplayProp: "flex"
    });

    View.apply(this, arguments);

    /** @type {Wallet} */
    this.wallet = config.wallet;

    /** @type {boolean} */
    this.pkPassword = false;
}

extendFunction(QrCodeAlertView, View);

QrCodeAlertView.prototype.onStarted = function () {
    xD(this.element.querySelector(".alert-body-card--qr-address")).show();
    xD(this.element.querySelector(".alert-body-card--qr-pk")).hide();
    this.element.querySelector(".alert-body-card--qr-address-slide-icon").classList.add("active");
    this.element.querySelector(".alert-body-card--qr-pk-slide-icon").classList.remove("active");

    if (this.wallet.privateKeyExists) {
        xD(this.element.qs("pk.exists")).show();
        xD(this.element.qs("pk.notexists")).hide();
    } else {
        xD(this.element.qs("pk.exists")).hide();
        xD(this.element.qs("pk.notexists")).show();
    }

    /** @type {HTMLCanvasElement|HTMLElement|xD} */
    this.addressQrElement = this.element.qs("address.canvas");

    /** @type {HTMLCanvasElement|HTMLElement|xD} */
    this.pkQrElement = this.element.qs("pk.canvas");

    /** @type {HTMLElement|xD} */
    this.pkQrWrapperElement = this.element.qs("pk.canvas.wrapper");
    this.pkQrWrapperElement.hide();

    /** @type {HTMLElement|xD} */
    this.pkFormElement = this.element.qs("pk.form");
    this.pkFormElement.show();
    this.pkFormElement.reset();

    this.element.qs("actions.saveaddressqr").onclick = function () {
        this.saveAddressQrCode();
    }.bind(this);

    this.element.qs("actions.savepkqr").onclick = function () {
        this.savePkQrCode();
    }.bind(this);

    this.element.qs("actions.showpkqr").onclick = function () {
        this.showPkQrCode();
    }.bind(this);

    // @todo
    makeDraggablePair(this.element, ".alert-body-2cards", ".alert-body-card--qr-address", ".alert-body-card--qr-pk");
    makeDraggablePair(this.element, ".alert-body-2cards", ".alert-body-card--qr-pk", ".alert-body-card--qr-address");
};

QrCodeAlertView.prototype.onShown = function () {
    this.drawQrCode(this.addressQrElement, this.wallet.address);
};

/**
 * @param {HTMLElement|xD} element
 * @param {string} value
 */
QrCodeAlertView.prototype.drawQrCode = function (element, value) {
    let size = ~~element.getBoundingClientRect().width || 226;
    element.width = size;
    element.height = size;

    this.qr = new QRious({
        element: element,
        value: qrBefore(value),
        size: size
    });
};

QrCodeAlertView.prototype.saveAddressQrCode = function () {
    bridgeCallHandler("shareImage", {data: this.addressQrElement.toDataURL()});
};

QrCodeAlertView.prototype.showPkQrCode = function () {
    if (this.loader) {
        return;
    }

    let formData = getFormData(this.pkFormElement);

    this.app.hideAllNotifications();

    /** @type {HTMLElement|xD} */
    let passwordInput = this.pkFormElement.querySelector("[name='password']");
    if (!formData["password"]) {
        this.app.showNotification({text: __("error.emptyfields"), type: NOTIFICATION_ERROR});
        passwordInput.classList.add(UI_FORM_INPUT_ERROR_CLASS);
        return;
    } else {
        passwordInput.classList.remove(UI_FORM_INPUT_ERROR_CLASS);
    }

    // this.loader = null;
    // if ([CURRENCY_ID_ETH, CURRENCY_ID_BTC].indexOf(this.wallet.currencyId) !== -1) {
    //     this.loader = this.app.showNotification({text: __("common.pleasewait"), type: NOTIFICATION_LOADING, hideTimeout: UI_ERROR_NOTIFICATION_NO_TIMEOUT});
    //     this.disallowPrev();
    // }
    showLoader(this);

    let cryptoWorker = new Worker("/js/worker/crypto.js");
    cryptoWorker.onmessage = function (/** @type {MessageEvent} */ event) {
        console.log("<- worker:", event.data);

        cryptoWorker.terminate();

        if (!event.data.result) {
            hideLoader(this);
            this.app.showNotification({text: __("error.wrongpassword"), type: NOTIFICATION_ERROR, hideTimeout: UI_ERROR_NOTIFICATION_LONG_TIMEOUT * 1000});
            passwordInput.classList.add(UI_FORM_INPUT_ERROR_CLASS);
            return;
        }

        /** @type {MetaHashWallet|EthereumWallet|BitcoinWallet} */
        let blockchainWallet = BlockchainLib.fromPrivateKey(this.wallet.currencyId, event.data.privateKey);

        hideLoader(this);

        passwordInput.blur();
        this.pkFormElement.hide();
        this.pkQrWrapperElement.show();

        /** @type {string} */
        let qrcode = "";
        switch (this.wallet.currencyId) {
            case CURRENCY_ID_MHC:
            case CURRENCY_ID_TMH:
                qrcode = event.data.privateKey;
                break;
            case CURRENCY_ID_ETH:
                qrcode = this.wallet.privateKey;
                break;
            case CURRENCY_ID_BTC:
                break;
        }

        this.drawQrCode(this.pkQrElement, qrcode);
    }.bind(this);

    cryptoWorker.postMessage({currencyId: this.wallet.currencyId, encryptedWallet: this.wallet.privateKey, password: formData["password"]});
};

QrCodeAlertView.prototype.savePkQrCode = function () {
    bridgeCallHandler("shareImage", {data: this.pkQrElement.toDataURL()});
};