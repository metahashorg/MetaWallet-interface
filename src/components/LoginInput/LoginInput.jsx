import React from 'react';
import './LoginInput.css';

const LoginInput = props => {
  const fixLabel = input => {
    if (input.target.value === '') {
      input.target.parentNode.classList.remove('not-empty');
    } else {
      input.target.parentNode.classList.add('not-empty');
    }
  };
  return (
    <div className="login-form__input">
      <input
        type={props.type}
        name={props.name}
        id={props.name}
        onChange={fixLabel}
        autoComplete="off"
        onInvalid={e => {
          e.preventDefault();
        }}
      />
      <div className="login-form__icon" />
      <label htmlFor={props.name}>{props.text}</label>
    </div>
  );
};

export default LoginInput;
