/**
 * @param {ViewConfig} config
 * @constructor
 */
function LocaleSettingsPage (config) {
    config = Object.assign(config, {
        dataSelector: "view.settings.locale"
    });

    View.apply(this, arguments);
}

extendFunction(LocaleSettingsPage, View);

LocaleSettingsPage.prototype.onStarted = function () {
    this.element.querySelectorAll("[name=settings-locale]").forEach(function (/** @type {HTMLElement} */ element) {
        let value = element.getAttribute("data-param-value");
        if (value === this.app.settings.get("locale.lang")) {
            element.checked = true;
        }
        element.onclick = function () {
            this.app.settings.set("locale.lang", value);
        }.bind(this);
    }.bind(this));
};
