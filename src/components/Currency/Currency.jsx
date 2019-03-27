import React from 'react';
import { LineChart, Line } from 'recharts';

const Currency = props => {
  let currencyClass = props.currencyCode.replace('#', '').toLowerCase();
  const onCurrencyClick = () => {
    props.onCurrencyClick &&
      props.onCurrencyClick(props.id, props.currencyCode.replace('#', ''));
  };
  return (
    <div
      className={`currency currency_${currencyClass}`}
      onClick={onCurrencyClick}>
      <div className="currency__name">{props.currencyName}</div>
      <div className="currency__block">
        <div className="currency__img" />
        <div className="currency__val">
          <div className="currency__cur">
            <span>{props.balanceFloor}</span>
            <span>
              .{props.balanceResidue} {props.currencyCode}
            </span>
          </div>
          <div className="currency__usd">
            <span>{props.usdBalanceFloor}</span>
            <span>.{props.usdBalanceResidue} USD</span>
          </div>
        </div>
        <div className="currency__items">
          <div className="currency__item">
            <span>{props.walletsCount}</span> Wallets
          </div>
          <div className="currency__item">
            <span>{props.tokensCount}</span> Tokens
          </div>
        </div>
        <div className="currency__favorite" />
        <div className="currency__course">
          Currency course: {props.course} USD
          <span>{props.diff}</span>
        </div>
        <div className="currency__chart">
          {' '}
          <LineChart width={316} height={100} data={props.data}>
            <defs>
              <linearGradient
                id="paint0_linear"
                x1="0"
                y1="35"
                x2="0"
                y2="10"
                gradientUnits="userSpaceOnUse">
                <stop stopColor="#2F7BC2" />
                <stop stopColor="#04D67E" offset="1" />
              </linearGradient>
            </defs>
            <Line
              isAnimationActive={false}
              type="monotone"
              dataKey="val"
              stroke="url(#paint0_linear)"
              dot={false}
              activeDot={false}
            />
          </LineChart>
        </div>
      </div>
    </div>
  );
};

export default Currency;
