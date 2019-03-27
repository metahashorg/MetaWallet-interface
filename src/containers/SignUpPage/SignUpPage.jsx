import React from 'react';
import './SignUpPage.css';

import LoginInput from './../../components/LoginInput/LoginInput.jsx';
let emailRE = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i;

const SignUpPage = props => {
  let submit = e => {
    let nick = document.querySelector('input[name=login-email]').value;
    let password = document.querySelector('input[name=login-password]').value;
    let passwordconf = document.querySelector('input[name=login-password-conf]')
      .value;
    if (password !== passwordconf) {
      props.onPasswordDontMatch();
    } else if (!nick.match(emailRE)) {
      props.onInvalidEmail();
    } else if (password.length < 6) {
      props.onWrongPassword();
    } else {
      props.submit(nick, password);
    }

    e.preventDefault();
  };

  return (
    <div className="bg">
      <div className="bg__img" />

      <section className="login-page">
        <div className="login-page__logo">
          <img src="./img/metawallet-logo.svg" alt="" />
        </div>
        <div className="login-page__title">
          <span>#Meta</span>
          Wallet
        </div>

        <div className="content">
          <div className="login-page__header">
            <div className="login-page__page-name">
              <span>Create Account</span>
            </div>
            <a href="#/login" className="login-page__page-button">
              <span>user login</span>
              <img src="./img/user-login.svg" alt="" />
            </a>
          </div>
        </div>

        <form className="login-page__form login-form" onSubmit={submit}>
          <div className="content">
            <LoginInput name={'login-email'} type={'email'} text={'E-mail'} />
            <LoginInput
              name={'login-password'}
              type={'password'}
              text={'Password'}
            />
            <LoginInput
              name={'login-password-conf'}
              type={'password'}
              text={'Confirm password'}
            />

            <button className="login-form__submit" type="submit">
              <span>continue</span>
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
          Copyright © 2017-2018 #MetaHash. All Rights Reserved
        </div>
      </section>
    </div>
  );
};

export default SignUpPage;
