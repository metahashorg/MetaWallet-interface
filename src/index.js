import ReactDOM from 'react-dom';
import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { Switch, Route, HashRouter } from 'react-router-dom';

import LoginPage from './containers/LoginPage/LoginPage.jsx';
import SignUpPage from './containers/SignUpPage/SignUpPage.jsx';
import ConnectingPage from './containers/ConnectingPage/ConnectingPage.jsx';
import PasscodeSetup from './containers/PasscodeSetup/PasscodeSetup.jsx';
import PasscodeEnter from './containers/PasscodeEnter/PasscodeEnter.jsx';
import TermsPage from './containers/TermsPage/TermsPage.jsx';
import HomeWallets from './containers/HomeWallets/HomeWallets.jsx';
import CreateWallet from './containers/CreateWallet/CreateWallet.jsx';
import CreateTransfer from './containers/CreateTransfer/CreateTransfer.jsx';
import Wallets from './containers/Wallets/Wallets.jsx';
import PopupWallet from './components/PopupWallet/PopupWallet.jsx';
import PopupCreateWallet from './components/PopupCreateWallet/PopupCreateWallet.jsx';
import SettingsSingle from './components/SettingsSingle/SettingsSingle.jsx';
import TransferProgress from './containers/TransferProgress/TransferProgress.jsx';
import TopHint from './components/TopHint/TopHint.jsx';
import HomeMenu from './containers/HomeMenu/HomeMenu.jsx';
import VerticalMenu from './containers/VerticalMenu/VerticalMenu.jsx';
import PopupCreateWalletSwipe from './components/PopupCreateWalletSwipe/PopupCreateWalletSwipe.jsx';
import PopupIcloud from './components/PopupIcloud/PopupIcloud.jsx';
import auth from './model/mobile';
import signup from './model/signup';
import currenciesData from './model/currenciesData';
import walletData from './model/walletData';
import transactionsData from './model/transactionsData';
import getLogin from './model/getLogin';
import createWallet from './model/createWallet';
import importWallet from './model/importWallet';
import sendTx from './model/sendTx';
import sendTxMHC from './model/sendTxMHC';
import logout from './model/logout';
import getPrivateKey from './model/getPrivateKey';
import { getOnlyLocal, setOnlyLocal } from './model/appSettings';
import tips from './model/tips';
import { getMonth, isInMonth } from './model/getMonth';
import copy from 'copy-to-clipboard';
import PasswordSave from './containers/PasswordSave/PasswordSave.jsx';
import initialState from './model/initialState';
import ScrollToTop from 'react-router-scroll-top';

import registerServiceWorker from './registerServiceWorker';
import './version';

let location = window.location;

window.getAuthRequestResult =
  window.getAuthRequestResult ||
  ((errorCode, errorDesc) => {
    if (errorCode) {
      onAuthError(errorCode);
    }
  });

const onAuthSuccess = () => {
  location.href = '#/home-wallets';
  setTimeout(showIcloud, 1000);
  getLogin().then(login => {
    store.dispatch({
      type: 'LOGIN_UPDATE',
      login: login,
    });
  });
  walletData('1').then(data => {
    console.log('wld3');
    store.dispatch({
      type: 'LOAD_WALLETS',
      wallets: data,
      currency: 0,
    });
    walletData('4').then(data => {
      console.log('wld4');
      store.dispatch({
        type: 'LOAD_WALLETS',
        wallets: data,
        currency: 3,
      });
    });
  });
};
const onAuthError = error => {
  if (error === 'BAD_TOKEN') {
    location.href = '#/login';
  } else {
    store.dispatch({
      type: 'SHOW_TOPHINT',
      payload: {
        text: error,
        type: 'warning',
        show: true,
      },
    });
  }
};

window.onConnectionError = error => {
  if (error === 'BAD_TOKEN') {
    location.href = '#/login';
  } else {
    store.dispatch({ type: 'CONNECTING-STATE_CHANGE', payload: 4 });
  }
};

let randomTips = tips.sort((a, b) => {
  return Math.random() - 0.5;
});

