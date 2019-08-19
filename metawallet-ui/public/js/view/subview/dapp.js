/**
 * @param {ViewConfig|{dapp: DApp}} config
 * @constructor
 */
class DAppSubView extends View {
    constructor (config) {
        config = Object.assign(config, {
            type: VIEW_SUBVIEW
        });
        super(config, config);
        View.apply(this, arguments);
        /** @type {DApp} */
        this.dapp = config.dapp;
    }
    onStarted () {
        this.element.onclick = function () {
            this.app.showNotification({
                text: __("error.availableonlyinmetagate"),
                type: "warning",
            });
        }.bind(this);
    }
    onShown () {
        this.update();
    }
    update () {
        this.element.setAttribute("data-dapp-address", this.dapp.address);
        this.dapp.icon = this.dapp.icon.replace("http:", "https:");
        this.element.qs("dapps.template.icon").src = this.dapp.icon || MetaHashLib.addressIcon(this.dapp.address);
        this.element.qs("dapps.template.name").innerHTML = this.dapp.name;
        this.element.qs("dapps.template.description").innerHTML = this.dapp.description;
    }
}