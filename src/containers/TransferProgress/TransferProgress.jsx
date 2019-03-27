import React from 'react';
import { connect } from 'react-redux';
import './TransferProgress.css';

const TransferProgress = props => {
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
        <div className="top-menu__title">Back</div>
      </section>

      <section className="transfer-progress">
        <div className="transfer-progress__card">
          <div className="transfer-progress__title">
            Transaction in progress
          </div>
          <div className="transfer-progress__status">
            Status: <span>{props.store.txStatus}</span>
          </div>
          <div className="transfer-progress__progressbar">
            <div
              className="bar"
              style={{ width: `calc(${props.store.txPercent}% - 6px)` }}
            />
          </div>
          <div className="transfer-progress__percent">
            {props.store.txPercent}%
          </div>
          <div className="transfer-progress__tip">
            You can wait for completion or start new transaction.
          </div>
          <div className="transfer-progress__button">
            <a href="#/create-transfer">new transfer</a>
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
  dispatch => ({})
)(TransferProgress);
