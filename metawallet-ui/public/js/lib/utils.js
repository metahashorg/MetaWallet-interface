/**
 * Generate random number
 * @param {number} min
 * @param {number} max
 * @return {number}
 */
function rand (min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

/**
 * Generate random id
 * @return {string}
 */
function id () {
    return Date.now() + "" + rand(1, 100000);
}

/**
 * Get current UNIX timestamp
 * @return {number}
 */
function time () {
    return ~~(Date.now() / 1000);
}

/**
 * Convert DateTime to Unix Timestamp
 * @param {string} datetime
 * @return {number}
 */
function strtotime (datetime) {
    let _ = datetime.split(/[^0-9]/);
    _ = _.map(function (i) {
        return parseInt(i);
    });
    return (new Date (_[0], _[1]-1, _[2], _[3], _[4], _[5])).getTime() / 1000;
}

/**
 * @param {Array|Object|string} val
 * @return {?number}
 */
function len (val) {
    if (Array.isArray(val) || typeof val === "string") {
        return val.length;
    } else if (typeof val === "object") {
        let length = 0;
        for (let _ in val) {
            length++;
        }
        return length;
    }

    return null;
}

/**
 * @param {Object|Array} arr
 * @return {*}
 */
function shift (arr) {
    if (Array.isArray(arr)) {
        return arr[0];
    }

    for (let i in arr) {
        return arr[i];
    }
}

/**
 * @param {string} str
 * @param {number} len
 * @return {Array<string>}
 */
function strsplit (str, len) {
    let arr = [];
    while (str.length > len) {
        arr.push(str.substr(0, len));
        str = str.substr(len);
    }
    arr.push(str);

    return arr;
}

/**
 * @param {string} str
 * @return {string}
 */
function qrBefore (str) {
    return str.replace(/\n/g, "@@@");
}

/**
 * @param {string} str
 * @return {string}
 */
function qrAfter (str) {
    return str.replace(/@@@/g, "\n");
}

/**
 * @param {number=} len
 * @return {string}
 */
function generatePassword (len) {
    len = len || 11;

    let characters = "abcdefghijklmnopqrstuvwxyz0123456789-!@#$%^&*+";
    let password = "";
    for (let i = 0; i < len; i++) {
        let char = characters[rand(0, characters.length - 1)];
        password += rand(0, 1) ? char.toUpperCase() : char;
    }

    return password;
}

/**
 * @param {string} str
 * @return {string}
 */
function escapeHtml (str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * @param {string} hex
 * @return {string}
 */
function hex2ascii (hex) {
    hex = hex.toString();

    let str = "";
    for (let i = 0; i < hex.length; i += 2) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }

    return str;
}
