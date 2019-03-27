import React from 'react';

import './PasscodeEnter.css';

const PasscodeEnter = props => {
  return (
    <div className="bg">
      <div className="bg__img" />

      <section className="passcode">
        <div className="passcode__header">Enter Passcode</div>
        <div className="passcode__code">
          <span />
          <span />
          <span />
        </div>

        <div className="passcode__pad">
          <div className="passcode__num">
            <span>1</span>
            <span />
          </div>
          <div className="passcode__num">
            <span>2</span>
            <span>A B C</span>
          </div>
          <div className="passcode__num">
            <span>3</span>
            <span>D E F</span>
          </div>
          <div className="passcode__num">
            <span>4</span>
            <span>G H I</span>
          </div>
          <div className="passcode__num">
            <span>5</span>
            <span>J K L</span>
          </div>
          <div className="passcode__num">
            <span>6</span>
            <span>M N O</span>
          </div>
          <div className="passcode__num">
            <span>7</span>
            <span>P Q R S</span>
          </div>
          <div className="passcode__num">
            <span>8</span>
            <span>T U V</span>
          </div>
          <div className="passcode__num">
            <span>9</span>
            <span>W X Y Z</span>
          </div>
          <div className="passcode__num">
            <span>0</span>
            <span />
          </div>
        </div>

        <div className="passcode__button">
          <span>Forgot Passcode?</span>
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

export default PasscodeEnter;
