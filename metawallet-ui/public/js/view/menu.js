/**
 * @param {ViewConfig} config
 * @constructor
 */
class MenuView extends View {
    constructor (config) {
        config = Object.assign(config, {
            selector: ".menu",
            type: VIEW_ALERT,
            cssDisplayProp: "flex"
        });
        super(config, config);
        View.apply(this, arguments);
    }
    onStarted () {
        this.element.querySelector(".menu-profile--email").innerHTML = this.app.user.login;
        this.element.querySelector(".icon-menu-close").onclick = function () {
            this.app.prevView();
        }.bind(this);
        this.element.querySelector(".menu-item--home").onclick = function () {
            this.app.switchView(new CurrenciesView( /** @type {ViewConfig} */ {
                app: this.app
            }));
        }.bind(this);
        this.element.querySelector(".menu-item--delegation").onclick = function () {
            this.app.switchView(new NodesView( /** @type {ViewConfig} */ {
                app: this.app,
                hideArrow: true
            }));
        }.bind(this);
        this.element.querySelector(".menu-item--apps").onclick = function () {
            this.app.switchView(new DAppsView( /** @type {ViewConfig} */ {
                app: this.app
            }));
        }.bind(this);
        this.element.querySelector(".menu-item--settings").onclick = function () {
            this.app.switchView(new SettingsView( /** @type {ViewConfig} */ {
                app: this.app
            }));
        }.bind(this);
        this.element.querySelector(".menu-item--support").onclick = function () {
            this.app.switchView(new SupportView( /** @type {ViewConfig} */ {
                app: this.app
            }));
        }.bind(this);
    }
}