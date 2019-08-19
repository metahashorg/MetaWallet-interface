/**
 * @param {string|HTMLElement} selector
 * @return {Object<string, string|number>}
 */
function getFormData (selector) {
    /** @type {HTMLElement} */
    let form = typeof selector === "string" ? document.querySelector(selector) : selector;

    /** @type {NodeList} */
    let elements = form.querySelectorAll("[name]");

    /** @type {Object<string, string|number>} */
    let data = {};
    elements.forEach(function (input) {
        switch (input.getAttribute("type")) {
            case "checkbox":
                data[input.name] = input.checked ? 1 : 0;
                break;
            default:
                data[input.name] = input.value;
        }
    });

    return data;
}

/**
 * Extend DOM-element
 * @param {HTMLElement|Node} element
 * @return {HTMLElement|xD}
 */
function xD (element) {

    /**
     * Show element
     * @param {string=} display
     */
    element.show = function (display) {
        element.style.display = display || "block";
    };

    /**
     * Hide element
     */
    element.hide = function () {
        element.style.display = "none";
    };

    /**
     * Is element hidden
     * @return {boolean}
     */
    element.isHidden = function () {
        return element.style.display === "none";
    };

    /**
     * Set innerHTML
     * @param {string} html
     */
    element.html = function (html) {
        element.innerHTML = html;
    };

    /**
     * @param {string} selector
     * @return {?HTMLElement|xD}
     */
    element.qs = function (selector) {
        /** @type {HTMLElement} */
        let selectedElement = element.querySelector("[data-selector='" + selector + "']");
        return selectedElement ? xD(selectedElement) : null;
    };

    /**
     * @param {string} selector
     * @return {?Array<HTMLElement|xD>}
     */
    element.qsa = function (selector) {
        /** @type {NodeListOf<HTMLElement>} */
        let elements = element.querySelectorAll("[data-selector='" + selector + "']");
        if (!elements) {
            return null;
        }

        /** @type {Array<HTMLElement|xD>} */
        let xDElements = [];
        elements.forEach(function ( /** @type {HTMLElement} */ element) {
            xDElements.push(xD(element));
        });
        return xDElements;
    };

    /**
     * @param {string} event
     * @param {Function} callback
     * @param {App} app
     */
    element.bind = function (event, callback, app) {
        element["on" + event] = function () {
            if (!app.acceptInteraction()) {
                return;
            }
            callback();
        };
    };

    return element;
}

/**
 * @param {string} html
 * @param {Object<string, string>=} attributes
 * @return {HTMLElement|xD}
 */
function dom (html, attributes) {
    /** @type {HTMLElement} */
    let element = window.document.createElement("div");
    element.innerHTML = html;
    element = /** @type {HTMLElement} */ element.firstChild;

    if (typeof attributes === "object") {
        for (let i in attributes) {
            if (!attributes.hasOwnProperty(i)) {
                continue;
            }
            element.setAttribute(i, attributes[i]);
        }
    }

    return xD(element);
}

/**
 * Load script
 * @param {{
 *     src: string,
 *     async: boolean=,
 *     callback: Function=
 * }} params
 */
function script (params) {
    let script = document.createElement("script");
    script.src = params.src;
    script.async = typeof params.async !== "undefined" ? params.async : true;
    if (params.callback) {
        script.onload = function () {
            params.callback();
        };
    }
    document.body.appendChild(script);
}

/**
 * @param {string|HTMLElement} selector
 */
function showCopyMenu (selector) {
    document.querySelectorAll(".menu-context").forEach(el => el.remove());

    /** @type {HTMLElement} */
    let $selector = typeof selector === "string" ? document.querySelector(selector) : selector;
    let selectorRect = $selector.getBoundingClientRect();

    let menu = document.createElement("div");
    menu.className = "menu-context";
    menu.innerHTML = "Копировать";

    let $menu = $selector.closest(".page, .alert").appendChild(menu);
    let menuRect = $menu.getBoundingClientRect();

    menu.style.top = selectorRect.top + "px";
    menu.style.left = (selectorRect.left + selectorRect.width / 2 - menuRect.width / 2) + "px";

    let closeCopyMenu = function (e) {
        if (e.target === menu) {
            e.preventDefault();
            console.log("INFORMATION COPIED");
            // @TODO: copy information
        }

        menu.remove();
        document.removeEventListener("touchstart", closeCopyMenu);
    };

    document.addEventListener("touchstart", closeCopyMenu, {
        passive: false
    });
}