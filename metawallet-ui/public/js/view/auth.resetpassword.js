/**
 * @param {ViewConfig} config
 * @constructor
 */
class ResetPasswordView extends View {
    constructor (config) {
        config = Object.assign(config, {
            dataSelector: "view.resetpassword"
        });
        super(config, config);
        View.apply(this, arguments);
    }
    onStarted () {
        this.element.querySelector(".auth-form .btn-primary").onclick = function () {
            this.app.user.resetPassword(getFormData(this.element.querySelector(".auth-form")));
        }.bind(this);
    }
}