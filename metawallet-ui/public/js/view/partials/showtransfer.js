/**
 * @param {App|MetaWallet} app
 * @param {Wallet} wallet
 * @param {?MetaPayParams=} metaPayParams
 * @param {?TransferParams=} transferParams
 */
function showTransfer (app, wallet, metaPayParams, transferParams) {
    if (wallet.privateKeyExists) {
        app.pushView(new TransferView(/** @type {ViewConfig} */ {app: app, wallet: wallet, metaPayParams: metaPayParams, transferParams: transferParams}))
            .then(function (/** @type {Transfer} */ transfer) {
                app.prevView()
                    .then(function () {
                        app.alertView(new TransactionView(/** @type {ViewConfig} */ {app: app, wallet: wallet, transfer: transfer}))
                            .then(function (callback) {
                                callback();
                            });
                    });
            })
            .catch(function () {
            });
    } else {
        app.alertView(new NoPkAlertView(/** @type {ViewConfig} */ {app: app, wallet: wallet}))
            .then(function () {
                app.prevView()
                    .then(function () {
                        showTransfer(app, wallet, metaPayParams, transferParams);
                    });
            })
            .catch(function () {
                app.prevView();
            });
    }
}