import React from 'react';
import './PasscodeSetup.css';

const PasscodeSetup = props => {
  return (
    <div className="bg">
      <div className="bg__img" />

      <section className="passcode">
        <div className="passcode__panel">
          <div className="passcode-panel">
            <div className="passcode-panel__header">Make it easier!</div>
            <div className="passcode-panel__text">
              You can set up a 4-digit passcode and simplify your login to the
              application.
            </div>
            <div className="passcode__button">
              <span>Set up a passcode</span>
            </div>
          </div>
        </div>

        <div className="passcode__button">
          <span>No, thanks, just let me in</span>
        </div>

        <div className="passcode__spacer" />

        <a href="" className="passcode__metahash">
          <img src="public/img/metahash.svg" alt="#metahash" />
        </a>

        <div className="passcode__version">ver. 1.0</div>

        <div className="passcode__copyright">
          Copyright © 2017-2018 #MetaHash. All Rights Reserved
        </div>
      </section>
    </div>
  );
};

export default PasscodeSetup;
