const getPrivateKey = (address, password) => {
  if (window.androidJsBridge && window.androidJsBridge.getPrivateKey) {
    return new Promise((resolve, reject) => {
      resolve(window.androidJsBridge.getPrivateKey(address, password));
    });
  } else if (window.iosJsBridge) {
    return window.iosJsBridge.getPrivateKey();
  } else {
    return new Promise((resolve, reject) => {
      resolve(address);
    });
  }
};

export default getPrivateKey;
