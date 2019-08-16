/**
 * @param {App|MetaWallet} app
 * @param {Object} data
 */
function showUnDelegate (app, data) {
    console.log("showUnDelegate", data);
    app.alertView(new UndelegateAlertView(/** @type {ViewConfig} */{app: app, node: data.node, currencyId: data.delegation.wallet.currencyId}))
          .then(function (/** @type {{wallet: Wallet, delegateParams: MetaPayParams=}} */  data) {
              console.log("showUnDelegate.resolve", data);
              app.prevView()
                  .then(function () {
                    console.log("showUnDelegate.TransferView", data);
                      app.pushView(new TransferView(/** @type {ViewConfig} */{app: app, wallet: data.wallet, metaPayParams: data.metaPayParams}))
                          .then(function (/** @type {Transfer} */ transfer) {
                              app.prevView()
                                  .then(function () {
                                      app.alertView(new TransactionView(/** @type {ViewConfig} */ {app: app, wallet: transfer.wallet, transfer: transfer}))
                                          .then(function (callback) {
                                              callback();
                                          });
                                  }.bind(this));
                          }.bind(this))
                          .catch(function (e) {
                            console.log("TransferView:e", e);
                          });
                  });
          })
          .catch(function (e) {
            console.log("showUnDelegate:e", e);
          });
}