/**
 * @param {ViewConfig} config
 * @constructor
 */
class LocaleSettingsPage extends View {
    constructor (config) {
        config = Object.assign(config, {
            dataSelector: "view.settings.locale"
        });
        super(config, config);
        View.apply(this, arguments);
    }
    onStarted () {
        this.element.querySelectorAll("[name=settings-locale]").forEach(function ( /** @type {HTMLElement} */ element) {
            let value = element.getAttribute("data-param-value");
            if (value === this.app.settings.get("locale.lang")) {
                element.checked = true;
            }
            element.onclick = function () {
                this.app.settings.set("locale.lang", value);
            }.bind(this);
        }.bind(this));
    }
}