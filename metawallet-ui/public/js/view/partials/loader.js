/**
 * @param {View} view
 */
function showLoader (view) {
    view.loader = view.app.showNotification({text: __("common.pleasewait"), type: NOTIFICATION_LOADING, hideTimeout: UI_ERROR_NOTIFICATION_NO_TIMEOUT});
    view.disallowPrev();
}

/**
 * @param {View} view
 */
function hideLoader (view) {
    if (view.loader) {
        view.app.hideNotification(view.loader);
        view.loader = null;
        view.allowPrev();
    }
}