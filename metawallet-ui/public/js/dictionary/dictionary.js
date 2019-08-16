/**
 * @type {Object}
 */
const Dictionary = {};

/**
 * @param {...*}
 * @return {?*}
 */
Dictionary.get = function () {
    let dict = this;
    for (let i of arguments) {
        if (dict[i]) {
            dict = dict[i];
        } else {
            return null;
        }
    }

    return dict;
};