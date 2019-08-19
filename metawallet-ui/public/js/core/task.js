/**
 * @param {TaskConfig} config
 * @constructor
 */
class Task {
    constructor (config) {
        this.__id = id();
        // console.log("+Task", this.__id, config);
        /**
         * @type {TaskConfig}
         * @private
         */
        this._config = config;
        this.view = config.view;
        this.interval = config.interval;
        this.callback = config.callback;
    }
    start () {
        // console.log("Task.start", this.__id);
        this.stop();
        /**
         * @private
         */
        this._interval = setInterval(function () {
            this.callback(this);
        }.bind(this), this.interval);
        this.callback(this);
    }
    stop () {
        // console.log("Task.stop", this.__id);
        if (this._interval) {
            clearInterval(this._interval);
        }
    }
}