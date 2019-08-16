/**
 * @param {number} number
 * @param {number=} decimals
 * @param {string=} decPoint
 * @param {string=} thousandsSep
 * @returns {string}
 */
function formatNum (number, decimals, decPoint, thousandsSep) {
    decimals     = typeof decimals !== "undefined" ? decimals : 2;
    decPoint     = decPoint || ".";
    thousandsSep = thousandsSep || ",";

    let func = decimals >= 0 || number >= 1 ? "toFixed" : "toPrecision";
    decimals = Math.abs(decimals);

    let i = parseInt(number = (+number || 0)[func](decimals)) + "";

    let j = i.length;
    if (j > 3) {
        j = j % 3;
    } else {
        j = 0;
    }

    let km = (j ? i.substr(0, j) + thousandsSep : "");
    let kw = i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousandsSep);
    let kd = (decimals ? decPoint + Math.abs(number - i)[func](decimals).replace(/-/, "0").slice(2) : "");

    return km + kw + kd;
}