randomTips.forEach((tip, i) => {
  setTimeout(() => {
    store.dispatch({
      type: 'CHANGE_TIP',
      payload: { number: i + 1, text: tip.text, title: tip.title },
    });
  }, i * 8000);
});

window.onConnectionReady = isLogged => {
  if (isLogged) {
    walletData('1').then(data => {
      store.dispatch({
        type: 'LOAD_WALLETS',
        wallets: data,
        currency: 0,
      });
      walletData('4').then(data => {
        store.dispatch({
          type: 'LOAD_WALLETS',
          wallets: data,
          currency: 3,
        });
      });
    });

    getOnlyLocal().then(res => {
      store.dispatch({
        type: 'SETTINGS-ONLY_LOCAL',
        payload: res,
      });
    });
  }
  location.href = isLogged ? '#/home-wallets' : '#/login';
  getLogin().then(login => {
    store.dispatch({
      type: 'LOGIN_UPDATE',
      login: login,
    });
  });
};

window.updateConnectingStatus = status => {
  let s = JSON.parse(status);

  store.dispatch({ type: 'CONNECTING_STATUS_UPDATE', payload: s });
};

window.saveImportedWallet = (privKey, address, error) => {
  if (!error) {
    store.dispatch({
      type: 'QR_OPEN_NATIVE',
      payload: { key: privKey, address: address },
    });
  }
};

const authFunc = (login, password) => {
  auth(login, password)
    .then(onAuthSuccess)
    .catch(onAuthError);
};

const signUpFunc = (login, password) => {
  signup(login, password)
    .then(onSignUpSuccess)
    .catch(onSignUpError);
};

const onSignUpSuccess = status => {
  location.href = '#/home-wallets';
  let state = store.getState();
  getLogin().then(login => {
    store.dispatch({
      type: 'LOGIN_UPDATE',
      login: login,
    });
  });
  walletData(state.currency).then(data => {
    store.dispatch({
      type: 'LOAD_WALLETS',
      wallets: data,
      currency: state.currency - 1,
    });
  });
};

const onSignUpError = err => {
  store.dispatch({
    type: 'SHOW_TOPHINT',
    payload: {
      text: err,
      type: 'warning',
      show: true,
    },
  });
};

