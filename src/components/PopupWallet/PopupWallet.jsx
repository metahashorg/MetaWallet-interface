import React from 'react';
import cn from 'classnames';
import { connect } from 'react-redux';
import './PopupWallet.css';

const PopupWallet = props => {
  const closePopup = () => {
    props.onClosePopupWallet();
  };

  return (
    <div
      className={cn(
        'popup popup_wallet',
        props.store.popups.activePopup === 'wallet' ? 'opened' : ''
      )}>
      <div className="popup__bg" />
      <div className="popup__content">
        <div className="popup__title">
          <span>
            Swipe currency, wallet
            <br />
            or transaction card
            <br />
            to open features
          </span>
        </div>

        <div className="animation">
          <div className="animation__card1" />
          <div className="animation__card2" />
          <div className="animation__card3" />
        </div>

        <div className="popup__button" onClick={() => closePopup()}>
          <span>Got it!</span>
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
)(PopupWallet);
