const clearCache = () => {
  return new Promise((resolve, reject) => {
    if (window.androidJsBridge && window.androidJsBridge.clearCache) {
      let info = window.androidJsBridge.clearCache();
      resolve(info);
    } else if (window.iosJsBridge && window.iosJsBridge.call) {
      window.iosJsBridge &&
        window.iosJsBridge
          .call('clearCache')
          .then(resolve)
          .catch(reject);
    } else {
      reject('Not implemented');
    }
  });
};

export default clearCache;
