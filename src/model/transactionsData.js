import { format } from 'date-fns';
import { groupBy, uniqBy } from 'lodash-es';

const currencies = {
  1: 'TMH',
  2: 'BTC',
  3: 'ETH',
  4: '#MHC',
};

const addZero = item => {
  let res = item > 9 ? item : `0${item}`;
  return res;
};

const getTransactionsDataRaw = currency => {
  return new Promise((resolve, reject) => {
    try {
      window.getWalletsHistoryResult = wallets => {
        let txs = JSON.parse(wallets);
        console.log('txs ', txs);
        txs = uniqBy(txs, 'transaction');
        console.log('txs ', txs);
        resolve(txs);
      };
      window.androidJsBridge.getWalletsHistory(currency);
    } catch (ex) {
      if (window.iosJsBridge && window.iosJsBridge.call) {
        window.iosJsBridge
          .call('getWalletsHistory', currency)
          .then(wallets => {
            let txs = JSON.parse(wallets);
            txs = uniqBy(txs, 'id');
            resolve(txs);
          })
          .catch(reject);
      } else {
        resolve([]);
      }
    }
  });
};

const getTransactionsData = currency => {
  return getTransactionsDataRaw(currency).then(data => {
    data = data.map(x => {
      let date = new Date(x.timestamp * 1000);
      let hours = addZero(date.getHours());
      let minutes = addZero(date.getMinutes());
      let seconds = addZero(date.getSeconds());
      x.date = format(date, 'MM/DD/YYYY');
      x.timeMod = hours > 12 ? 'PM' : 'AM';
      if (hours > 12) {
        hours -= 12;
      }
      x.time = [hours, minutes, seconds].join(':');
      x.currency = currencies[currency];
      x.amount = x.value / 1e6;
      return x;
    });

    data = groupBy(data, x => x.date);

    return data;
  });
};

export default getTransactionsData;
