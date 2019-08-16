/**
 * @typedef {Object} XhrParams
 * @property {string} url
 * @property {"GET"|"POST"} method
 * @property {Object|string} data
 * @property {boolean} withCredentials
 * @property {function(string):*} cast
 * @property {Object} headers
 * @property {string} referrer
 * @property {boolean} cors
 * @property {string} accept
 * @property {Object<string, string>} headers
 * @property {boolean} keepalive
 */

/**
 * @param {Object|string} dataParam
 * @param {string} method
 * @return string
 */
function xhrGetPreparedData (dataParam, method) {
    let data = dataParam || {};

    if (typeof data === "string") {
        return data;
    }

    let preparedData = [];
    for (let i in data) {
        preparedData.push(i + "=" + encodeURIComponent(data[i]));
    }

    return method === "GET"
        ? (preparedData.length ? "?" + preparedData.join("&") : "")
        : (preparedData.join("&"));
}

/**
 * @param {XhrParams} params
 * @return {Promise<*>}
 */
function xhr (params) {
    let method = params.method || "GET";
    let withCredentials = typeof params.withCredentials !== "undefined" ? params.withCredentials : false;
    let preparedData = xhrGetPreparedData(params.data, method);

    return new Promise(function (resolve, reject) {
        let xhRequest = new XMLHttpRequest();

        xhRequest.onerror = function (e) {
            reject(e.message, 500);
        };

        xhRequest.onreadystatechange = function () {
            if (xhRequest.readyState !== XMLHttpRequest.DONE) {
                return;
            }

            let data;
            if (xhRequest.responseText) {
                data = xhRequest.responseText;
                if (params.cast) {
                    try {
                        data = params.cast(data);
                    } catch (e) {
                        reject(e.message, xhRequest.status);
                    }
                }
            }

            if (xhRequest.status === 400){
                reject(data, xhRequest.status);
            }

            if (xhRequest.status === 200) {
                resolve(data);
            } else {
                reject(data, xhRequest.status);
            }
        };

        xhRequest.open(method, params.url, true);

        if (method === "POST") {
            xhRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        }

        if (params.headers) {
            for (let header in params.headers) {
                if (!params.headers.hasOwnProperty(header)) {
                    continue;
                }
                xhRequest.setRequestHeader(header, params.headers[header]);
            }
        }

        if (withCredentials) {
            xhRequest.withCredentials = true;
        }

        xhRequest.timeout = API_XHR_TIMEOUT;

        xhRequest.send(preparedData);
    });
}