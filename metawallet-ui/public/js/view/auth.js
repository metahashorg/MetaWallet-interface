/**
 * @param {ViewConfig} config
 * @constructor
 */
function AuthView (config) {
    config = Object.assign(config, {
        dataSelector: "view.auth"
    });

    View.apply(this, arguments);
}

extendFunction(AuthView, View);

AuthView.prototype.onStarted = function () {
    this.element.querySelector(".auth-form .btn-primary").onclick = function () {
        this.app.user.auth(getFormData(this.element.querySelector(".auth-form")));
    }.bind(this);

    this.element.qs("actions.createaccount").onclick = function () {
        this.app.pushView(new TermsView(/** @type {ViewConfig} */ {app: this.app}));
    }.bind(this);

    // this.element.qs("actions.continue").onclick = function () {
    //     this.app.onUserAuth();
    // }.bind(this);

    this.element.qs("actions.resetpassword").onclick = function () {
        this.app.pushView(new ResetPasswordView(/** @type {ViewConfig} */ {app: this.app}));
    }.bind(this);
};
