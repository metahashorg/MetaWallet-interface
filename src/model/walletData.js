import getCurrenciesCourses from './getCurrenciesCourses';

const getWalletDataRaw = currency => {
  return getCurrenciesCourses().then(data => {
    return new Promise((resolve, reject) => {
      try {
        window.getWalletsDataResult = wallets => {
          resolve(JSON.parse(wallets));
        };
        window.androidJsBridge.getWalletsData(currency);
      } catch (ex) {
        if (window.iosJsBridge && window.iosJsBridge.call) {
          window.iosJsBridge
            .call('getWalletsData', currency)
            .then(wallets => {
              resolve(JSON.parse(wallets));
            })
            .catch(reject);
        } else {
          resolve([
            {
              name: 'x',
              address: '0x384327097fd0382093242344',
              hasPrivateKey: false,
            },
            {
              name: 'x1',
              address: '0x384327097fd0382093242344',
              hasPrivateKey: false,
            },
            {
              name: 'x2',
              address: '0x384327097fd0382093242344',
              hasPrivateKey: true,
            },
            {
              name: 'x3',
              address: '0x384327097fd0382093242344',
              hasPrivateKey: true,
            },
            {
              name: 'x4',
              address: '0x384327097fd0382093242344',
              hasPrivateKey: true,
            },
            {
              name: 'x',
              address: '0x384327097fd0382093242344',
              hasPrivateKey: false,
            },
            {
              name: 'x12',
              address: '0x384327097fd0382093242344',
              hasPrivateKey: false,
            },
            {
              name: 'x22',
              address: '0x384327097fd0382093242344',
              hasPrivateKey: true,
            },
            {
              name: 'x32',
              address: '0x384327097fd0382093242344',
              hasPrivateKey: true,
            },
            {
              name: 'x42',
              address: '0x384327097fd0382093242344',
              hasPrivateKey: true,
            },
          ]);
        }
      }
    });
  });
};

const getWalletData = currency => {
  console.log('wallets: ', currency);
  return getWalletDataRaw(currency).then(data => {
    console.log('wallets: ', currency, data);
    data = data
      .map(x => {
        x.balance = x.balance / 1e6;
        x.balanceFloor = Math.floor(x.balance * 1);
        x.balanceResidue = (x.balance - x.balanceFloor)
          .toFixed(4)
          .replace('0.', '');
        x.usdBalance = 0;

        return x;
      })
      .sort((a, b) => {
        if (a.hasPrivateKey && !b.hasPrivateKey) {
          return -1;
        } else if (!a.hasPrivateKey && b.hasPrivateKey) {
          return 1;
        }
        return b.balance - a.balance;
      });

    return data;
  });
};

export default getWalletData;
