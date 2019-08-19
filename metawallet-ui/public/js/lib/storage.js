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
function storageGet (key, defaultVal, cast) {
    let defaultValue = typeof defaultVal !== "undefined" ? defaultVal : null;

    /** @type {Object|string|number|null} */
    let value = null;
    try {
        value = window.localStorage.getItem(key);
    } catch (e) {
        value = null;
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
function storageSet (key, value, options) {
    if (typeof value === "object") {
        value = JSON.stringify(value);
    }

    try {
        window.localStorage.setItem(key, value);
    } catch (e) {
        console.log(e);
    }
}

/**
 * @param {string} key
 */
function storageRemove (key) {
    try {
        window.localStorage.removeItem(key);
    } catch (e) {
        console.log(e);
    }
}

// @todo добавить метод полной очистки хранилища - clear