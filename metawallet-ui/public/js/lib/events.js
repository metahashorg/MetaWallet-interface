/**
 * Event manager
 * @type {Object}
 */
const Events = {
    /**
     * @type {Object<string, Array<{callback: Function, context: Object}>>}
     * @private
     */
    _listeners: {}
};

/**
 * Add event listener
 * @param {string} event
 * @param {Function} callback
 * @param {Object=} context
 */
Events.addListener = function (event, callback, context) {
    // console.log("Events.addListener", event, callback);

    context = context || null;

    if (!Events._listeners[event]) {
        Events._listeners[event] = [];
    }
    Events._listeners[event].push({
        callback,
        context
    });
};

/**
 * Remove event listener
 * @param {string} event
 * @param {Function=} callback
 * @param {Object=} context
 */
Events.removeListener = function (event, callback, context) {
    // console.log("Events.removeListener", event, callback);

    callback = callback || null;
    context = context || null;

    if (Events._listeners[event]) {
        for (let i = 0; i < Events._listeners[event].length; i++) {
            let listener = Events._listeners[event][i];
            if ((listener.callback === callback || callback === null) && (listener.context === context || context === null)) {
                Events._listeners[event].splice(i, 1);
            }
        }
    }
};

/**
 * Trigger event
 * @param {string} event
 */
Events.trigger = function (event) {
    // console.log("Events.trigger", event);

    if (Events._listeners[event]) {
        for (let listener of Events._listeners[event]) {
            let args = [].slice.call(arguments, 1);
            listener.callback.apply(listener.context, args);
        }
    }
};