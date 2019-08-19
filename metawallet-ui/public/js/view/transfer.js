/**
 * @param {ViewConfig|{wallet: Wallet, metaPayParams: MetaPayParams, transferParams: TransferParams}} config
 * @constructor
 */
class TransferView extends View {
    constructor (config) {
        config = Object.assign(config, {
            dataSelector: "view.transfer",
            clone: true,
        });
        super(config, config);
        View.apply(this, arguments);
        /** @type {Wallet} */
        this.wallet = config.wallet;
        /** @type {?MetaPayParams} */
        this.metaPayParams = config.metaPayParams || null;
        /** @type {?TransferParams} */
        this.transferParams = config.transferParams || null;
        /** @type {Object<number, Object<{values: Object<string, string>, readonly: boolean}>>} */
        this.fees = {};
        this.fees[CURRENCY_ID_MHC] = {
            values: {
                "0.00": "0.00 #MHC",
                "0.01": "0.01 #MHC",
                "0.10": "0.10 #MHC",
                "0.30": "0.30 #MHC",
                "0.50": "0.50 #MHC",
                "1.00": "1.00 #MHC",
                "10.00": "10.00 #MHC",
            },
            readonly: true
        };
        this.fees[CURRENCY_ID_TMH] = this.fees[CURRENCY_ID_MHC];
        this.fees[CURRENCY_ID_ETH] = {
            values: {
                "1000000000": "1 Gwei",
                "5000000000": "5 Gwei",
                "10000000000": "10 Gwei",
                "15000000000": "15 Gwei",
                "20000000000": "20 Gwei",
                "50000000000": "50 Gwei",
                "75000000000": "75 Gwei",
                "100000000000": "100 Gwei",
            },
            readonly: false
        };
    }
    onStarted () {
        /** @type {WalletCardSubView} */
        this.walletCardSubView = new WalletCardSubView({
            app: this.app,
            element: this.element.qs("subview.walletcard"),
            wallet: this.wallet
        });
        this.walletCardSubView.start();
        this.walletCardSubView.show();
        /** @type {HTMLElement|xD} */
        this.formElement = this.element.qs("form.transfer");
        this.formElement.querySelectorAll("input").forEach(function ( /** @type {HTMLElement} */ element) {
            element.value = "";
            element.removeAttribute("readonly");
            element.classList.remove(UI_FORM_INPUT_ERROR_CLASS);
        });
        if (this.metaPayParams || this.transferParams) {
            let params = this.metaPayParams || this.transferParams;
            console.log("params", params);
            for (let param of ["to", "value", "data"]) {
                /** @type {HTMLElement|xD} */
                let element = this.element.qs("transfer." + param);
                if (params[param]) {
                    switch (param) {
                        case "value":
                            element.value = this.wallet.currency.getBalance(params.value).simpleString;
                            break;
                        case "to":
                            element.value = this.metaPayParams ? BlockchainLib.hashCollapse(params[param], 16) : params[param];
                            break;
                        default:
                            element.value = params[param];
                    }
                    if (this.metaPayParams) {
                        element.setAttribute("readonly", "readonly");
                        element.classList.add("form-control--empty");
                    }
                }
            }
        }
        /** @type {HTMLElement|xD} */
        let feeElement = this.element.qs("transfer.fee");
        /** @type {HTMLElement|xD} */
        let feeParent = xD(feeElement.parentElement.parentElement);
        /** @type {HTMLElement|xD} */
        let sendButton = this.element.qs("actions.send");
        sendButton.bind("click", function () {
            this.onSendClicked();
        }.bind(this), this.app);
        feeParent.show("flex");
        if (this.metaPayParams && this.metaPayParams.type === PAYMENT_DELEGATE) {
            feeParent.hide();
            sendButton.innerHTML = "sign & delegate";
        }
        if (this.metaPayParams && this.metaPayParams.type === PAYMENT_UNDELEGATE) {
            feeParent.hide();
            sendButton.innerHTML = "sign & undelegate";
        }
        feeElement.innerHTML = "";
        /** @type {Object<{values: Object<string, string>, readonly: boolean}>} */
        let fee = this.fees[this.wallet.currencyId];
        if (!fee) {
            feeParent.hide();
        }
        if (fee) {
            if (fee.readonly) {
                feeElement.setAttribute("readonly", "readonly");
            }
            for (let value in fee.values) {
                // @todo https://eslint.org/docs/rules/no-prototype-builtins
                if (!fee.values.hasOwnProperty(value)) {
                    continue;
                }
                feeElement.appendChild(dom("<option value=\"" + value + "\">" + fee.values[value] + "</option>"));
            }
        }
        if (this.metaPayParams) {
            this.element.qs("transfer.allavailable").hide();
            this.element.qs("actions.scanqr").hide();
        } else {
            this.element.qs("transfer.allavailable").show();
            this.element.qs("actions.scanqr").show();
            this.element.qs("actions.scanqr").bind("click", function () {
                this.onScanQrCodeClicked();
            }.bind(this), this.app);
            this.element.qs("transfer.allavailable").onclick = function () {
                this.formElement.querySelector("[name='value']").value = this.wallet.balance / CURRENCY_COEFFICIENT[this.wallet.currencyId];
            }.bind(this);
        }
    }
    onScanQrCodeClicked () {
        bridgeCallHandler("openQRscan")
            .then(function (data) {
                console.log("openQRscan", data, data.code, strsplit(data.code, 64));
                /** @type {number} */
                let hashType = BlockchainLib.hashType(data.code);
                if (BlockchainLib.checkHashTypeForCurrency(hashType, this.wallet.currencyId)) {
                    this.formElement.querySelector("[name='to']").value = data.code;
                } else if (hashType !== HASH_TYPE_UNDEFINED) {
                    this.app.showNotification({
                        text: __("importpk.wrongcurrency", {
                            currency: CURRENCY_CODES[this.wallet.currencyId]
                        }),
                        type: NOTIFICATION_ERROR,
                        hideTimeout: UI_ERROR_NOTIFICATION_LONG_TIMEOUT * 1000
                    });
                    this.formElement.querySelector("[name='to']").value = "";
                } else {
                    this.app.showNotification({
                        text: __("error.wrongqrcode"),
                        type: NOTIFICATION_ERROR,
                        hideTimeout: UI_ERROR_NOTIFICATION_LONG_TIMEOUT * 1000
                    });
                    this.formElement.querySelector("[name='to']").value = "";
                }
            }.bind(this))
            .catch(function () {});
    }
    onSendClicked () {
        if (this.loader) {
            return;
        }
        this.formElement.querySelectorAll("input").forEach(function ( /** @type {HTMLElement} */ element) {
            element.classList.remove(UI_FORM_INPUT_ERROR_CLASS);
        });
        /** @type {Object<string, string|number>} */
        let formData = getFormData(this.formElement);
        if (this.metaPayParams) {
            for (let param of ["to", "value", "data"]) {
                formData[param] = this.metaPayParams[param];
            }
        } else {
            formData.value = formData.value ? this.wallet.currency.getValue(formData.value.replace(",", ".")) : 0;
        }
        console.log("formData", formData);
        // @info проверять правильнсть адреса получателя
        if (this.wallet.balance < formData.value || !formData.value) {
            this.formElement.querySelector("[name='value']").classList.add(UI_FORM_INPUT_ERROR_CLASS);
            if (formData.value) {
                this.app.showNotification({
                    text: __("error.notenoughfunds"),
                    type: NOTIFICATION_ERROR,
                    hideTimeout: UI_ERROR_NOTIFICATION_LONG_TIMEOUT * 1000
                });
            } else {
                this.app.showNotification({
                    text: __("error.emptyfields"),
                    type: NOTIFICATION_ERROR,
                    hideTimeout: UI_ERROR_NOTIFICATION_LONG_TIMEOUT * 1000
                });
            }
            return;
        }
        if (!formData.to) {
            this.formElement.querySelector("[name='to']").classList.add(UI_FORM_INPUT_ERROR_CLASS);
            this.app.showNotification({
                text: __("error.emptyfields"),
                type: NOTIFICATION_ERROR,
                hideTimeout: UI_ERROR_NOTIFICATION_LONG_TIMEOUT * 1000
            });
            return;
        }
        if (!formData.password) {
            this.app.showNotification({
                text: __("error.wrongpassword"),
                type: NOTIFICATION_ERROR,
                hideTimeout: UI_ERROR_NOTIFICATION_LONG_TIMEOUT * 1000
            });
            this.formElement.querySelector("[name='password']").classList.add(UI_FORM_INPUT_ERROR_CLASS);
            return;
        }
        // this.loader = null;
        // if ([CURRENCY_ID_ETH, CURRENCY_ID_BTC].indexOf(this.wallet.currencyId) !== -1) {
        //     this.loader = this.app.showNotification({text: __("common.pleasewait"), type: NOTIFICATION_LOADING, hideTimeout: UI_ERROR_NOTIFICATION_NO_TIMEOUT});
        //     this.disallowPrev();
        // }
        showLoader(this);
        let cryptoWorker = new Worker("/js/worker/crypto.js");
        cryptoWorker.onmessage = function ( /** @type {MessageEvent} */ event) {
            console.log("<- worker:", event.data);
            cryptoWorker.terminate();
            if (!event.data.result) {
                hideLoader(this);
                this.app.showNotification({
                    text: __("error.wrongpassword"),
                    type: NOTIFICATION_ERROR,
                    hideTimeout: UI_ERROR_NOTIFICATION_LONG_TIMEOUT * 1000
                });
                this.formElement.querySelector("[name='password']").classList.add(UI_FORM_INPUT_ERROR_CLASS);
                return;
            }
            /** @type {MetaHashWallet|EthereumWallet|BitcoinWallet} */
            let blockchainWallet = BlockchainLib.fromPrivateKey(this.wallet.currencyId, event.data.privateKey);
            if (this.wallet.address && blockchainWallet.address !== this.wallet.address) {
                hideLoader(this);
                this._reject();
                return;
            }
            BlockchainLib.sendTx(this.wallet.currencyId, this.wallet, blockchainWallet.privateKey, formData)
                .then(function (result) {
                    hideLoader(this);
                    this.onTxSent(formData, result);
                }.bind(this))
                .catch(function (result) {
                    hideLoader(this);
                    this.onTxError(result);
                }.bind(this));
        }.bind(this);
        cryptoWorker.postMessage({
            currencyId: this.wallet.currencyId,
            encryptedWallet: this.wallet.privateKey,
            password: formData["password"]
        });
    }
    /**
     * @param {Object<string, string|number>} formData
     * @param {Object<{transaction: string}>} result
     */
    onTxSent (formData, result) {
        /** @type {Transfer} */
        let transfer = Object.assign(formData, {
            from: this.wallet.address,
            wallet: this.wallet,
            api: result.api,
            apiWallet: result.wallet,
            transaction: result.transaction,
            status: TRANSACTION_STATUS_PROGRESS,
        });
        console.log("transfer", transfer);
        this._resolve(transfer);
    }
    /**
     * @param {Object<{errorCode: string}>} result
     */
    onTxError (result) {
        result = result || {
            errorCode: "notaccepted"
        };
        this.app.showNotification({
            text: __("transferview.error." + result.errorCode),
            type: NOTIFICATION_ERROR,
            hideTimeout: UI_ERROR_NOTIFICATION_LONG_TIMEOUT * 1000
        });
    }
}