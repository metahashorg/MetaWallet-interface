/**
 * @param {ViewConfig} config
 * @constructor
 */
class SettingsView extends View {
    constructor (config) {
        config = Object.assign(config, {
            dataSelector: "view.settings"
        });
        super(config, config);
        View.apply(this, arguments);
    }
    onStarted () {
        xD(document.querySelector(".settings")).show();
        this.element.qs("settings-locale").onclick = function () {
            this.app.pushView(new LocaleSettingsPage( /** @type {ViewConfig} */ {
                app: this.app
            }));
        }.bind(this);
        this.element.qs("settings-wallets").onclick = function () {
            this.app.pushView(new WalletsSettingsView( /** @type {ViewConfig} */ {
                app: this.app
            }));
        }.bind(this);
        // this.element.qs("settings-system").onclick = function () {
        //     this.app.pushView(new SystemSettingsView(/** @type {ViewConfig} */ {app: this.app}));
        // }.bind(this);
        this.element.qs("settings-password").onclick = function () {
            this.app.pushView(new PasswordSettingsView( /** @type {ViewConfig} */ {
                app: this.app
            }));
        }.bind(this);
        this.element.qs("settings-passcode").onclick = function () {
            this.app.pushView(new PasscodeSettingsView( /** @type {ViewConfig} */ {
                app: this.app
            }));
        }.bind(this);
        // this.element.qs("settings-googleauth").onclick = function () {
        //     this.app.showNotification({text: __("error.notavailable"), type: NOTIFICATION_WARNING});
        // }.bind(this);
        // this.element.qs("settings-onetimepassword").onclick = function () {
        //     this.app.showNotification({text: __("error.notavailable"), type: NOTIFICATION_WARNING});
        // }.bind(this);
        this.element.qs("settings-delete").onclick = function () {
            this.app.showNotification({
                text: __("error.notavailable"),
                type: NOTIFICATION_WARNING
            });
        }.bind(this);
        this.element.qs("settings--clear-cache").onclick = function () {
            bridgeCallHandler("сlearCache", {})
                .then(function () {
                    this.app.showNotification({
                        text: __("settings.cache.cleaned"),
                        type: NOTIFICATION_SUCCESS
                    });
                }.bind(this));
        }.bind(this);
        this.element.qs("settings-logout").onclick = function () {
            this.app.user.logout();
        }.bind(this);
    }
    onStopped () {
        xD(document.querySelector(".settings")).hide();
    }
    onShown () {
        this.update();
    }
    update () {
        this.element.qs("settings-locale-value").innerHTML = __("settings.locale." + this.app.settings.get("locale.lang"));
        this.element.qs("settings-passcode-value").innerHTML = this.app.settings.get("passcode.passcode") ? __("common.enabled") : __("common.disabled");
    }
}