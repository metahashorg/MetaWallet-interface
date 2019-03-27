import React from 'react';
import cn from 'classnames';
import { connect } from 'react-redux';
import './PopupIcloud.css';

const PopupIcloud = props => {
  const closePopup = () => {
    props.onClosePopupIcloud();
  };

  return (
    <div
      className={cn(
        'popup popup_icloud',
        props.store.popups.activePopup === 'icloud' ? 'opened' : ''
      )}
      onClick={() => closePopup()}>
      <div className="popup__bg" />
      <div className="popup__content">
        <div className="popup__card">
          <div className="popup__icon" />
          <div className="popup__title">iCloud synchronization</div>
          <div className="popup__text">
            Wallets private keys will be stored in iCloud by default. You can
            change this in settings later.
          </div>
          <div className="popup__warning">
            <div className="icon" />
            <div className="title">WARNING!</div>
            <div className="text">
              Storing passwords and private keys is your responsibility. They
              can not be restored. <b>If lost, they are gone.</b>
            </div>
          </div>
          <div className="popup__btn">
            <div className="btn" onClick={() => closePopup()}>
              <span>ok, got it</span>
            </div>
          </div>
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
    onClosePopupIcloud: () => {
      dispatch({ type: 'POPUP_HIDE' });
    },
  })
)(PopupIcloud);
