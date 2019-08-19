/**
 * @param {ViewConfig} config
 * @constructor
 */
class CreateAccountView extends View {
    constructor (config) {
        config = Object.assign(config, {
            dataSelector: "view.createaccount"
        });
        super(config, config);
        View.apply(this, arguments);
    }
    onStarted () {
        /** @type {HTMLElement|xD} */
        this.formElement = this.element.qs("createaccount.form");
        this.element.querySelector(".auth-form .btn-primary").onclick = function () {
            this.onCreateAccountClicked();
        }.bind(this);
    }
    onCreateAccountClicked () {
        let check = true;
        this.formElement.querySelectorAll("input[name]").forEach(function ( /** @type {HTMLInputElement} */ element) {
            if (element.value.trim() === "") {
                element.classList.add(UI_FORM_INPUT_ERROR_CLASS);
                check = false;
            } else {
                element.classList.remove(UI_FORM_INPUT_ERROR_CLASS);
            }
        });
        let formData = getFormData(this.element.querySelector(".auth-form"));
        if (formData["password"] !== formData["password2"]) {
            this.formElement.querySelector("[name='password2']").classList.add(UI_FORM_INPUT_ERROR_CLASS);
            check = false;
            this.app.showNotification({
                text: __("error.passwordsdonotmatch"),
                type: NOTIFICATION_ERROR,
                hideTimeout: UI_ERROR_NOTIFICATION_LONG_TIMEOUT * 1000
            });
        }
        if (check) {
            this.app.user.register(formData);
        }
    }
}