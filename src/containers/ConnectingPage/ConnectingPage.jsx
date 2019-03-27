import React from 'react';
import { connect } from 'react-redux';
import cn from 'classnames';
import './ConnectingPage.css';

import ConnectingStatus from './../../components/ConnectingStatus/ConnectingStatus.jsx';
import ConnectingTips from './../../components/ConnectingTips/ConnectingTips.jsx';

const ConnectingPage = props => {
  return (
    <div
      className={cn(
        'bg',
        props.store.isOffline ? 'offline-mode' : 'online-mode'
      )}>
      <div className="bg__img" />

      <section className="loading-page">
        <div className="loading-page__logo" />
        <div className="loading-page__title">
          <img
            className="loading-page__logo"
            src="./img/metawallet-logo.svg"
            alt="logo"
          />
          <span>#Meta</span>
          Wallet
        </div>
        <div className="loading-page__version">{window.MH_APP_VERSION} </div>
        <div className="loading-page__status">
          <ConnectingStatus
            statusText={props.store.connectingStatus}
            statusHint={
              props.store.connecting.error
                ? 'Try again later or enter the offline version'
                : ''
            }
            disconnected={props.store.connecting.error}
          />
        </div>

        {props.store.connecting.showTip && !props.store.connecting.error ? (
          <div className="loading-page__tips">
            <ConnectingTips />
          </div>
        ) : (
          ''
        )}

        <div className="loading-page__spacer" />

        <a href="" className="loading-page__metahash">
          <img src="./img/metahash-big.svg" alt="#metahash" />
        </a>

        <div className="passcode__copyright">
          Copyright © 2017-2018 #MetaHash. All Rights Reserved
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
    onShowTopHint: topHintSettings => {
      dispatch({ type: 'SHOW_TOPHINT', payload: topHintSettings });
    },
    onConnectingTipShow: () => {
      dispatch({ type: 'CONNECTING-TIP_SHOW' });
    },
  })
)(ConnectingPage);
