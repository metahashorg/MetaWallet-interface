/**
 * @param {ViewConfig} config
 * @constructor
 */
class LoaderView extends View {
    constructor (config) {
        config = Object.assign(config, {
            dataSelector: "view.loader"
        });
        super(config, config);
        config.tasks = [
            new Task({
                view: this,
                interval: 3000,
                callback: function ( /** @type {View} */ view, /** @type {Task} */ task) {
                    let tipElement = view.element.qs("tip");
                    task.tip = task.tip || 0;
                    task.tip++;
                    if (task.tip > 10) {
                        task.tip = 1;
                    }
                    tipElement.qs("tip.header").innerHTML = __("loaderview.tips.header") + " " + task.tip + ":";
                    tipElement.qs("tip.text").innerHTML = __("loaderview.tips.tip" + task.tip);
                }.bind(null, this)
            })
        ];
        View.apply(this, arguments);
    }
    onStarted () {
        this.progress = 0;
        this.element.querySelector(".loader-connection-status").innerHTML = __("loaderview.message.connecting");
    }
}