/**
 * @param {ViewConfig} config
 * @constructor
 */
function LoaderView (config) {
    config = Object.assign(config, {
        dataSelector: "view.loader"
    });

    config.tasks = [
        new Task({
            view: this, interval: 3000, callback: function (/** @type {View} */ view, /** @type {Task} */ task) {
                let tipElement = view.element.qs("tip");
                task.tip = task.tip || 0;
                task.tip++;
                if (task.tip > 10) {
                    task.tip = 1;
                }
                tipElement.qs("tip.header").innerHTML = __("loaderview.tips.header") + " " + task.tip + ":";
                tipElement.qs("tip.text").innerHTML   = __("loaderview.tips.tip" + task.tip);
            }.bind(null, this)
        })/*,
        new Task({
            view: this, interval: 100, callback: function (/!** @type {View} *!/ view, /!** @type {Task} *!/ task) {
                let loaderElement = view.element.querySelector(".loader");
                let progress = Math.floor(view.progress / 25);
                [1, 2, 3, 4].forEach(function (i) {
                    loaderElement.classList.remove("loader--" + i);
                });
                loaderElement.classList.add("loader--" + progress);
            }.bind(null, this)
        })*/
    ];

    View.apply(this, arguments);
}

extendFunction(LoaderView, View);

LoaderView.prototype.onStarted = function () {
    this.progress = 0;
    this.element.querySelector(".loader-connection-status").innerHTML = __("loaderview.message.connecting");

};
