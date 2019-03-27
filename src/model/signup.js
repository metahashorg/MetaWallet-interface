const signup = (login, password) => {
  return new Promise((resolve, reject) => {
    try {
      window.signUpResult = (errorCode, errorDescription) => {
        if (errorCode === '') {
          resolve('Ok');
        } else {
          reject(errorCode);
        }
      };
      window.androidJsBridge.signUp(login, password);
    } catch (ex) {
      if (window.iosJsBridge && window.iosJsBridge.call) {
        window.iosJsBridge
          .call('signUp', [login, password].join(','))
          .then(resolve)
          .catch(reject);
      } else {
        reject('No API');
      }
    }
  });
};

export default signup;
