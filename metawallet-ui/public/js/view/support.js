/**
 * @param {ViewConfig} config
 * @constructor
 */
function SupportView (config) {
    config = Object.assign(config, {
        dataSelector: "view.support"
    });

    View.apply(this, arguments);
}

extendFunction(SupportView, View);

SupportView.prototype.onStarted = function () {
    this.element.qs("version.app").innerHTML = this.app.env.appVersion + "." + this.app.env.build;
    this.element.qs("version.ui").innerHTML = VERSION + "." + VERSION_BUILD;

    this.element.qs("actions.mail").onclick = function () {
        this.mailLogs();
    }.bind(this);

    /** @type {HTMLElement} */
    this.pageWrapper = this.element.querySelector(".page-wrapper");
    this.pageWrapperPaddingTop = parseInt(window.getComputedStyle(this.pageWrapper, null).getPropertyValue("padding-top"));

    /** @type {HTMLElement} */
    this.navbarBorder = this.element.querySelector(".page-nav__bottom-border");
    this.navbarBorder.style.opacity = "0";

    /** @type {HTMLElement} */
    this.navbarTitle = this.element.querySelector(".page-nav-center");
    this.navbarTitle.style.opacity = "0";

    this.pageWrapper.addEventListener("scroll", this.onScroll.bind(this), false);
};

SupportView.prototype.onStopped = function () {
    this.pageWrapper.removeEventListener("scroll", this.onScroll.bind(this), false);
};

/**
 * @param {Event} e
 */
SupportView.prototype.onScroll = function (e) {
    let scrollTopCurrent = parseInt(e.target.scrollTop);

    if (scrollTopCurrent < this.pageWrapperPaddingTop + 100) {
        this.navbarBorder.style.opacity = Math.abs(Math.min(Math.max(scrollTopCurrent / this.pageWrapperPaddingTop, 0), 1)) + "";
    }

    this.navbarTitle.style.opacity = scrollTopCurrent > this.pageWrapperPaddingTop + 35 ? "1" : "0";
};

SupportView.prototype.mailLogs = function () {
    const body = "... message body ...\n\n\n" + [
        "(" + this.app.env.device,
        this.app.env.appVersion + "." + this.app.env.build,
        VERSION + "." + VERSION_BUILD,
        this.app.env.systemVersion,
        this.app.env.appVersion + ")"
    ].join(", ");

    bridgeCallHandler("email", {
        recipients: "bost56@gmail.com", // support@metahash.org
        subject: "Support Logs (" + this.app.env.appVersion + "." + this.app.env.build + ", " + VERSION + "." + VERSION_BUILD + ")",
        messageBody: body // todo
    });
};