function states(state = initialState, action) {
  if (action.type === 'SHOW_TOPHINT') {
    return {
      ...state,
      topHint: action.payload,
    };
  }

  if (action.type === 'HIDE_TOPHINT') {
    return {
      ...state,
      topHint: {
        ...state.topHint,
        show: false,
      },
    };
  }

  if (action.type === 'MENU_OPEN') {
    return {
      ...state,
      homeMenu: true,
    };
  }

  if (action.type === 'MENU_CLOSE') {
    return {
      ...state,
      homeMenu: false,
    };
  }

  if (action.type === 'WALLETS_CHANGE-TAB') {
    return {
      ...state,
      wallets: {
        activeTab: action.payload,
      },
    };
  }

  if (action.type === 'TOTAL-ASSETS_CHANGE-TAB') {
    return {
      ...state,
      totalAssets: {
        activeTab: action.payload,
      },
    };
  }

  if (action.type === 'TOGGLE_MODE') {
    return {
      ...state,
      isOffline: !state.isOffline,
    };
  }

  if (action.type === 'LOAD_CURRENCIES') {
    return {
      ...state,
      currencies: action.currencies,
    };
  }

  if (action.type === 'LOAD_WALLETS') {
    let curData = state.currencies;
    curData[action.currency] = curData[action.currency] || {};

    let balance = 0;
    action.wallets.map(wallet => {
      balance += wallet.balance * 1 || 0;
      return balance;
    });
    curData[action.currency].walletsCount = action.wallets.length;
    curData[action.currency].balanceFloor = Math.floor(balance);
    curData[action.currency].balanceResidue = (balance - Math.floor(balance))
      .toFixed(6)
      .replace('0.', '');
    return {
      ...state,
      walletsData: action.wallets,
      currencies: curData,
    };
  }

  if (action.type === 'LOGIN_UPDATE') {
    return {
      ...state,
      login: action.login,
    };
  }

  if (action.type === 'CURRENCY_CLICK') {
    let id = action.id;
    let code = action.code;
    let name = id === 1 ? 'TestMetaHash' : 'MetaHash';
    walletData(id).then(data => {
      store.dispatch({
        type: 'LOAD_WALLETS',
        wallets: data,
        currency: id - 1,
      });
      location.href = '#/wallets';
    });
    transactionsData(id).then(data => {
      store.dispatch({
        type: 'LOAD_TRANSACTIONS',
        transactions: data,
      });
    });
    return {
      ...state,
      currency: id,
      currencyCode: code,
      currencyName: name,
      currencyInfo: {
        ...state.currencyInfo,
        currencyCode: code,
      },
    };
  }

  if (action.type === 'LOAD_TRANSACTIONS') {
    return {
      ...state,
      transactionsData: action.transactions,
    };
  }

  if (action.type === 'WALLETS_CLICK') {
    let wallets = state.walletsData;
    let txWalletData = wallets.filter(x => x.address === action.address)[0];
    let plus = 0;
    let minus = 0;
    let txData = [];
    Object.values(state.transactionsData).forEach(
      x => (txData = txData.concat(x))
    );
    let txDataPlus = txData
      .filter(x => x.to === action.address && isInMonth(x.timestamp * 1e3))
      .map(x => x.amount);
    let txDataMinus = txData
      .filter(x => x.from === action.address && isInMonth(x.timestamp * 1e3))
      .map(x => x.amount);
    txDataPlus.forEach(x => {
      plus += x * 1;
    });
    txDataMinus.forEach(x => {
      minus += x * 1;
    });

    txWalletData.month = getMonth();
    txWalletData.plus = plus;
    txWalletData.minus = minus;
    location.href = '#/create-transfer';

    return {
      ...state,
      txWallet: action.address,
      txWalletData: txWalletData,
    };
  }

  if (action.type === 'CREATE_WALLET') {
    createWallet(
      action.payload.name,
      action.payload.password,
      state.currencyCode,
      state.currency
    )
      .then(res => {
        walletData(state.currency).then(data => {
          store.dispatch({
            type: 'LOAD_WALLETS',
            wallets: data,
            currency: state.currency - 1,
          });
        });
        setTimeout(() => {
          walletData(state.currency).then(data => {
            store.dispatch({
              type: 'LOAD_WALLETS',
              wallets: data,
              currency: state.currency - 1,
            });
          });
        }, 2000);

        store.dispatch({
          type: 'POPUP_SHOW',
          payload: 'create-wallet',
        });
      })
      .catch(err => {
        store.dispatch({
          type: 'SHOW_TOPHINT',
          payload: {
            text: err,
            type: 'warning',
            show: true,
          },
        });
      });
  }

  if (action.type === 'SEND_TX') {
    if (state.currencyCode === 'TMH') {
      sendTxMHC(
        action.payload.from,
        action.payload.password,
        action.payload.to,
        action.payload.amount,
        action.payload.fee,
        action.payload.data,
        '1'
      )
        .then(res => {
          location.href = '#/transfer-progress';
          let percent = 50;
          window.onTxChecked = res => {
            percent += 30;
            if (percent >= 100) {
              percent = 100;
              store.dispatch({
                type: 'TX_STATUS_CHANGE',
                payload: {
                  txStatus: 'sended',
                  txPercent: percent,
                },
              });
            } else {
              store.dispatch({
                type: 'TX_STATUS_CHANGE',
                payload: {
                  txStatus: 'sending',
                  txPercent: percent,
                },
              });
            }
          };
        })
        .catch(err => {
          store.dispatch({
            type: 'SHOW_TOPHINT',
            payload: {
              text: JSON.stringify(err),
              type: 'warning',
              show: true,
            },
          });
        });
    } else if (state.currencyCode === 'MHC') {
      sendTxMHC(
        action.payload.from,
        action.payload.password,
        action.payload.to,
        action.payload.amount,
        action.payload.fee,
        action.payload.data,
        '4'
      )
        .then(res => {
          location.href = '#/transfer-progress';
          let percent = 50;
          window.onTxChecked = res => {
            percent += 30;
            if (percent >= 100) {
              percent = 100;
              store.dispatch({
                type: 'TX_STATUS_CHANGE',
                payload: {
                  txStatus: 'sended',
                  txPercent: percent,
                },
              });
            } else {
              store.dispatch({
                type: 'TX_STATUS_CHANGE',
                payload: {
                  txStatus: 'sending',
                  txPercent: percent,
                },
              });
            }
          };
        })
        .catch(err => {
          store.dispatch({
            type: 'SHOW_TOPHINT',
            payload: {
              text: JSON.stringify(err),
              type: 'warning',
              show: true,
            },
          });
        });
    }
  }

  if (action.type === 'LOG_OUT') {
    logout();
  }

  if (action.type === 'POPUP_HIDE') {
    return {
      ...state,
      popups: {
        ...state.topHint,
        activePopup: 'none',
      },
    };
  }

  if (action.type === 'CREATEWALLET-CHANGECARD') {
    return {
      ...state,
      createWallet: {
        cardNum: (state.createWallet.cardNum + 1) % 2,
        toLeft: action.payload,
      },
    };
  }

  if (action.type === 'CONNECTING-STATE_CHANGE') {
    switch (action.payload) {
      case 1:
        return {
          ...state,
          isOffline: true,
          connecting: {
            error: false,
            showTip: false,
          },
        };

      case 2:
        return {
          ...state,
          isOffline: false,
          connecting: {
            error: false,
            showTip: false,
          },
        };

      case 3:
        return {
          ...state,
          isOffline: true,
          connecting: {
            error: false,
            showTip: true,
          },
        };

      case 4:
        return {
          ...state,
          isOffline: true,
          connecting: {
            error: true,
            showTip: false,
          },
        };

      default:
        break;
    }
  }

  if (action.type === 'SETTINGS_OPEN') {
    return {
      ...state,
      verticalMenu: {
        opened: true,
        init: false,
        type: action.payload,
      },
    };
  }

  if (action.type === 'SETTINGS_CLOSE') {
    return {
      ...state,
      verticalMenu: {
        opened: false,
        init: false,
        type: state.verticalMenu.type,
      },
    };
  }

  if (action.type === 'SETTINGS-SINGLE_OPEN') {
    return {
      ...state,
      settingsSingle: {
        opened: true,
        init: false,
        type: action.payload,
      },
    };
  }

  if (action.type === 'SETTINGS-SINGLE_CLOSE') {
    return {
      ...state,
      settingsSingle: {
        opened: false,
        init: false,
        type: state.settingsSingle.type,
      },
    };
  }

  if (action.type === 'SETTINGS-SYSTEM-REQUEST_TOGGLE') {
    if (state.settingsSendRequest)
      return {
        ...state,
        settingsResendRequest: true,
      };
    else
      return {
        ...state,
        settingsSendRequest: !state.settingsSendRequest,
      };
  }

  if (action.type === 'SETTINGS-SYSTEM-RESEND-REQUEST') {
    return {
      ...state,
      settingsResendRequest: false,
    };
  }

  if (action.type === 'SETTINGS-ONLY_LOCAL') {
    setOnlyLocal(action.payload)
      .then(res => {
        setTimeout(() => {
          walletData(state.currency).then(data => {
            store.dispatch({
              type: 'LOAD_WALLETS',
              wallets: data,
              currency: state.currency - 1,
            });
          });
          transactionsData(state.currency).then(data => {
            store.dispatch({
              type: 'LOAD_TRANSACTIONS',
              transactions: data,
              currency: state.currency - 1,
            });
          });
        }, 2000);
      })
      .catch(err => {
        store.dispatch({
          type: 'SHOW_TOPHINT',
          payload: {
            text: JSON.stringify(err),
            type: 'warning',
            show: true,
          },
        });
      });
    return {
      ...state,
      onlyLocal: action.payload,
    };
  }

  if (action.type === 'CHANGE_TIP') {
    let isError = state.connecting.error;
    console.log(isError);
    if (!isError) {
      return {
        ...state,
        connecting: { showTip: true },
        tips: {
          number: action.payload.number,
          title: action.payload.title,
          text: action.payload.text,
        },
      };
    } else {
      return state;
    }
  }

  if (action.type === 'WALLET_COPY') {
    copy(action.address);
    return {
      ...state,
      topHint: {
        text: 'Copied to clipboard',
        type: 'success',
        show: true,
      },
    };
  }

  if (action.type === 'WALLET_QR') {
    getPrivateKey(action.address, action.password || '')
      .then(key => {
        key !== ''
          ? store.dispatch({ type: 'SHOW_QR_UNLOCKED', payload: key })
          : store.dispatch({
              type: 'SHOW_TOPHINT',
              payload: {
                text: 'WRONG PASSWORD',
                type: 'warning',
                show: true,
              },
            });
      })
      .catch(err => {
        store.dispatch({
          type: 'SHOW_TOPHINT',
          payload: {
            text: 'WRONG PASSWORD',
            type: 'warning',
            show: true,
          },
        });
      });
  }

  if (action.type === 'SHOW_QR') {
    location.href = '#/password-save';
    return {
      ...state,
      qrKey: {
        address: action.address,
        key: '',
        password: '',
        unlocked: false,
      },
    };
  }

  if (action.type === 'SHOW_QR_UNLOCKED') {
    location.href = '#/password-save';
    return {
      ...state,
      qrKey: {
        ...state.qrKey,
        key: action.payload,
        unlocked: true,
      },
    };
  }

  if (action.type === 'TX_STATUS_CHANGE') {
    return {
      ...state,
      txPercent: action.payload.txPercent,
      txStatus: action.payload.txStatus,
    };
  }

  if (action.type === 'TX_INVALID') {
    let message = '';
    switch (action.code) {
      case 'tx-address':
        message = 'Invalid address';
        break;
      case 'tx-password':
        message = 'Invalid password';
        break;
      case 'tx-amount':
        message = 'Invalid amount';
        break;
      case 'tx-not-enough':
        message = `Not enough ${state.currencyCode}`;
        break;
      default:
        message = 'Validation error';
        break;
    }
    return {
      ...state,
      topHint: {
        text: message,
        type: 'warning',
        show: true,
      },
    };
  }

  if (action.type === 'DATA_REFRESH') {
    console.log('data_refresh');
    walletData(state.currency).then(data => {
      let txWalletData = data.filter(x => x.address === state.txWallet)[0];
      store.dispatch({
        type: 'LOAD_WALLETS',
        wallets: data,
        txWalletData: txWalletData,
        currency: state.currency - 1,
      });
    });
    transactionsData(state.currency).then(data => {
      store.dispatch({
        type: 'LOAD_TRANSACTIONS',
        transactions: data,
      });
    });
  }

  if (action.type === 'CONNECTING_STATUS_UPDATE') {
    let connStatus = 'Connection...';
    let proxyPercent = Math.floor(
      (action.payload.proxy.status.cur * 100) /
        action.payload.proxy.status.total
    );
    let torrentPercent = Math.floor(
      (action.payload.torrent.status.cur * 100) /
        action.payload.torrent.status.total
    );
    if (proxyPercent < 100) {
      switch (action.payload.proxy.stage) {
        case 1:
          connStatus = 'DNS resolve';
          break;
        case 2:
          connStatus = `Measure proxy latency ... ${proxyPercent}%`;
          break;
        case 3:
          connStatus = 'Check MH services availability';
          break;
        default:
          break;
      }
    } else {
      switch (action.payload.torrent.stage) {
        case 2:
          connStatus = `Measure torrent latency ... ${torrentPercent}%`;
          break;
        case 3:
          connStatus = 'Check MH services availability';
          break;
        default:
          break;
      }
    }

    return {
      ...state,
      connectingStatus: connStatus,
    };
  }

  if (action.type === 'QR_OPEN') {
    (window.androidJsBridge && window.androidJsBridge.startQRImport()) ||
      (window.iosJsBridge && window.iosJsBridge.call('startQRImport'));
  }

  if (action.type === 'QR_OPEN_NATIVE') {
    return {
      ...state,
      createWallet: {
        ...state.createWallet,
        qrOpened: true,
        key: action.payload.key,
        address: action.payload.address,
      },
    };
  }

  if (action.type === 'IMPORT_WALLET') {
    let address = action.payload.address;
    let pkey = action.payload.pkey;
    let name = action.payload.name;
    let password = action.payload.password;
    importWallet(address, pkey, name, password, state.currency, 'TMH')
      .then(res => {
        store.dispatch({
          type: 'POPUP_SHOW',
          payload: 'create-wallet',
        });
        walletData(state.currency).then(data => {
          store.dispatch({
            type: 'LOAD_WALLETS',
            wallets: data,
            currency: state.currency - 1,
          });
        });
        setTimeout(() => {
          walletData(state.currency).then(data => {
            store.dispatch({
              type: 'LOAD_WALLETS',
              wallets: data,
              currency: state.currency - 1,
            });
          });
        }, 2000);
      })
      .catch(err => {
        store.dispatch({
          type: 'SHOW_TOPHINT',
          payload: {
            text: 'Import error',
            type: 'warning',
            show: true,
          },
        });
      });
    return {
      ...state,
      createWallet: {
        key: '',
        address: '',
        qrOpened: false,
      },
    };
  }

  if (action.type === 'POPUP_SHOW') {
    return {
      ...state,
      popups: {
        ...state.topHint,
        activePopup: action.payload,
      },
    };
  }

  return state;
}

