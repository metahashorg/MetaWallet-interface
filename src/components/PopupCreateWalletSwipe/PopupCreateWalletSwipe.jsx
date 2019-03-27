import React from 'react';
import cn from 'classnames';
import { connect } from 'react-redux';
import './PopupCreateWalletSwipe.css';

const PopupCreateWalletSwipe = props => {
  const closePopup = () => {
    props.onClosePopupWallet();
  };

  return (
    <div
      className={cn(
        'popup popup_create-wallet-swipe',
        props.store.popups.activePopup === 'create-wallet-swipe' ? 'opened' : ''
      )}>
      <div className="popup__bg" />
      <div className="popup__content">
        <div className="popup__title">
          <span>Swipe сards to change options</span>
        </div>

        <div className="popup__img">
          <div />
          <div />
          <div />
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
)(PopupCreateWalletSwipe);
