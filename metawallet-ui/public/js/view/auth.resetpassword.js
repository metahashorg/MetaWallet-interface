/**
 * @param {ViewConfig} config
 * @constructor
 */
function ResetPasswordView (config) {
    config = Object.assign(config, {
        dataSelector: "view.resetpassword"
    });

    View.apply(this, arguments);
}

extendFunction(ResetPasswordView, View);

ResetPasswordView.prototype.onStarted = function () {
    this.element.querySelector(".auth-form .btn-primary").onclick = function () {
        this.app.user.resetPassword(getFormData(this.element.querySelector(".auth-form")));
    }.bind(this);
};