const store = createStore(
  states,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

currenciesData().then(data => {
  store.dispatch({
    type: 'LOAD_CURRENCIES',
    currencies: data,
  });
});

window.dispatch = store.dispatch;
window.onDataRefreshed = () => {
  store.dispatch({ type: 'DATA_REFRESH' });
};

const LoginPageMod = props => {
  return <LoginPage submit={authFunc} />;
};

const onPasswordDontMatch = () => {
  store.dispatch({
    type: 'SHOW_TOPHINT',
    payload: {
      text: "Passwords don't match!",
      type: 'warning',
      show: true,
    },
  });
};

const onInvalidEmail = () => {
  store.dispatch({
    type: 'SHOW_TOPHINT',
    payload: {
      text: 'Incorrect email',
      type: 'warning',
      show: true,
    },
  });
};

const onWrongPassword = () => {
  store.dispatch({
    type: 'SHOW_TOPHINT',
    payload: {
      text: 'Password is too short',
      type: 'warning',
      show: true,
    },
  });
};

const SignUpPageMod = props => {
  return (
    <SignUpPage
      submit={signUpFunc}
      onPasswordDontMatch={onPasswordDontMatch}
      onInvalidEmail={onInvalidEmail}
      onWrongPassword={onWrongPassword}
    />
  );
};

const showIcloud = () => {
  if (window.iosJsBridge) {
    store.dispatch({
      type: 'POPUP_SHOW',
      payload: 'icloud',
    });
  }
};

window.onBackPressed = () => {
  window.history.back();
};

const Manager = props => {
  return (
    <div>
      <TopHint />
      <HomeMenu />
      <PopupWallet />
      <PopupCreateWallet />
      <PopupIcloud />
      <SettingsSingle />
      <VerticalMenu />
      <PopupCreateWalletSwipe />
      <Switch>
        <ScrollToTop>
          <Route exact path="/" component={ConnectingPage} />{' '}
          <Route path="/login" component={LoginPageMod} />{' '}
          <Route path="/signup" component={SignUpPageMod} />{' '}
          <Route path="/connecting" component={ConnectingPage} />{' '}
          <Route path="/passcode-setup" component={PasscodeSetup} />{' '}
          <Route path="/passcode-enter" component={PasscodeEnter} />{' '}
          <Route path="/terms" component={TermsPage} />{' '}
          <Route path="/home-wallets" component={HomeWallets} />{' '}
          <Route path="/create-wallet" component={CreateWallet} />{' '}
          <Route path="/create-transfer" component={CreateTransfer} />{' '}
          <Route path="/wallets" component={Wallets} />{' '}
          <Route path="/password-save" component={PasswordSave} />
          <Route path="/transfer-progress" component={TransferProgress} />
        </ScrollToTop>
      </Switch>{' '}
    </div>
  );
};
export default Manager;

ReactDOM.render(
  <Provider store={store}>
    <HashRouter>
      <Manager />
    </HashRouter>
  </Provider>,
  document.getElementById('app')
);

registerServiceWorker();
