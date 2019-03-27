import React from 'react';
import { connect } from 'react-redux';
import './CreateTransfer.css';
import shorten from '../../model/shorten';
import queryString from 'query-string';

const isAddressValid = address => {
  return address.match(/0x[0-9a-fA-F]+$/);
};

const CreateTransfer = props => {
  const values = queryString.parse(props.location.search);
  let to = props.to || values.to || '';
  let amount = props.amount || values.value || 0;
  let txSubmit = e => {
    let from = props.store.txWalletData.address;
    let password = e.target.elements['wallet_password'].value;
    let amount = e.target.elements['wallet_amount'].value * 1e6;
    let to = e.target.elements['wallet_to'].value;
    let fee = '';
    let data = '';
    if (!isAddressValid(to)) {
      props.onInvalid('tx-address');
    } else if (password.length === 0) {
      props.onInvalid('tx-password');
    } else if (!Number.isFinite(amount) || amount <= 0) {
      props.onInvalid('tx-amount');
    } else if (amount > props.store.txWalletData.balance * 1e6) {
      props.onInvalid('tx-not-enough');
    } else {
      props.txSubmit(from, password, to, amount, fee, data);
    }
    e.preventDefault();
  };

  return (
    <div className="bg bg_home">
      <div className="bg__img" />

      <section className="top-menu">
        <div
          className="top-menu__back"
          onClick={e => {
            window.history.back();
          }}
        />
        <div className="top-menu__title">Transfer</div>
      </section>

      <section className="create-transfer">
        <div className="content">
          <div className="wallet wallet_transfer">
            <div className="wallet__container">
              <div className="wallet__description">
                <div className="wallet__img">
                  <img
                    src={
                      'https://icons.metahash.io/' +
                      props.store.txWalletData.address
                    }
                    alt=""
                  />
                </div>
                <div className="wallet__text">
                  <div className="wallet__name">
                    {props.store.txWalletData.name}
                  </div>
                  <div className="wallet__num">
                    {shorten(props.store.txWalletData.address)}
                  </div>
                </div>
              </div>
              <div className="asset">
                <span className="asset__int">
                  {props.store.txWalletData.balanceFloor}.
                </span>
                <span className="asset__div">
                  {props.store.txWalletData.balanceResidue}
                </span>{' '}
                <span className="asset__cur">
                  #<span />
                  {props.store.currencyCode}
                </span>
                <span className="asset__val">0 USD</span>
              </div>
              <div className="mod">
                <span className="month">{props.store.txWalletData.month}</span>:
                <span className="plus">
                  +{props.store.txWalletData.plus} {props.store.currencyCode}
                </span>
                <span className="minus">
                  -{props.store.txWalletData.minus} {props.store.currencyCode}
                </span>
              </div>
            </div>

            <form className="create-transfer__form" onSubmit={txSubmit}>
              <div className="input">
                <label>Amount</label>
                <input
                  type="number"
                  name="wallet_amount"
                  step="any"
                  autoComplete="off"
                  defaultValue={amount}
                  onInvalid={e => {
                    e.preventDefault();
                  }}
                />
              </div>
              <div className="input input_address">
                <label>To address</label>
                <input
                  type="text"
                  name="wallet_to"
                  autoComplete="off"
                  defaultValue={to}
                />
                <div className="input__icon" />
              </div>
              <div className="input">
                <label>Wallet password</label>
                <input
                  type="password"
                  name="wallet_password"
                  autoComplete="off"
                />
              </div>
              <div className="input input_fee" style={{ display: 'none' }}>
                <label>Max fee</label>
                <span className="input__hint">
                  <span className="input__timer" />
                  <span className="input__time">3 sec</span>
                </span>
                <input type="text" autoComplete="off" />
                <div className="input__icon" />
              </div>
              <button className="submit">
                <span>sign & send</span>
              </button>
            </form>
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
    txSubmit: (from, password, to, amount, fee, data) => {
      dispatch({
        type: 'SEND_TX',
        payload: {
          from: from,
          password: password,
          to: to,
          amount: amount,
          fee: fee,
          data: data,
        },
      });
    },
    onInvalid: code => {
      dispatch({ type: 'TX_INVALID', code: code });
    },
  })
)(CreateTransfer);
