const sendTx = (from, password, to, amount, fee, data, currency) => {
  return new Promise((resolve, reject) => {
    try {
      window.sendTxResult = res => {
        try {
          if (res !== 'WRONG_PASSWORD') {
            resolve(JSON.parse(res));
          } else {
            reject('Incorrect password');
          }
        } catch (ex) {
          reject(ex);
        }
      };

      window.onTxChecked = res => {
        try {
          resolve(JSON.parse(res));
        } catch (ex) {
          reject(ex);
        }
      };
      if (window.androidJsBridge && window.androidJsBridge.sendTx) {
        window.androidJsBridge.sendTx(
          from,
          password,
          to,
          amount,
          fee,
          data,
          currency
        );
      } else if (window.iosJsBridge && window.iosJsBridge.call) {
        window.iosJsBridge
          .call(
            'sendTx',
            [from, password, to, amount, fee, data, currency].join(',')
          )
          .then(res => {
            window.onTxChecked = res => {
              try {
                resolve(JSON.parse(res));
              } catch (ex) {
                reject(ex);
              }
            };
          })
          .catch(reject);
      } else {
        reject('Not implemented');
      }
    } catch (ex) {
      reject(ex);
    }
  });
};

export default sendTx;
