import getCurrenciesCourses from './getCurrenciesCourses';

const getDiff = arr => {
  let lastEl = arr[arr.length - 1].val * 1;
  let prevEl = arr[arr.length - 2].val * 1;
  let diff = lastEl - prevEl;
  return prevEl !== 0 ? ((diff / prevEl) * 100).toFixed(2) : 0;
};

const normalize = arr => {
  let vals = arr.map(x => x.val);
  let ratio = Math.max.apply(Math, vals) / 100;
  return arr.map(x => {
    x.val = Math.round(x.val / ratio);
    return x;
  });
};

const getCurrenciesData = () => {
  return getCurrenciesCourses().then(data => {
    return new Promise((resolve, reject) => {
      window.mhcData = [];
      window.mhcDataNorm = [];
        data.data[1].forEach(x => {
          
          window.mhcData.push({
            ts: x.ts,
            val: x.val*1
          })
        });
        
        

      let zeroData = data.data[4].slice(0);
      zeroData.map((x, i) => {
        x.val = 1;

        return x;
      });
      resolve([
        {
          currencyName: 'TestMetahash',
          balanceFloor: '0',
          balanceResidue: '00',
          currencyCode: 'TMH',
          usdBalanceFloor: '0',
          usdBalanceResidue: '00',
          walletsCount: 0,
          tokensCount: 0,
          course: '0.0',
          diff: '0',
          id: 1,
          idx: 1,
          data: zeroData,
        },

        {
          currencyName: 'Bitcoin',
          balanceFloor: '0',
          balanceResidue: '00',
          currencyCode: 'BTC',
          usdBalanceFloor: '0',
          usdBalanceResidue: '00',
          walletsCount: 0,
          tokensCount: 0,
          course: data.data[2][data.data[2].length - 1].val,
          diff: getDiff(data.data[2]),
          id: 2,
          idx: 2,
          data: normalize(
            data.data[2].map(x => {
              x.val = x.val * 1;
              return x;
            })
          ),
        },
        {
          currencyName: 'Ethereum',
          balanceFloor: '0',
          balanceResidue: '00',
          currencyCode: 'ETH',
          usdBalanceFloor: '0',
          usdBalanceResidue: '00',
          walletsCount: 0,
          tokensCount: 0,
          course: data.data[3][data.data[3].length - 1].val,
          diff: getDiff(data.data[3]),
          id: 3,
          idx: 3,
          data: normalize(
            data.data[3].map(x => {
              x.val = x.val * 1;
              return x;
            })
          ),
        },
        {
          currencyName: 'Metahash',
          balanceFloor: '0',
          balanceResidue: '00',
          currencyCode: '#MHC',
          usdBalanceFloor: '0',
          usdBalanceResidue: '00',
          walletsCount: 0,
          tokensCount: 0,
          course: data.data[1][data.data[1].length - 1].val,
          diff: getDiff(data.data[1]),
          id: 4,
          idx: 0,
          data: normalize(
            data.data[1].map(x => {
              x.val = x.val * 1;
              return x;
            })
          ),
        },
      ]);
    });
  });
};

export default getCurrenciesData;
