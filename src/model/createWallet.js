const createWallet = (name, password, currency, currency_code) => {
  return new Promise((resolve, reject) => {
    if (window.androidJsBridge && window.androidJsBridge.createAddress) {
      window.createAddressResult = address => {
        resolve(address);
      };
      window.androidJsBridge.createAddress(
        name,
        password,
        currency,
        currency_code
      );
    } else if (window.iosJsBridge && window.iosJsBridge.call) {
      window.iosJsBridge &&
        window.iosJsBridge
          .call(
            'createAddress',
            [name, password, currency, currency_code].join(',')
          )
          .then(resolve)
          .catch(reject);
    } else {
      reject('Not implemented');
    }
  });
};

export default createWallet;
