import React from 'react';
import { connect } from 'react-redux';
import cn from 'classnames';
import './Wallets.css';
import Wallet from '../../components/Wallet/Wallet.jsx';
import Transaction from '../../components/Transaction';
import CurrencyHeader from '../../components/CurrencyHeader';

const Wallets = props => {
  const showMenu = () => {
    props.onShowMenu();
  };

  const changeTabsToWallets = () => {
    props.onChangeTabs('wallets');
  };
  const changeTabsToTransactions = () => {
    props.onChangeTabs('transactions');
  };

  const onWalletClick = address => {
    props.onWalletClick(address);
  };

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
          onClick={e => {
            window.history.back();
          }}
        />

        <div className="top-menu__title">{props.store.currencyName}</div>
        <div className="top-menu__menu-btn" onClick={showMenu} />
      </section>

      <section className="wallet-home">
        <CurrencyHeader {...props.store.currencyInfo} />
        <div className="content">
          <div
            className={cn(
              'wallet-home__tabs tabs',
              'tabs_' + props.store.wallets.activeTab
            )}>
            <div className="tabs__controls">
              <div
                className="tabs__control tabs__control_wallets"
                onClick={changeTabsToWallets}>
                <span>Wallets</span>
              </div>
              <div
                className="tabs__control tabs__control_transactions"
                onClick={changeTabsToTransactions}>
                <span>Last Transactions</span>
              </div>
            </div>

            <div className="tabs__panel tabs__panel_wallets">
              {props.store.walletsData.map(x => {
                return (
                  <Wallet
                    {...x}
                    key={x.address}
                    onClick={e => {
                      onWalletClick(x.address);
                    }}
                    onCopy={e => {
                      props.onCopy(x.address);
                    }}
                    onQR={e => {
                      props.onQR(x.address);
                    }}
                    showNoQr={e => {
                      props.showNoQr();
                    }}
                  />
                );
              })}
              <a href="#/create-wallet">
                <div className="wallet wallet_create">
                  <div className="wallet__description">
                    <div className="wallet__img">
                      <img src="./img/wallet/new.svg" alt="" />
                    </div>
                    <div className="wallet__text">
                      <div className="wallet__name">create wallet</div>
                      <div className="wallet__sub">or import from QR code</div>
                    </div>
                  </div>
                </div>
              </a>
            </div>

            <div className="tabs__panel tabs__panel_transactions">
              {Object.keys(props.store.transactionsData)
                .sort((a, b) => {
                  return a > b ? -1 : 1;
                })
                .map(x => {
                  return (
                    <div key={x}>
                      <div className="transaction transaction_date">
                        <span>{x}</span>
                      </div>
                      {props.store.transactionsData[x].map(y => {
                        return <Transaction {...y} key={y.id} />;
                      })}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default connect(
  state => ({
    store: state,
  }),
  dispatch => ({
    onShowMenu: () => {
      dispatch({ type: 'MENU_OPEN' });
    },
    onChangeTabs: val => {
      dispatch({ type: 'WALLETS_CHANGE-TAB', payload: val });
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
        dispatch({
          type: 'SHOW_TOPHINT',
          payload: {
            text: 'No private key found',
            type: 'warning',
            show: false,
          },
        });
      }, 2000);
    },
  })
)(Wallets);
