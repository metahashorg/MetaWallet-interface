const getAppVersion = () => {
  return new Promise((resolve, reject) => {
    if (window.androidJsBridge && window.androidJsBridge.getAppVersion) {
      let info = window.androidJsBridge.getAppVersion();
      resolve(info);
    } else if (window.iosJsBridge && window.iosJsBridge.call) {
      window.iosJsBridge &&
        window.iosJsBridge
          .call('getAppVersion')
          .then(resolve)
          .catch(reject);
    } else {
      reject('Not implemented');
    }
  });
};

export default getAppVersion;
