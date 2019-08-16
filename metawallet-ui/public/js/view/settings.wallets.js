/**
 * @param {ViewConfig} config
 * @constructor
 */
function WalletsSettingsView (config) {
    config = Object.assign(config, {
        dataSelector: "view.settings.wallets"
    });

    View.apply(this, arguments);
}

extendFunction(WalletsSettingsView, View);

WalletsSettingsView.prototype.onStarted = function () {
    this.element.querySelectorAll("[name='settings-wallets-show']").forEach(function (/** @type {HTMLElement} */ element) {
        let value = parseInt(element.getAttribute("data-param-value"));
        if (value === this.app.settings.get("wallets.show")) {
            element.checked = true;
        }
        element.onclick = function () {
            this.app.settings.set("wallets.show", value);
        }.bind(this);
    }.bind(this));

    initSettingsCheckboxes(this.app, this.element, "wallets", ["icloudkeys"]);
};
