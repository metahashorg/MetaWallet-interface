import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import './SettingsBlock.css';

const SettingsBlock = props => {
  let topHintText = React.createRef(),
    topHintType = React.createRef();

  const toggleOffline = e => {
    e.stopPropagation();
    props.onToggleOffline();
  };

  const toggleList = list => {
    list.target.parentNode.classList.toggle('opened');
  };

  const toggleBlock = e => {
    e.stopPropagation();
    e.target.parentNode.parentNode.classList.toggle('hidden');
  };

  const showHint = () => {
    props.onShowTopHint({
      text: topHintText.value,
      type: topHintType.checked ? 'warning' : 'tip',
      show: true,
    });
  };
  return (
    <div className="settings-block">
      <div className="settings-block__hide" onClick={toggleBlock}>
        <span>{'<'}</span>
        <span>{'>'}</span>
      </div>
      <div className="settings-block__list">
        <h3 onClick={toggleList}>Ссылки</h3>
        <Link to="/">Список страниц</Link>
        <Link to="/login">Login</Link>
        <Link to="/signup">Sign Up</Link>
        <Link to="/connecting">Connecting</Link>
        <Link to="/passcode-setup">Passcode Setup</Link>
        <Link to="/passcode-enter">Passcode Enter</Link>
        <Link to="/terms">Terms</Link>
        <Link to="/home-wallets">Home Wallets</Link>
        <Link to="/create-wallet">Create wallet</Link>
        <Link to="/create-transfer">Create transfer</Link>
        <Link to="/wallets">Wallets</Link>
      </div>
      <div className="settings-block__list">
        <h3 onClick={toggleList}>Подключение</h3>
        <button onClick={toggleOffline}>
          {props.settingsStore.isOffline ? 'Offline' : 'Online'}
        </button>
      </div>
      <div className="settings-block__list">
        <h3 onClick={toggleList}>Всплывающее окно</h3>
        <input
          type="text"
          name="top-hint-text"
          ref={input => {
            topHintText = input;
          }}
        />
        <label>
          <input
            type="checkbox"
            value="Warning"
            name="top-hint-type"
            ref={input => {
              topHintType = input;
            }}
          />
          Warning
        </label>
        <button onClick={showHint}>Показать</button>
      </div>
    </div>
  );
};

export default connect(
  state => ({
    settingsStore: state,
  }),
  dispatch => ({
    onShowTopHint: topHintSettings => {
      dispatch({ type: 'SHOW_TOPHINT', payload: topHintSettings });
    },
    onToggleOffline: () => {
      dispatch({ type: 'TOGGLE_MODE' });
    },
  })
)(SettingsBlock);
