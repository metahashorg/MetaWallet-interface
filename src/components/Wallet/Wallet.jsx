import React from 'react';
import './Wallet.css';
import shorten from '../../model/shorten';

const Wallet = props => {
  let startX = 0,
    cssStartX = 0,
    delta = 0,
    cssDelta = 0,
    container,
    parent;

  const handleTouchMove = e => {
    delta = startX - e.targetTouches[0].clientX;
    cssDelta = cssStartX - delta;
    if (cssDelta > 160) {
      cssDelta = 160;
    } else if (cssDelta < 0) {
      cssDelta = 0;
    }
    container.style.transform = 'translate(' + cssDelta + 'px, 0)';
  };
  const handleTouchStart = e => {
    delta = 0;
    startX = e.targetTouches[0].clientX;
    parent = e.target.closest('.wallet');
    container = parent.querySelector('.wallet__container');
    let arr = window
      .getComputedStyle(container, null)
      .getPropertyValue('transform')
      .split(',');
    cssStartX = arr[4];
  };
  const handleTouchEnd = e => {
    console.log(delta);
    startX = 0;
    container.style.transform = '';
    if (delta > 30) {
      parent.classList.remove('show-options');
    } else if (delta < -30) {
      parent.classList.add('show-options');
    }
  };

  let onClick = e => {
    if (props.hasPrivateKey) {
      props.onClick();
    } else {
      e.preventDefault();
    }
  };
  return (
    <div
      className={
        props.hasPrivateKey
          ? 'wallet wallet_mhc'
          : 'wallet wallet_mhc wallet_disabled'
      }>
      <div
        className="wallet__copy-address"
        onClick={e => {
          props.onCopy(props.address);
        }}>
        <div className="info">
          <div className="info__img" />
          <div className="info__text">Copy Address</div>
        </div>
      </div>
      <div
        className="wallet__show-code"
        onClick={e => {
          if (props.hasPrivateKey) {
            props.onQR(props.address);
          } else {
            props.showNoQr();
          }
        }}>
        <div className="info">
          <div className="info__img" />
          <div className="info__text">
            Show <br />
            QR code
          </div>
        </div>
      </div>
      <div className="wallet__container" onClick={onClick}>
        <div className="wallet__icon" />
        <div
          className="wallet__activator"
          onTouchMove={handleTouchMove}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        />
        <div className="wallet__description">
          <div className="wallet__img">
            <img src={'https://icons.metahash.io/' + props.address} alt="" />
          </div>
          <div className="wallet__text">
            <div className="wallet__name">{props.name}</div>
            <div className="wallet__num">{shorten(props.address)}</div>
          </div>
        </div>
        <div className="asset">
          <span className="asset__int">{props.balanceFloor}.</span>
          <span className="asset__div">{props.balanceResidue}</span>{' '}
          <span className="asset__cur">{props.currencyCode}</span>
          <span className="asset__val">{props.usdBalance} USD</span>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
