/**
 * @param {{
 *     app: MetaWallet
 *     settings: Object
 * }} config
 * @constructor
 */
class Settings {
    constructor (config) {
        /**
         * @type {Object}
         * @private
         */
        this._config = config;
        /** @type {MetaWallet} */
        this.app = config.app;
        /**
         * @type {Object<string, string|number|null>}
         * @private
         */
        this._settings = {};
        this.load(config.settings);
        Events.addListener("Settings.set.locale.lang", function () {
            // console.log("eventListener.Settings.set.locale.lang");
            this.onLocaleChanged();
        }, this);
        // Events.addListener("Settings.set.passcode._", function () {
        //     console.log("eventListener.Settings.set.passcode._");
        //     this.onPasscodeChanged();
        // }, this);
    }
    /**
     * Save user data
     */
    save () {
        console.log("Settings.save");
        storageSet("settings", this._settings);
    }
    /**
     * Load user data
     * @param {Object} settings
     */
    load (settings) {
        console.log("Settings.load");
        this._settings = JSON.parse(storageGet("settings") || "{}");
        console.log("_settings", this._settings);
        if (settings) { // overwrite loaded settings with data from native app
            for (let param in settings) {
                settings[param] = JSON.parse(settings[param]);
            }
            this._settings = Object.assign(this._settings, settings);
        }
        this._settings["locale.lang"] = this._settings["locale.lang"] || DEFAULT_LANG;
        this.onLocaleChanged();
        this._settings["base.currency"] = this._settings["base.currency"] || DEFAULT_BASE_CURRENCY;
        this._settings["base.period"] = this._settings["base.period"] || DEFAULT_BASE_PERIOD;
        this._settings["wallets.show"] = this._settings["wallets.show"] || 1;
        this._settings["wallets.icloudkeys"] = this._settings["wallets.icloudkeys"] || 1;
        // this._settings["passcode.app"] = this._settings["passcode.app"] || 0;
        // this._settings["passcode.transfers"] = this._settings["passcode.transfers"] || 0;
        // this._settings["passcode.wallets"] = this._settings["passcode.wallets"] || 0;
        // this.onPasscodeChanged();
    }
    /**
     * @param {string} key
     * @param {*=} defaultValue
     * @return {*|null}
     */
    get (key, defaultValue) {
        return this._settings[key] || defaultValue || null;
    }
    /**
     * Update and save user ui settings
     * @param {string} param
     * @param {string|number} value
     */
    set (param, value) {
        console.log("Settings.set", param, value);
        this._settings[param] = value;
        // storageSet("settings", this._settings);
        Events.trigger("Settings.set." + param, param, value); // setting changed
        Events.trigger("Settings.set." + param.split(".")[0] + "._", param, value); // settings group changed
        bridgeCallHandler("setSetting", {
            email: this.app.user.email,
            key: param,
            value: JSON.stringify(value),
        }).then().catch();
    }
    onLocaleChanged () {
        script({
            src: "js/lang/" + this._settings["locale.lang"] + ".js",
            async: false,
            callback: onLocaleLoaded
        });
    }
}

// Settings.prototype.onPasscodeChanged = function () {
//     this._settings["passcode._"] = this._settings["passcode.app"];// || this._settings["passcode.transfers"] || this._settings["passcode.wallets"];
// };