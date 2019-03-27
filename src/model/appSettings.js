const getOnlyLocal = () => {
  return new Promise((resolve, reject) => {
    try {
      let res = window.androidJsBridge.getOnlyLocalAddresses();
      resolve(res);
    } catch (ex) {
      if (window.iosJsBridge && window.iosJsBridge.call) {
        window.iosJsBridge
          .call('getOnlyLocalAddresses')
          .then(resolve)
          .catch(reject);
      } else {
        resolve(false);
      }
    }
  });
};

const setOnlyLocal = status => {
  return new Promise((resolve, reject) => {
    try {
      window.androidJsBridge.setOnlyLocalAddresses(status);
      resolve(status);
    } catch (ex) {
      if (window.iosJsBridge && window.iosJsBridge.call) {
        window.iosJsBridge
          .call('setOnlyLocalAddresses', status)
          .then(resolve)
          .catch(reject);
      } else {
        reject('No API');
      }
    }
  });
};

export { getOnlyLocal, setOnlyLocal };
