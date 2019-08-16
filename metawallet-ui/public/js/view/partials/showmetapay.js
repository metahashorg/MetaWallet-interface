/**
 * @param {App|MetaWallet} app
 * @param {Object} data
 */
function showMetaPay (app, data) {
    app.alertView(new MetaPayAlertView(/** @type {ViewConfig} */{app: app, metaPayUrl: data.metaPayUrl}))
          .then(function (/** @type {{wallet: Wallet, metaPayParams: MetaPayParams=}} */  data) {
              console.log("showMetaPay.resolve", data.wallet, data.metaPayParams);
              app.prevView()
                  .then(function () {
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
                          .catch(function () {
                          });
                  });
          })
          .catch(function () {
          });
}