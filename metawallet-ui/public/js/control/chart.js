/**
 * Draw rates chart
 * @param {Array<number>} data
 * @param {string} selector - Parent element selector
 * @param {boolean=} fill - Fill chart
 */
function drawChart (data, selector, fill, desaturated) {
    /** @type {HTMLElement} */
    let element = typeof selector === "string" ? document.querySelector(selector) : selector;

    /** @type {number} */
    let graphW = element.clientWidth;
    /** @type {number} */
    let graphH = element.clientHeight;

    /** @type {number} */
    let xStep = graphW / data.length;

    let maxVal = data[0],
        minVal = data[0];
    for (let j = 0; j < data.length; j++) {
        if (data[j] > maxVal) {
            maxVal = data[j];
        }
        if (data[j] < minVal) {
            minVal = data[j];
        }
    }

    // расставляем точки на график
    let x = 0;
    let dots = [];
    for (let i = 0; i < data.length; i++) {
        let y = minVal === maxVal
            ? graphH / 2 // line
            : graphH - (data[i] - minVal) / (maxVal - minVal) * graphH;
        dots.push([x += xStep, y]);
    }

    // рисуем svg внутренности
    let rndID = ~~(Math.random() * 1000000);
    let html = '';
    html += '<svg class="currency-graph-svg" width="' + graphW + '" height="' + graphH + '" viewBox="0 0 ' + graphW + ' ' + graphH + '" fill="none" xmlns="http://www.w3.org/2000/svg">'
    if (fill) {
        html += '<path d="M' + dots.join(' L') + ' L' + graphW + ',' + graphH + ' L' + 0 + ',' + graphH + '" fill="url(#paint' + rndID + '_bg)" />';
    }
    html += '<path d="M' + dots.join(' L') + '" stroke="url(#paint' + rndID + '_linear)" stroke-linecap="round" stroke-linejoin="round" fill="none"/>';
    html += '<defs>';
    if (fill) {
        html += '<linearGradient id="paint' + rndID + '_bg" x1="' + (graphW / 2) + '" y1="0" x2="' + (graphW / 2) + '" y2="' + graphH + '" gradientUnits="userSpaceOnUse">';
        html +=   '<stop stop-color="#' + (desaturated ? 'BCBCBC' : '81BEF7') + '" stop-opacity="0.4"></stop>';
        html +=   '<stop offset="1" stop-color="#' + (desaturated ? '797979' : '2F7BC2') + '" stop-opacity="0"></stop>';
        html += '</linearGradient>';
        html += '<linearGradient id="paint' + rndID + '_linear" x1="' + (0.89 * graphW) + '" y1="' + (0.69 * graphH) + '" x2="' + (0.89 * graphW) + '" y2="1" gradientUnits="userSpaceOnUse">';
        html +=   '<stop stop-color="#' + (desaturated ? 'BCBCBC' : '81BEF7') + '"></stop>';
        html +=   '<stop offset="1" stop-color="#' + (desaturated ? 'CDCDCD' : '04D67E') + '"></stop>';
        html += '</linearGradient>';
    } else {
        html += '<linearGradient id="paint' + rndID + '_linear" x1="0" y1="' + (0.75 * graphH) + '" x2="' + graphW + '" y2="' + (0.3 * graphH) + '" gradientUnits="userSpaceOnUse">';
        html +=   '<stop stop-color="#' + (desaturated ? '353535' : '093360') + '"/>';
        html +=   '<stop offset="0.111278" stop-color="#' + (desaturated ? '555555' : '0F4E88') + '"/>';
        html +=   '<stop offset="0.948653" stop-color="#' + (desaturated ? 'DADADA' : '04D67E') + '"/>';
        html +=   '<stop offset="1" stop-color="#' + (desaturated ? '343434' : '09335E') + '"/>';
        html += '</linearGradient>';
    }
    html += '</defs>';
    html += '</svg>';

    element.innerHTML = html;
    if (!element.getAttribute("data-chart")) {
        element.setAttribute("data-chart", "1");
        TweenMax.fromTo(element, .1, {opacity: 0}, {opacity: 1});
    }
}
