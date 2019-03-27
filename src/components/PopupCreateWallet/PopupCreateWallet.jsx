import React from 'react';
import cn from 'classnames';
import { connect } from 'react-redux';
import './PopupCreateWallet.css';

const PopupCreateWallet = props => {
  const closePopup = () => {
    props.onClosePopupWallet();
  };

  return (
    <div
      className={cn(
        'popup popup_create-wallet',
        props.store.popups.activePopup === 'create-wallet' ? 'opened' : ''
      )}>
      <div className="popup__bg" />
      <div className="popup__content">
        <div className="popup__image" />

        <div className="popup__title">
          <span>Remember to keep the password yourself!</span>
        </div>

        <div className="popup__text">
          <p>
            Wallet data and QR code are stored in a separate folder that is used
            to import or restore wallets.
          </p>
          <p>We never save your password anywhere.</p>
        </div>

        <div
          className="popup__button"
          onClick={() => {
            closePopup();
            window.history.back();
          }}>
          <span>back</span>
        </div>

        <div className="popup__checkbox">
          <input type="checkbox" id="notify" />
          <label htmlFor="notify">Don’t show this notification again</label>
        </div>
      </div>
    </div>
  );
};

export default connect(
  state => ({
    store: state,
  }),
  dispatch => ({
    onClosePopupWallet: () => {
      dispatch({ type: 'POPUP_HIDE' });
    },
  })
)(PopupCreateWallet);
