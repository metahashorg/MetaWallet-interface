const VIEW_PAGE = 1;
const VIEW_ALERT = 2;
const VIEW_ALERT_SLIDE = 5;
const VIEW_MODAL = 3;
const VIEW_SUBVIEW = 4;

/**
 * @param {ViewConfig} config
 * @constructor
 */
function View (config) {
    this.__id = id();
    // console.log("+View", this.__id, config);

    /** @type {Array<Task>} */
    this.tasks = config.tasks || [];

    /**
     * @type {ViewConfig}
     * @private
     */
    this._config = config;

    /** @type {App|MetaWallet} */
    this.app = config.app;

    /** @type {number} */
    this.type = config.type || VIEW_PAGE;

    /** @type {string} */
    this.cssDisplayProp = config.cssDisplayProp || "block";

    /** @type {boolean} */
    this.clone = config.clone || false;

    /** @type {boolean} */
    this.hideArrow = config.hideArrow || false;

    /** @type {HTMLElement|Node|xD} */
    let element = xD(config.element ? config.element : (config.dataSelector ? xD(document.body).qs(config.dataSelector) : document.querySelector(config.selector)));
    if (this.clone) {
        /** @type {HTMLElement} */
        let elementClone = /** @type {HTMLElement} */ element.cloneNode(true);
        element.parentNode.insertBefore(elementClone, element.nextSibling);
        element = xD(elementClone);
        element.removeAttribute("data-selector");
    }
    this.element = element;
    this.element.hide();

    /** @type {HTMLElement|xD|null} */
    this.loader = null;

    /**
     * @type {?Function}
     * @private
     */
    this._resolve = null;

    /**
     * @type {?Function}
     * @private
     */
    this._reject = null;

    this.onCreated();
}

/**
 * Start view
 * @param {Function=} resolve
 * @param {Function=} reject
 */
View.prototype.start = function (resolve, reject) {
    this._resolve = resolve;
    this._reject = reject;

    for (let task of this.tasks) {
        task.start();
    }

    this.onStarted();
};

/**
 * Stop view
 */
View.prototype.stop = function () {
    for (let task of this.tasks) {
        task.stop();
    }

    if (this.clone) {
        this.element.parentNode.removeChild(this.element);
    }

    this.onStopped();

    this.onDestroyed();
};

/**
 * Show view
 */
View.prototype.show = function () {
    this.onBeforeShown();
    this.element.show(this.cssDisplayProp);
    this.onShown();
};

/**
 * Hide view
 */
View.prototype.hide = function () {
    this.onBeforeHidden();
    this.element.hide();
    this.onHidden();
};

/**
 * Return result to parent view
 */
View.prototype.resolve = function () {
    this.stop();
    if (this._resolve) {
        this._resolve();
    }
};

/**
 * Return error to parent view
 */
View.prototype.reject = function () {
    this.stop();
    if (this._reject) {
        this._reject();
    }
};

/**
 * Called when view should redraw itself
 */
View.prototype.update = function () {
};

/**
 * Called after view was created
 * Start timers, add event listeners, init ui, etc.
 */
View.prototype.onStarted = function () {
};

/**
 * Called after view was removed from DOM
 * Stop timers, remove event listeners, etc.
 */
View.prototype.onStopped = function () {
};

/**
 * Called before view is shown
 */
View.prototype.onBeforeShown = function () {
};

/**
 * Called after view was shown
 */
View.prototype.onShown = function () {
};

/**
 * Called before view is hidden
 */
View.prototype.onBeforeHidden = function () {
};

/**
 * Called after view was hidden
 */
View.prototype.onHidden = function () {
};

// Project specific methods

/**
 * View created from HTML Node. Adding event listeners on standard UI elements
 */
View.prototype.onCreated = function () {
    /** @type {HTMLElement} */
    this._backBtnElement = this.element.querySelector(".icon-arrow-back");

    if (this.hideArrow) {
        xD(this._backBtnElement).hide();
    } else if (this._backBtnElement) {
        xD(this._backBtnElement).show();
        this._backBtnElement.onclick = function () {
            if (!this._disallowPrev) {
                this.app.prevView();
            }
        }.bind(this);

        /** @type {HTMLElement} */
        this._alertElement = this._backBtnElement.closest(".alert");
        if (this._alertElement) {
            this._alertElement.onclick = function (/** @type {MouseEvent} */ event) {
                if (event.target !== this._alertElement) {
                    return;
                }
                if (!this._disallowPrev) {
                    this.app.prevView();
                }
            }.bind(this);
        }

        /** @type {HTMLElement} */
        this._pageElement = this._backBtnElement.closest(".page") || this.element.closest(".settings-page");
        if (this._pageElement) {
            initSwipeDetect(this.app, this._pageElement, this.__id);
        }
    }

    /** @type {HTMLElement} */
    this._dotsElement = this.element.querySelector(".icon-menu-dots");
    if (this._dotsElement) {
        this._dotsElement.onclick = function () {
            this.app.alertView(new MenuView(/** @type {ViewConfig} */ {app: this.app}));
        }.bind(this);
    }

    /** @type {HTMLElement} */
    this._btmMenuHandleElement = this.element.querySelector(".btm-menu-handle");

    if (this._btmMenuHandleElement) {
        this._btmMenuHandleElement.onclick = function (/** @type {TouchEvent|MouseEvent} */ event) {
            event.stopPropagation();
            if (!this._disallowPrev) {
                this.app.prevView();
            }
        }.bind(this);

        /** @type {HTMLElement} */
        let page = this._btmMenuHandleElement.closest(".btm-menu");
        /** @type {App} */
        let app = this.app;

        this._btmMenuHandleDraggable = Draggable.create(page, {
            trigger: this._btmMenuHandleElement,
            type: "y",
            edgeResistance: 0.95,
            bounds: {minY: 0, maxY: screen.height},
            onDragEnd: function () {
                if (this.endY >= this.target.getBoundingClientRect().height * UI_ALERTSLIDEVIEW_THRESHOLD) {
                    app.prevView();
                } else {
                    TweenMax.to(this.target, UI_ALERTSLIDEVIEW_TIME_R / 10, {y: "5%"});
                }
            }
        });
        // console.log(this._btmMenuHandleDraggable);
    }
};

/**
 * View destroyed. Removing event listeners from standard UI elements
 */
View.prototype.onDestroyed = function () {
    if (this._backBtnElement) {
        this._backBtnElement.onclick = function () {};
    }

    if (this._alertElement) {
        this._alertElement.onclick = function () {};
    }

    if (this._pageElement) {
        removeSwipeDetect(this._pageElement, this.__id);
    }

    /** @type {HTMLElement} */
    if (this._dotsElement) {
        this._dotsElement.onclick = function () {};
    }

    /** @type {HTMLElement} */
    if (this._btmMenuHandleElement) {
        this._btmMenuHandleElement.onclick = function (event) {};
    }

    if (this._btmMenuHandleDraggable) {
        this._btmMenuHandleDraggable.forEach(function (draggable) {
            draggable.kill();
        });
    }
};

View.prototype.disallowPrev = function () {
    /**
     * @type {boolean}
     * @private
     */
    this._disallowPrev = true;

    if (this._backBtnElement) {
        this._backBtnElement.hide();
    }
};

View.prototype.allowPrev = function () {
    delete this._disallowPrev;

    if (this._backBtnElement) {
        this._backBtnElement.show();
    }
};