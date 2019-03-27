import React from 'react';
import { connect } from 'react-redux';
import cn from 'classnames';
import Currency from '../../components/Currency/Currency.jsx';
import Wallet from '../../components/Wallet/Wallet.jsx';
import CurrencyHeader from '../../components/CurrencyHeader';
import './HomeWallets.css';
import walletData from '../../model/walletData';

class HomeWallets extends React.PureComponent {
  constructor(props) {
    super(props);
    this.showMenu = () => {
      props.onShowMenu();
    };

    let currs = [...props.currencies];
    currs = currs.sort((a, b) => {
      return a.idx - b.idx;
    });
    this.changeTabsToWallets = () => {
      props.onChangeTabs('wallets');
    };
    this.changeTabsToCurrency = () => {
      props.onChangeTabs('currency');
    };

    this.onWalletClick = address => {
      props.onWalletClick(address);
    };

    this.onCopy = props.onCopy.bind(this);
    this.onCurrencyClick = props.onCurrencyClick.bind(this);
    this.onQR = props.onQR.bind(this);
    this.state = {
      currencies: currs,
      store: props,
    };
    this.showNoQr = props.showNoQr;

    this.onInit = props.init.bind(this);
  }

  componentDidMount() {
    this.onInit();
  }

  componentWillReceiveProps(nextProps) {
    let currs = [...nextProps.currencies];
    currs = currs.sort((a, b) => {
      return a.idx - b.idx;
    });
    this.setState({
      currencies: currs,
      store: nextProps,
    });
  }

  render() {
    let props = this.state;
    let mhcData = [];

    return (
      <div
        className={cn(
          'bg bg_home',
          props.store.isOffline ? 'offline-mode' : 'online-mode'
        )}>
        <div className="bg__img" />

        <section className="top-menu">
          <div
            className="top-menu__back"
            style={{ display: 'none' }}
            onClick={e => {
              window.history.back();
            }}
          />
          <div className="top-menu__title">Total assets value</div>
          <div className="top-menu__menu-btn" onClick={this.showMenu} />
        </section>

        <section className="wallet-home">
          <CurrencyHeader {...props.store.currencyInfo} data={mhcData} />
          <div className="content">
            <div
              className={cn(
                'wallet-home__tabs tabs',
                'tabs_' + props.store.totalAssets.activeTab
              )}>
              <div className="tabs__controls">
                <div
                  className="tabs__control tabs__control_currency"
                  onClick={this.changeTabsToCurrency}>
                  <span>Currency</span>
                </div>
                <div
                  className="tabs__control tabs__control_wallets"
                  onClick={this.changeTabsToWallets}>
                  <span>Recent Wallets</span>
                </div>
              </div>
              <div className="tabs__panel tabs__panel_wallets">
                {props.store.walletsData.map((x, i) => {
                  return (
                    <Wallet
                      {...x}
                      key={i}
                      onClick={e => {
                        this.onWalletClick(x.address);
                      }}
                      onCopy={e => {
                        this.onCopy(x.address);
                      }}
                      onQR={e => {
                        this.onQR(x.address);
                      }}
                      showNoQr={e => {
                        this.showNoQr();
                      }}
                    />
                  );
                })}
              </div>
              <div className="tabs__panel tabs__panel_currency">
                {this.state.currencies.map(x => {
                  return (
                    <Currency
                      {...x}
                      key={x.currencyCode}
                      onCurrencyClick={this.onCurrencyClick}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}

export default connect(
  state => state,
  dispatch => ({
    onShowMenu: () => {
      dispatch({ type: 'MENU_OPEN' });
    },
    onChangeTabs: val => {
      dispatch({ type: 'TOTAL-ASSETS_CHANGE-TAB', payload: val });
    },
    loadCurrencies: currencies => {
      dispatch({ type: 'LOAD_CURRENCIES', currencies: currencies });
    },
    onCurrencyClick: (id, code) => {
      if (id === 1 || id === 4) {
        dispatch({ type: 'CURRENCY_CLICK', id: id, code: code });
      } else {
        dispatch({
          type: 'SHOW_TOPHINT',
          payload: {
            text: 'Coming soon',
            type: 'warning',
            show: true,
          },
        });
      }
    },
    onWalletClick: address => {
      dispatch({ type: 'WALLETS_CLICK', address: address });
    },
    onCopy: address => {
      dispatch({ type: 'WALLET_COPY', address: address });
    },
    onQR: address => {
      dispatch({ type: 'SHOW_QR', address: address });
    },
    init: () => {
      console.log('init');
      walletData('1').then(data => {
        dispatch({
          type: 'LOAD_WALLETS',
          wallets: data,
          currency: 0,
        });
        console.log('wld1');
        walletData('4').then(data => {
          console.log('wld2');
          dispatch({
            type: 'LOAD_WALLETS',
            wallets: data,
            currency: 3,
          });
        });
      });
    },
    showNoQr: () => {
      dispatch({
        type: 'SHOW_TOPHINT',
        payload: {
          text: 'No private key found',
          type: 'warning',
          show: true,
        },
      });

      setTimeout(() => {
        dispatch(
          {
            type: 'SHOW_TOPHINT',
            payload: {
              text: 'No private key found',
              type: 'warning',
              show: false,
            },
          },
          2000
        );
      });
    },
  })
)(HomeWallets);
