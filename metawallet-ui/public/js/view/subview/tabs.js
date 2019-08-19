/**
 * @param {ViewConfig|{tabs: Object<number, TabConfig>}} config
 * @constructor
 */
class TabsSubView extends View {
    constructor (config) {
        config = Object.assign(config, {
            type: VIEW_SUBVIEW
        });
        super(config, config);
        View.apply(this, arguments);
        /** @type {Object<number, TabConfig>} */
        this._tabs = config.tabs;
        /** @type {Object<number, HTMLElement|xD>} */
        this.tabs = {};
    }
    onStarted () {
        // console.log("TabsSubView.onStarted");
        /** @type {boolean} */
        this.__first = true;
        this.element.querySelectorAll(".tabs._tabs--divider .tab").forEach(function ( /** @type {HTMLElement} */ element) {
            /** @type {number} */
            let tab = parseInt(element.getAttribute("data-tab"));
            this.tabs[tab] = xD(this.element.querySelector("[data-tab-content='" + tab + "']"));
            if (this.__first) {
                this.__first = false;
                element.classList.add("active");
                this.tabs[tab].show();
            } else {
                element.classList.remove("active");
                this.tabs[tab].hide();
            }
            element.onclick = function () {
                this.element.querySelectorAll(".tabs._tabs--divider .tab").forEach(function ( /** @type {HTMLElement} */ element) {
                    element.classList.remove("active");
                });
                element.classList.add("active");
                Object.values(this.tabs).forEach(function ( /** @type {HTMLElement|xD} */ tab) {
                    tab.hide();
                }.bind(this));
                this.tabs[tab].show();
                this._tabs[tab].callback();
            }.bind(this);
        }.bind(this));
    }
}