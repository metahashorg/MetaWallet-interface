/**
 * @param {ViewConfig} config
 * @constructor
 */
function iCloudSyncAlertView (config) {
    config = Object.assign(config, {
        dataSelector: "view.alert.icloudsync",
        type: VIEW_ALERT,
        cssDisplayProp: "flex"
    });

    View.apply(this, arguments);
}

extendFunction(iCloudSyncAlertView, View);

iCloudSyncAlertView.prototype.onStarted = function () {
    this.element.querySelector("button").onclick = function () {
        this.app.settings.set("tutorial.icloudsync", 1);
        this.app.prevView();
    }.bind(this);
};
