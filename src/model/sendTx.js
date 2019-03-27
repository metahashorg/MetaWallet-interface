const sendTx = (from, password, to, amount, fee, data) => {
  return new Promise((resolve, reject) => {
    try {
      window.sendTMHTxResult = res => {
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
      if (window.androidJsBridge && window.androidJsBridge.sendTMHTx) {
        window.androidJsBridge.sendTMHTx(from, password, to, amount, fee, data);
      } else if (window.iosJsBridge && window.iosJsBridge.call) {
        window.iosJsBridge
          .call('sendTMHTx', [from, password, to, amount, fee, data].join(','))
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
