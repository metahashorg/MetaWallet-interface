//
// MetaHash/MetaGate API
//

/**
 * @param {string} method
 * @param {Object<string, *>=} methodParams
 * @param {number=} currencyId
 * @return {XhrParams}
 */
function getJsonRpcXhrParams (method, methodParams, currencyId) {
    currencyId = currencyId || 4;

    let postData = {
        id: 1,
        jsonrpc: "2.0",
        method: method
    };
    if (methodParams) {
        Object.assign(postData, methodParams);
    }

    let endpoint = {
        "user": API_ENDPOINT_ID,
        "address": API_ENDPOINT_WALLET,
        "currency": API_ENDPOINT_WALLET,
        "dapps": API_ENDPOINT_APP,
        "fetch-balance": (currencyId === CURRENCY_ID_TMH ? API_ENDPOINT_TOR_TEST : API_ENDPOINT_TOR),
        "fetch-history": (currencyId === CURRENCY_ID_TMH ? API_ENDPOINT_TOR_TEST : API_ENDPOINT_TOR),
        "get-address-delegations": (currencyId === CURRENCY_ID_TMH ? API_ENDPOINT_TOR_TEST : API_ENDPOINT_TOR),
        "get-tx": (currencyId === CURRENCY_ID_TMH ? API_ENDPOINT_TOR_TEST : API_ENDPOINT_TOR),
        "plus": API_ENDPOINT_PLUS,
        "node": API_ENDPOINT_NETREGISTRY,
    }[method.split(".")[0]];

    return /** @type {XhrParams} */ {
        url: endpoint,
        method: "POST",
        data: JSON.stringify(postData),
        cast: JSON.parse
    };
}

/**
 * xhr wrapper with BAD_TOKEN error handler
 * @param {XhrParams} params
 * @return {Promise<*>}
 */
function apiXhr (params) {
    // console.log("apiXhr", params);
    return new Promise(function (resolve, reject) {
        xhr(params)
            .then(function (response) {
                resolve(response);
            })
            .catch(function (response, status) {
                let data;
                try {
                    data = JSON.parse(params.data);
                } catch (e) {
                    reject(response, status);
                }

                if (typeof response === "object" && response.result === API_ERROR && response.data ) {

                    if (response.data.code === API_ERROR_FIELD_EXISTS){
                        // @info существование ключа в профиле - не критичная ошибка
                        resolve(response, API_ERROR_FIELD_EXISTS);
                        return;
                    }

                    if (
                        data.method === "address.create" 
                        && response.data.code === API_ERROR_TRY_AGAIN_LATER 
                        && response.data.message.match(/Duplicate entry/)){
                        // @info ещё один ответ на существование ключа в профиле - не критичная ошибка
                        resolve(response, API_ERROR_TRY_AGAIN_LATER);
                        return;
                    }

                    if (
                            data.method === "address.transaction" 
                            && response.data.code === API_ERROR_TRY_AGAIN_LATER 
                        ){
                        // @info ошибка получение списка транзакций - не критичная ошибка
                        resolve(response, API_ERROR_TRY_AGAIN_LATER);
                        return;
                    }

                    if (
                        (
                            response.data.code === API_ERROR_BAD_TOKEN
                            && window.metawallet.user.tokenRefresh
                        ) 
                        || status === API_ERROR_BAD_REQUEST
                    ) {
                        if (data.method === "user.token.refresh") { // got error trying to refresh user token
                            window.metawallet.user.logout();
                        } else if (data.method === "user.token") { // no auto refresh token for check token requests
                            reject(response, status);
                        } else {
                            window.metawallet.user.tryRefreshToken()
                                .then(function () {
                                    data.token  = window.metawallet.user.token;
                                    params.data = JSON.stringify(data);
                                    return apiXhr(params);
                                });
                        }
                    } else {
                        reject(response, status);
                    }
                } else {
                    reject(response, status);
                }
            });
    });
}

//
// Platform API
//

/**
 * Send message to platform (iOS/Android native app)
 * @param {string} handler
 * @param {Object=} params
 * @return {Promise<*>|void}
 */
function bridgeCallHandler (handler, params) {
    console.log("bridgeCallHandler", handler, params);

    return new Promise(function (resolve, reject) {
        bridge.callHandler(handler, params, function (/** @type {NativeResponse} */ response) {
            console.log("bridge.callHandler", "handler", handler, "response.result", response.result);
            try {
                if (response.result === NATIVEAPI_RESULT_OK) {
                    resolve(response.data);
                } else {
                    reject(response.data);
                }
            } catch (e) {
                reject();
            }
        }, resolve, reject);
    });
}

/**
 * Received message from platform (iOS/Android native app)
 * @param {string} json
 */
function platformOnMessage (json) {
    console.log("platformOnMessage", JSON.parse(json));

    /**
     * @type {{code: string, data: Object}}
     */
    let message = JSON.parse(json);

    switch (message.code) {

        // Response to request
        // example: {"code": "response", "data": {"result": 1, "callbackEvent": "$callbackEvent"}}
        case "response":
            Events.trigger(message.data.callbackEvent, message.data);
            break;

        // Launch HTML App
        // example: {"code": "app", "data": {"settings": {...}}}
        case "app":
            window.metawallet = new MetaWallet(message.data);
            if (window.metawallet.settings.get("passcode.app")) {
                window.metawallet.switchView(new LockView(/** @type {ViewConfig} */ {app: window.metawallet}));
            } else {
                window.metawallet.switchView(new LoaderView(/** @type {ViewConfig} */ {app: window.metawallet}));
            }
            break;

        // Switch view
        // example: {"code": "view", "data": {"view": "lock"}}
        case "view":
            switch (message.data.view) {
                case "lock":
                    window.metawallet.switchView(new LockView(/** @type {ViewConfig} */ {app: window.metawallet}));
                    break;
                case "loader":
                    window.metawallet.switchView(new LoaderView(/** @type {ViewConfig} */ {app: window.metawallet}));
                    break;
            }
            break;

        // Blur/unblur screen
        // example: {"code": "blur", "data": {"blur": 1}}
        case "blur":
            if (window.metawallet) {
                window.metawallet.blur(message.data.blur);
            }
            break;

        // Network status changed: 1 - online, 0 - offline
        // example: {"code": "network", "data": {"network": 1}}
        case "network":
            if (window.metawallet) {
                window.metawallet.onNetworkChanged(message.data.network);
            }
            break;
    }
}