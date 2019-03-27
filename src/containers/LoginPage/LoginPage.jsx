import React from 'react';
import './LoginPage.css';

import LoginInput from './../../components/LoginInput/LoginInput.jsx';

const LoginPage = props => {
  let submit = e => {
    let nick = document.querySelector('input[name=login-email]').value;
    let password = document.querySelector('input[name=login-password]').value;
    props.submit(nick, password);
    e.preventDefault();
  };
  return (
    <div className="bg">
      <div className="bg__img" />

      <section className="login-page">
        <div className="login-page__title">
          <span>#Meta</span>
          Wallet
        </div>

        <div className="content">
          <div className="login-page__header">
            <div className="login-page__page-name">
              <span>Login</span>
            </div>
            <a href="#/signup" className="login-page__page-button">
              <span>Create account</span>
              <img src="./img/create-account.svg" alt="" />
            </a>
          </div>
        </div>

        <form
          action="#"
          className="login-page__form login-form"
          onSubmit={submit}>
          <div className="content">
            <LoginInput name={'login-email'} type={'email'} text={'E-mail'} />
            <LoginInput
              name={'login-password'}
              type={'password'}
              text={'Password'}
            />
            <button className="login-form__submit" type="submit">
              <span>login</span>
              <img src="./img/submit.svg" alt="" />
            </button>
          </div>
        </form>

        <div className="login-page__spacer" />

        <a
          href=""
          className="login-page__metahash"
          onClick={e => e.preventDefault()}>
          <img src="./img/metahash.svg" alt="#metahash" />
        </a>

        <div className="login-page__version">{window.MH_APP_VERSION}</div>

        <div className="passcode__copyright">
          Copyright © 2017-2019 #MetaHash. All Rights Reserved
        </div>
      </section>
    </div>
  );
};

export default LoginPage;
