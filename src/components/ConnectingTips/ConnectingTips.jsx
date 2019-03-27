import React from 'react';
import { connect } from 'react-redux';
import './ConnectingTips.css';

const ConnectingTips = props => {
  return (
    <div>
      <div className="connecting-tip">
        <div className="connecting-tip__header">
          TIP {props.store.tips.number}:
        </div>
        <div className="connecting-tip__theme">{props.store.tips.title}</div>
        <div className="connecting-tip__text">{props.store.tips.text}</div>
      </div>
    </div>
  );
};

export default connect(state => ({
  store: state,
}))(ConnectingTips);
