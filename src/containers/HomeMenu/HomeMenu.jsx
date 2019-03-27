import React from 'react';
import cn from 'classnames';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import './HomeMenu.css';

const HomeMenu = props => {
  const closeMenu = () => {
    props.onCloseMenu();
  };

  const openSettings = type => {
    props.onOpenSettings(type);
  };

  return (
    <div className={cn('home-menu', props.store.homeMenu ? 'opened' : '')}>
      <div className="home-menu__bg" />
      <div className="home-menu__close" onClick={closeMenu} />
      <div className="home-menu__logo" />

      <div className="home-menu__content">
        <div className="home-menu__name">{props.store.login}</div>
        <div className="home-menu__menu">
          <Link
            to="/home-wallets"
            className="home-menu__link home-menu__link_home"
            onClick={e => {
              props.onCloseMenu();
            }}>
            <span className="icon" />
            <span className="text">Home</span>
          </Link>
          <Link
            to="/login"
            onClick={e => {
              props.onCloseMenu();
              e.preventDefault();
            }}
            className="home-menu__link home-menu__link_apps disabled">
            <span className="icon" />
            <span className="text">Apps</span>
          </Link>
          <Link
            to="/login"
            onClick={e => {
              props.onCloseMenu();
              e.preventDefault();
            }}
            className="home-menu__link home-menu__link_buy disabled">
            <span className="icon" />
            <span className="text">Buy #mhc</span>
          </Link>
          <Link
            to="/settings"
            onClick={e => {
              props.onCloseMenu();

              openSettings('settings');
              e.preventDefault();
            }}
            className="home-menu__link  home-menu__link_settings">
            <span className="icon" />
            <span className="text">settings</span>
          </Link>
          <Link
            to="/login"
            className="home-menu__link home-menu__link_support disabled"
            onClick={e => {
              props.onCloseMenu();
              e.preventDefault();
            }}>
            <span className="icon" />
            <span className="text">Support</span>
          </Link>
          <Link
            to="/login"
            className="home-menu__link home-menu__link_logout"
            onClick={e => {
              props.logOut();
              props.onCloseMenu();
            }}>
            <span className="icon" />
            <span className="text">Log out</span>
          </Link>
        </div>
      </div>

      <div className="home-menu__copyright">© 2017-2018 #MetaHash</div>
    </div>
  );
};

export default connect(
  state => ({
    store: state,
  }),
  dispatch => ({
    onCloseMenu: () => {
      dispatch({ type: 'MENU_CLOSE' });
    },
    logOut: () => {
      dispatch({ type: 'LOG_OUT' });
    },
    onOpenSettings: type => {
      dispatch({ type: 'SETTINGS_OPEN', payload: type });
    },
  })
)(HomeMenu);
