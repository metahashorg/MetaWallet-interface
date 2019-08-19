/**
 * @param {ViewConfig} config
 * @constructor
 */
class TermsView extends View {
    constructor (config) {
        config = Object.assign(config, {
            dataSelector: "view.terms"
        });
        super(config, config);
        View.apply(this, arguments);
    }
    onStarted () {
        /** @type {HTMLButtonElement} */
        this.button = this.element.querySelector(".terms-actions button");
        /** @type {HTMLInputElement} */
        this.checkbox = this.element.querySelector(".terms-actions input");
        /** @type {HTMLElement} */
        this.actionsBlock = this.element.querySelector(".terms-actions");
        /** @type {HTMLElement} */
        this.textbox = this.element.querySelector(".terms-rules");
        this.textbox.onscroll = function () {
            if (this.textbox.scrollTop + this.textbox.getBoundingClientRect().height >= this.textbox.scrollHeight - 10) {
                this.actionsBlock.classList.remove("opacity-05");
                this.button.removeAttribute("disabled");
                this.checkbox.removeAttribute("disabled");
            }
        }.bind(this);
        this.button.onclick = function () {
            if (!this.checkbox.checked) {
                this.app.showNotification({
                    text: __("termsview.needagree"),
                    type: NOTIFICATION_ERROR,
                    hideTimeout: UI_ERROR_NOTIFICATION_LONG_TIMEOUT * 1000
                });
                return;
            }
            this.app.pushView(new CreateAccountView( /** @type {ViewConfig} */ {
                app: this.app
            }));
        }.bind(this);
    }
    onStopped () {
        this.textbox.scrollTo(0, 0);
        this.actionsBlock.classList.add("opacity-05");
        this.button.setAttribute("disabled", "disabled");
        this.checkbox.setAttribute("disabled", "disabled");
        this.checkbox.checked = false;
    }
}