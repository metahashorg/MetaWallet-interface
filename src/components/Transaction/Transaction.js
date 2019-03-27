import React from 'react';
import shorten from '../../model/shorten';

const Transaction = props => {
  props.positiveClass = props.amount > 0 ? 'positive' : '';
  return (
    <div className={`transaction ${props.positiveClass}`}>
      <div className="transaction__time">
        <span>{props.time}</span>
        <span>{props.timeMod}</span>
      </div>
      <div className="transaction__text">
        <div className="transaction__info">
          {shorten(props.to)}
          <span className="transaction__direction" />
          {shorten(props.from)}
        </div>
        <div className="transaction__value">
          {props.amount} {props.currency}
        </div>
      </div>
    </div>
  );
};

export default Transaction;
