const auth = (login, password) => {
  return new Promise((resolve, reject) => {
    try {
      window.getAuthRequestResult = (errorCode, errorDescription) => {
        if (errorCode === '') {
          resolve('Ok');
        } else {
          reject(errorCode);
        }
      };
      window.androidJsBridge.getAuthRequest(login, password);
    } catch (ex) {
      if (window.iosJsBridge && window.iosJsBridge.call) {
        window.iosJsBridge
          .call('getAuthRequest', [login, password].join(','))
          .then(resolve)
          .catch(reject);
      } else {
        reject('No API');
      }
    }
  });
};

export default auth;
