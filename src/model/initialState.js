const initialState = {
  isOffline: false,
  connecting: {
    error: false,
  },
  topHint: {
    text: 'default tip',
    type: 'tip',
    show: false,
  },
  createWallet: {
    cardNum: 0,
    toLeft: false,
    qrOpened: false,
  },

  homeMenu: false,
  settingsMenu: false,
  settingsSingleMenu: false,
  totalAssets: {
    activeTab: 'currency',
  },
  currencies: [],
  walletsData: [],
  wallets: {
    activeTab: 'wallets',
  },
  login: '',
  transactionsData: [],
  txWallet: '',
  txWalletData: {},
  currencyInfo: {
    mhcCourse: '0',
    mhcDiff: '0',
    usdBalanceFloor: '0',
    usdBalanceResidue: '00',
    currencyCode: 'TMH',
  },
  currencyName: 'TestMetaHash',
  popups: {
    activePopup: 'none',
  },
  onlyLocal: false,
  tips: {
    number: '',
    title: '',
    text: '',
  },
  qrKey: '',
  txStatus: 'sending',
  txPercent: 0,
  settingsSingleMenuType: 'wallet',
  settingsSendRequest: false,
  settingsResendRequest: false,
  settingsSingle: {
    init: true,
    opened: false,
    type: 'wallet',
  },
  connectingStatus: 'Connecting...',
  verticalMenu: {
    init: true,
    opened: false,
    type: 'settings',
  },
  currency: '1',
  currencyCode: 'MHC',
};

export default initialState;
