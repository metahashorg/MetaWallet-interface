const logout = () => {
  if (window.androidJsBridge && window.androidJsBridge.logOut) {
    return new Promise((resolve, reject) => {
      resolve(window.androidJsBridge.logOut());
    });
  } else if (window.iosJsBridge) {
    return window.iosJsBridge.call('logOut');
  } else {
    return new Promise((resolve, reject) => {
      resolve('');
    });
  }
};

export default logout;
