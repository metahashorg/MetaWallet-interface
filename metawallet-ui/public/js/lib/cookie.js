/**
 * @typedef {Object} CookieOptions
 * @property {string} path
 * @property {expires} number
 */

/**
 * @param {string} key
 * @param {Object|string|number|null=} defaultVal
 * @param {Function=} cast
 * @return {Object|string|number|null}
 */
function getCookie (key, defaultVal, cast) {
    let defaultValue = typeof defaultVal !== "undefined" ? defaultVal : null;

    /** @type {Object|string|number|null} */
    let value = null;
    try {
        value = window.localStorage.getItem(key);
    } catch (e) {
        value = null;
    }

    if (value === null) {
        try {
            /** @type {Array<string>} */
            let cookies = document.cookie.split(";");
            for (let i = 0; i < cookies.length; i++) {
                let cookie = cookies[i].replace(/^\s*/, "").split("=");
                if (cookie[0] === key) {
                    value = cookie[1];
                    break;
                }
            }
        } catch (e) {
            value = null;
        }
    }

    if (cast && value !== null) {
        value = cast(value);
    }

    return value !== null ? value : defaultValue;
}

/**
 * @param {string} key
 * @param {string|number|Object|null} value
 * @param {CookieOptions=} options
 */
function setCookie (key, value, options) {
    if (typeof value === "object") {
        value = JSON.stringify(value);
    }

    try {
        window.localStorage.setItem(key, value);
    } catch (e) {
        //
    }

    options = options || {};

    let path = options.path || "/";
    let expires = options.expires || 86400;
    let d = new Date();

    d.setTime(d.getTime() + expires * 1000);
    document.cookie = key + "=" + value + "; path=" + path + "; expires=" + d.toUTCString();
}

/**
 * @param {string} key
 */
function removeCookie (key) {
    return setCookie(key, null, {expires: -1});
}