const importWallet = (
  address,
  pkey,
  name,
  password,
  currency,
  currency_code
) => {
  return new Promise((resolve, reject) => {
    if (window.androidJsBridge && window.androidJsBridge.importWallet) {
      window.androidJsBridge.importWallet(
        address,
        pkey,
        password,
        currency,
        currency_code,
        name
      );
      window.importWalletResult = resolve;
      window.createAddressResult = resolve;
    } else if (window.iosJsBridge && window.iosJsBridge.call) {
      window.iosJsBridge &&
        window.iosJsBridge
          .call(
            'importWallet',
            [address, pkey, name, password, currency, currency_code].join(',')
          )
          .then(resolve)
          .catch(reject);
    } else {
      reject('Not implemented');
    }
  });
};

export default importWallet;
