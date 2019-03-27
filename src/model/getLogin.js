const getLogin = () => {
  if (window.androidJsBridge) {
    return new Promise((resolve, reject) => {
      resolve(window.androidJsBridge.getAuthData());
    });
  } else if (window.iosJsBridge) {
    return window.iosJsBridge.call('getAuthData');
  } else {
    return new Promise((resolve, reject) => {
      resolve('');
    });
  }
};

export default getLogin;
