import React from 'react';
import { Link } from 'react-router-dom';
import './ListPage.css';

const ListPage = props => {
  return (
    <div className="bg">
      <div className="bg__img" />

      <section className="login-page login-page_index">
        <div className="login-page__logo">
          <img src="public/img/metawallet-logo.svg" />
        </div>
        <div className="login-page__title">
          <span>#Meta</span>
          Wallet
        </div>
      </section>

      <section className="index-table__section">
        <h2 className="index-table__header">Страницы</h2>
        <nav className="index-table">
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
        </nav>
      </section>
    </div>
  );
};

export default ListPage;
