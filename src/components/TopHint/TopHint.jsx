import React from 'react';
import { connect } from 'react-redux';
import cn from 'classnames';

import './TopHint.css';

const TopHint = props => {
  if (props.settingsStore.topHint.show) {
    setTimeout(props.onHideTopHint, 5000);
  }

  return (
    <section
      className={cn(
        'hint',
        'hint_' + props.settingsStore.topHint.type,
        props.settingsStore.topHint.show ? 'hint_show' : ''
      )}>
      <div className="hint__text">
        {props.settingsStore.topHint.show && (
          <React.Fragment>
            {props.settingsStore.topHint.type === 'tip' ? (
              <span className="hint__icon hint__icon_tip">
                <img src="./img/hint-tip.svg" alt="" />
              </span>
            ) : (
              ''
            )}

            {props.settingsStore.topHint.type === 'warning' ? (
              <span className="hint__icon hint__icon_warning">
                <img src="./img/hint-warning.svg" alt="" />
              </span>
            ) : (
              ''
            )}
          </React.Fragment>
        )}

        <span>{props.settingsStore.topHint.text}</span>
      </div>
    </section>
  );
};

export default connect(
  state => ({
    settingsStore: state,
  }),
  dispatch => ({
    onHideTopHint: () => {
      dispatch({ type: 'HIDE_TOPHINT' });
    },
  })
)(TopHint);
