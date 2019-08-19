/**
 * @param {ViewConfig} config
 * @constructor
 */
class iCloudSyncAlertView extends View {
    constructor (config) {
        config = Object.assign(config, {
            dataSelector: "view.alert.icloudsync",
            type: VIEW_ALERT,
            cssDisplayProp: "flex"
        });
        super(config, config);
        View.apply(this, arguments);
    }
    onStarted () {
        this.element.querySelector("button").onclick = function () {
            this.app.settings.set("tutorial.icloudsync", 1);
            this.app.prevView();
        }.bind(this);
    }
}