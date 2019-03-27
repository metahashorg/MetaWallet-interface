import React from 'react';
import { connect } from 'react-redux';
import { QRCode } from 'react-qr-svg';
import LoginInput from '../../components/LoginInput/LoginInput.jsx';
import './PasswordSave.css';

const PasswordSave = props => {
  const unlockQR = e => {
    let password = e.target.elements['wallet_password'].value;
    let address = e.target.elements['wallet_address'].value;
    props.unlockQR(address, password);
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
        <div className="top-menu__title">save password QR</div>
      </section>

      {props.store.qrKey.unlocked && (
        <section className="save-password-qr">
          <div className="save-password-qr__card">
            <div className="save-password-qr__img">
              <QRCode
                bgColor="#FFFFFF"
                fgColor="#00294f"
                level="Q"
                style={{ width: 190 }}
                value={props.store.qrKey.key}
              />
            </div>

            <div className="save-password-qr__title">
              Use this QR code to scan, when you need to restore your wallet or
              open it in another application.
            </div>
            <div className="save-password-qr__buttons">
              <div className="button">
                <div className="icon icon_print" />
                <span>Print code</span>
              </div>
              <div className="button">
                <div className="icon icon_save" />
                <span>save file</span>
              </div>
            </div>
          </div>
        </section>
      )}
      {!props.store.qrKey.unlocked && (
        <section className="save-password-qr">
          <form onSubmit={unlockQR}>
            <div className="save-password-qr__card">
              <input
                type="hidden"
                name="wallet_address"
                value={props.store.qrKey.address}
              />
              <LoginInput type="password" name="wallet_password" />

              <div className="save-password-qr__title">
                Enter wallet password to get QR
              </div>
              <div className="save-password-qr__buttons">
                <button className="login-form__submit" type="submit">
                  <span>get qr</span>
                </button>
              </div>
            </div>
          </form>
        </section>
      )}
    </div>
  );
};

export default connect(
  state => ({
    store: state,
  }),
  dispatch => ({
    unlockQR: (address, password) => {
      dispatch({ type: 'WALLET_QR', address: address, password: password });
    },
  })
)(PasswordSave);
