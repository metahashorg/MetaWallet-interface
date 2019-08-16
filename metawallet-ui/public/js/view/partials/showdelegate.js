/**
 * @param {App|MetaWallet} app
 * @param {Object} data
 */
function showDelegate (app, data) {
    console.log("showDelegate", data);
     app.alertView(new DelegateAlertView(/** @type {ViewConfig} */{app: app, node: data.node, currencyId: data.currencyId}))
          .then(function (/** @type {{wallet: Wallet, delegateParams: MetaPayParams=}} */  data) {
              console.log("showDelegate.resolve", data);
              app.prevView()
                  .then(function () {
                    console.log("showDelegate.TransferView", data);
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
            console.log("showDelegate:e", e);
          });
}