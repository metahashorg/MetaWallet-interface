/**
 * @param {ViewConfig} config
 * @constructor
 */
class PasswordSettingsView extends View {
    constructor (config) {
        config = Object.assign(config, {
            dataSelector: "view.settings.password"
        });
        super(config, config);
        View.apply(this, arguments);
    }
    onStarted () {
        this.element.querySelector(".settings-actions .btn-primary").onclick = function () {
            this.app.hideAllNotifications();
            this.element.querySelectorAll(".js--changepassword-form input").forEach(function ( /** @type {HTMLInputElement} */ element) {
                if (element.value === "") {
                    element.classList.add(UI_FORM_INPUT_ERROR_CLASS);
                } else {
                    element.classList.remove(UI_FORM_INPUT_ERROR_CLASS);
                }
            });
            let formData = getFormData(this.element.querySelector(".js--changepassword-form"));
            if (formData.old === "") {
                this.app.showNotification({
                    text: __("settings.password.error.emptyoldpassword"),
                    type: NOTIFICATION_ERROR,
                    hideTimeout: 10000
                });
                return;
            }
            if (formData.new === "" || formData.new2 === "") {
                this.app.showNotification({
                    text: __("settings.password.error.emptynewpassword"),
                    type: NOTIFICATION_ERROR,
                    hideTimeout: 10000
                });
                return;
            }
            if (formData.new !== formData.new2) {
                this.app.showNotification({
                    text: __("error.passwordsdonotmatch"),
                    type: NOTIFICATION_ERROR,
                    hideTimeout: 10000
                });
                return;
            }
            this.app.user.changePassword(formData)
                .then(function () {
                    this.element.querySelectorAll(".js--changepassword-form input").forEach(function ( /** @type {HTMLInputElement} */ element) {
                        element.classList.remove(UI_FORM_INPUT_ERROR_CLASS);
                        element.value = "";
                    });
                }.bind(this));
        }.bind(this);
    }
    onStopped () {
        this.app.hideAllNotifications();
    }
}