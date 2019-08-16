/**
 * @param {MetaWallet} app
 * @param {HTMLElement} element
 * @param {string} prefix
 * @param {Array<string>} settings
 * @param {function(Object):void=} callback
 */
function initSettingsCheckboxes (app, element, prefix, settings, callback) {
    for (let setting of settings) {
        let checkbox = element.querySelector("#settings-" + prefix + "-" + setting);
        checkbox.checked = !!app.settings.get(prefix + "." + setting);
        checkbox.onclick = function () {
            app.feedbackNotification(FEEDBACK_LIGHT);
            if (callback) {
                callback({param: prefix + "." + setting, value: (checkbox.checked ? 1 : 0), checkbox: checkbox});
            } else {
                app.settings.set(prefix + "." + setting, (checkbox.checked ? 1 : 0));
            }
        }.bind(this);
    }
}