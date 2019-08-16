/**
 * @param {ViewConfig|{dapp: DApp}} config
 * @constructor
 */
function DAppSubView (config) {
    config = Object.assign(config, {
        type: VIEW_SUBVIEW
    });

    View.apply(this, arguments);

    /** @type {DApp} */
    this.dapp = config.dapp;
}

extendFunction(DAppSubView, View);

DAppSubView.prototype.onStarted = function () {
    this.element.onclick = function () {
        this.app.showNotification({
            text: __( "error.notavailable" ),
            type: "warning",
        });
    }.bind(this);
};

DAppSubView.prototype.onShown = function () {
    this.update();
};

DAppSubView.prototype.update = function () {
    this.element.setAttribute("data-dapp-address", this.dapp.address);

    this.dapp.icon = this.dapp.icon.replace("http:","https:");

    this.element.qs("dapps.template.icon").src = this.dapp.icon || MetaHashLib.addressIcon(this.dapp.address);
    this.element.qs("dapps.template.name").innerHTML = this.dapp.name;
    this.element.qs("dapps.template.description").innerHTML = this.dapp.description;
};