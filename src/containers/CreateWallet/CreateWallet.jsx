import React from 'react';
import cn from 'classnames';
import { connect } from 'react-redux';
import './CreateWallet.css';

const CreateWallet = props => {
  let startX = 0,
    delta = 0,
    toLeft = false;

  const handleTouchMove = e => {
    delta = startX - e.targetTouches[0].clientX;
  };
  const handleTouchStart = e => {
    delta = 0;
    startX = e.targetTouches[0].clientX;
  };

  if (!window.popupCreateWallet) {
    window.popupCreateWallet = true;
    props.showPopup();
  }

  const createWallet = e => {
    let name = e.target.elements['wallet_name'].value;
    let password = e.target.elements['wallet_password'].value;
    if (name === '') {
      props.onNameEmpty();
    } else if (password === '') {
      props.onPasswordEmpty();
    } else {
      props.createWallet(name, password);
    }
    e.preventDefault();
  };

  const onImportedSubmit = e => {
    let pkey = e.target.elements['wallet_pkey'].value;
    let name = e.target.elements['wallet_name'].value;
    let password = e.target.elements['wallet_password'].value;
    let address = e.target.elements['wallet_address'].value;
    if (pkey === '') {
      props.onPKeyEmpty();
    } else if (name === '') {
      props.onNameEmpty();
    } else if (password === '') {
      props.onPasswordEmpty();
    } else {
      props.importWallet(address, pkey, name, password);
    }
    e.preventDefault();
  };

  const handleTouchEnd = e => {
    console.log(delta);
    startX = 0;
    if (delta > 70) {
      toLeft = true;
      props.onChangeCard(toLeft);
    }
    if (delta < -70) {
      toLeft = false;
      props.onChangeCard(toLeft);
    }
  };

  const showCopyHint = () => {
    props.onShowTopHint({
      text: 'Password successfully copied to clipboard',
      type: 'success',
      show: true,
    });
  };

  const qrOpen = () => {
    props.onQROpened();
  };

  return (
    <div className="bg bg_star">
      <div className="bg__img" />

      <section className="top-menu">
        <div
          className="top-menu__back"
          onClick={e => {
            window.history.back();
          }}
        />
        <div className="top-menu__title">
          {props.store.createWallet.cardNum === 0
            ? 'Create wallet'
            : 'Import from QR code'}{' '}
        </div>
      </section>

      <section
        className={cn(
          'create-wallet',
          props.store.createWallet.qrOpened ? 'qrOpened' : ''
        )}
        onTouchMove={handleTouchMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}>
        <div
          className={cn(
            'create-wallet__card',
            props.store.createWallet.cardNum === 0
              ? 'create-wallet__card_front'
              : 'create-wallet__card_back',
            props.store.createWallet.toLeft ? 'left' : 'right'
          )}>
          <div className="create-wallet__card-img" />
          <form className="create-wallet__form" onSubmit={createWallet}>
            <div className="input">
              <label>Wallet name</label>
              <input type="text" name="wallet_name" />
            </div>
            <div className="input">
              <label>wallet password</label>
              <input
                type="password"
                placeholder="Enter password or click “Generate” button"
                name="wallet_password"
              />
            </div>
            <div className="actions" style={{ display: 'none' }}>
              <div className="action-btn">
                <span className="icon icon_stick" />
                <span>Generate</span>
              </div>
              <div className="action-btn">
                <span className="icon icon_copy" />
                <span onClick={showCopyHint}>Copy</span>
              </div>
            </div>
            <button type="submit" className="submit">
              <span>Generate wallet</span>
            </button>
          </form>
        </div>

        <div
          className={cn(
            'create-wallet__card',
            props.store.createWallet.cardNum === 1
              ? 'create-wallet__card_front'
              : 'create-wallet__card_back',
            props.store.createWallet.toLeft ? 'left' : 'right'
          )}>
          <div className="create-wallet__card-img" />
          <div className="create-wallet__qr-code qr-code">
            {!props.store.createWallet.qrOpened && (
              <div className="qr-code__container qr-code__container_step1">
                <div
                  className="qr-code__btn"
                  onClick={() => {
                    qrOpen();
                  }}>
                  <span>Scan qr code</span>
                </div>
                <div className="qr-code__btn">
                  <span>open QR image file</span>
                </div>
              </div>
            )}
            {props.store.createWallet.qrOpened && (
              <div className="qr-code__container qr-code__container_step2">
                <form
                  className="create-wallet__form"
                  onSubmit={onImportedSubmit}>
                  <div className="input">
                    <label>private key</label>
                    <textarea
                      defaultValue={props.store.createWallet.key}
                      name="wallet_pkey"
                    />
                    <input
                      type="hidden"
                      name="wallet_address"
                      defaultValue={props.store.createWallet.address}
                    />
                  </div>
                  <div className="input">
                    <label>Wallet name</label>
                    <input
                      type="text"
                      name="wallet_name"
                      placeholder="create a name for a wallet, e.g. Main wallet"
                    />
                  </div>
                  <div className="input">
                    <label>wallet password</label>
                    <input
                      type="password"
                      name="wallet_password"
                      placeholder="Enter the wallet’s password"
                    />
                  </div>
                  <button type="submit" className="submit">
                    <span>add wallet</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        <div
          className={cn(
            'pagination',
            props.store.createWallet.cardNum === 1 &&
              props.store.createWallet.qrOpened
              ? 'pagination_alt'
              : ''
          )}>
          <div
            className={cn(
              'pagination__item',
              props.store.createWallet.cardNum === 0 ? 'active' : ''
            )}
          />
          <div
            className={cn(
              'pagination__item',
              props.store.createWallet.cardNum === 1 ? 'active' : ''
            )}
          />
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
    onChangeCard: toLeft => {
      dispatch({ type: 'CREATEWALLET-CHANGECARD', payload: toLeft });
    },
    onShowMenu: () => {
      dispatch({ type: 'MENU_OPEN' });
    },
    onShowTopHint: topHintSettings => {
      dispatch({ type: 'SHOW_TOPHINT', payload: topHintSettings });
    },
    createWallet: (name, password) => {
      dispatch({
        type: 'CREATE_WALLET',
        payload: { name: name, password: password },
      });
    },
    importWallet: (address, pkey, name, password) => {
      dispatch({
        type: 'IMPORT_WALLET',
        payload: {
          address: address,
          pkey: pkey,
          name: name,
          password: password,
        },
      });
    },

    onQROpened: () => {
      dispatch({ type: 'QR_OPEN' });
    },
    showPopup: () => {
      dispatch({ type: 'POPUP_SHOW', payload: 'create-wallet-swipe' });
    },
    onPasswordEmpty: () => {
      dispatch({
        type: 'SHOW_TOPHINT',
        payload: {
          text: 'Empty password',
          type: 'warning',
          show: true,
        },
      });
    },
    onNameEmpty: () => {
      dispatch({
        type: 'SHOW_TOPHINT',
        payload: {
          text: 'Empty name',
          type: 'warning',
          show: true,
        },
      });
    },
    onPKeyEmpty: () => {
      dispatch({
        type: 'SHOW_TOPHINT',
        payload: {
          text: 'Empty private key',
          type: 'warning',
          show: true,
        },
      });
    },
  })
)(CreateWallet);
