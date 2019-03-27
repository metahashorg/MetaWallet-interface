import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

import './ConnectingStatus.css';

const ConnectingStatus = props => {
  const disconnected = props.disconnected ? 'active' : '';
  return (
    <div className="loading-status">
      <div className={cn('loading-status__icon', 'connecting', disconnected)}>
        {!props.disconnected ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 87.71 51.18"
            width="100"
            height="51"
            id="preloader_svg_anim">
            <defs />
            <g>
              <ellipse
                cx="10.7"
                cy="37.71"
                rx="7.07"
                ry="7.05"
                fill="rgb(88, 103, 121)"
              />
              <ellipse
                cx="33.08"
                cy="16.43"
                rx="7.07"
                ry="7.05"
                fill="rgb(88, 103, 121)"
              />
              <ellipse
                cx="54.27"
                cy="37.59"
                rx="7.07"
                ry="7.05"
                fill="rgb(88, 103, 121)"
              />
              <ellipse
                cx="74.3"
                cy="10.55"
                rx="7.07"
                ry="7.05"
                fill="rgb(88, 103, 121)"
              />
              <line
                x1="33.25"
                y1="15.66"
                x2="9.7"
                y2="39.06"
                stroke="rgb(88, 103, 121)"
                stroke-width="2"
              />
              <line
                x1="31.7"
                y1="15.29"
                x2="54.86"
                y2="37.01"
                stroke="rgb(88, 103, 121)"
                stroke-width="2"
              />
              <line
                x1="54.86"
                y1="37.21"
                x2="75.08"
                y2="10.71"
                stroke="rgb(88, 103, 121)"
                stroke-width="2"
              />
            </g>
            <g id="op1">
              <ellipse
                id="obj1"
                cx="10.7"
                cy="37.71"
                rx="7.07"
                ry="7.05"
                fill="rgba(255,255,255,1)"
              />
              <g opacity="1" id="obg99">
                <ellipse
                  id="obj3"
                  cx="33.08"
                  cy="16.43"
                  rx="7.07"
                  ry="7.05"
                  fill="rgba(255,255,255,0)"
                />
                <ellipse
                  id="obj5"
                  cx="54.27"
                  cy="37.59"
                  rx="7.07"
                  ry="7.05"
                  fill="rgba(255,255,255,0)"
                />
                <ellipse
                  id="obj7"
                  cx="74.3"
                  cy="10.55"
                  rx="7.07"
                  ry="7.05"
                  fill="rgba(255,255,255,0)"
                />
                <line
                  id="obj2"
                  x2="33.25"
                  y2="15.66"
                  x1="9.7"
                  y1="39.06"
                  stroke="rgba(255,255,255,1)"
                  stroke-width="2"
                  stroke-dasharray="0 80"
                />
                <line
                  id="obj4"
                  x1="31.7"
                  y1="15.29"
                  x2="54.86"
                  y2="37.01"
                  stroke="rgba(255,255,255,1)"
                  stroke-width="2"
                  stroke-dasharray="0 80"
                />
                <line
                  id="obj6"
                  x1="54.86"
                  y1="37.21"
                  x2="75.08"
                  y2="10.71"
                  stroke="rgba(255,255,255,1)"
                  stroke-width="2"
                  stroke-dasharray="0 80"
                />
              </g>
            </g>

            <animate
              id="an2"
              xlinkHref="#obj2"
              attributeName="stroke-dasharray"
              from="0 80"
              to="80 80"
              begin="an3.end"
              dur="0.5s"
              fill="freeze"
            />
            <animate
              id="an3"
              xlinkHref="#obj3"
              attributeName="fill"
              from="rgba(255,255,255,0)"
              to="rgba(255,255,255,1)"
              begin="0s;an100.end"
              dur="0.5s"
              fill="freeze"
            />
            <animate
              id="an4"
              xlinkHref="#obj4"
              attributeName="stroke-dasharray"
              from="0 80"
              to="80 80"
              begin="an5.end"
              dur="0.5s"
              fill="freeze"
            />
            <animate
              id="an5"
              xlinkHref="#obj5"
              attributeName="fill"
              from="rgba(255,255,255,0)"
              to="rgba(255,255,255,1)"
              begin="an2.end"
              dur="0.5s"
              fill="freeze"
            />
            <animate
              id="an6"
              xlinkHref="#obj6"
              attributeName="stroke-dasharray"
              from="0 80"
              to="80 80"
              begin="an7.end"
              dur="0.5s"
              fill="freeze"
            />
            <animate
              id="an7"
              xlinkHref="#obj7"
              attributeName="fill"
              from="rgba(255,255,255,0)"
              to="rgba(255,255,255,1)"
              begin="an4.end"
              dur="0.5s"
              fill="freeze"
            />

            <animate
              id="an99"
              xlinkHref="#obg99"
              attributeName="opacity"
              from="1"
              to="0"
              begin="an6.end"
              dur=".5s"
              fill="freeze"
            />

            <animate
              id="an9"
              xlinkHref="#obj2"
              attributeName="stroke-dasharray"
              from="80 80"
              to="0 80"
              begin="an99.end"
              dur="0.1s"
              fill="freeze"
            />
            <animate
              id="an10"
              xlinkHref="#obj3"
              attributeName="fill"
              from="rgba(255,255,255,1)"
              to="rgba(255,255,255,0)"
              begin="an99.end"
              dur="0.1s"
              fill="freeze"
            />
            <animate
              id="an11"
              xlinkHref="#obj4"
              attributeName="stroke-dasharray"
              from="80 80"
              to="0 80"
              begin="an99.end"
              dur="0.1s"
              fill="freeze"
            />
            <animate
              id="an12"
              xlinkHref="#obj5"
              attributeName="fill"
              from="rgba(255,255,255,1)"
              to="rgba(255,255,255,0)"
              begin="an99.end"
              dur="0.1s"
              fill="freeze"
            />
            <animate
              id="an13"
              xlinkHref="#obj6"
              attributeName="stroke-dasharray"
              from="80 80"
              to="0 80"
              begin="an99.end"
              dur="0.1s"
              fill="freeze"
            />
            <animate
              id="an14"
              xlinkHref="#obj7"
              attributeName="fill"
              from="rgba(255,255,255,1)"
              to="rgba(255,255,255,0)"
              begin="an99.end"
              dur="0.1s"
              fill="freeze"
            />
            <animate
              id="an100"
              xlinkHref="#obg99"
              attributeName="opacity"
              from="0"
              to="1"
              begin="an14.end"
              dur="0.4s"
              fill="freeze"
            />
          </svg>
        ) : (
          <svg
            width="62"
            height="59"
            viewBox="0 0 62 59"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path d="M2 2h58v55H2z" />
            <path
              d="M53.103 42.895C48.439 51.31 39.516 57 29.276 57 14.212 57 2 44.688 2 29.5S14.212 2 29.276 2c12.68 0 23.34 8.725 26.396 20.546"
              stroke="#99CEFF"
              stroke-width="4"
              stroke-linecap="round"
            />
            <path
              d="M60 13.063l-4.091 11.112-10.217-7.5"
              stroke="#99CEFF"
              stroke-width="4"
              stroke-linecap="round"
            />
          </svg>
        )}
      </div>

      <div className={cn('loading-status__status', disconnected)}>
        {props.statusText}
      </div>
      {props.statusHint ? (
        <div className="loading-status__hint">{props.statusHint}</div>
      ) : (
        ''
      )}

      {props.disconnected ? (
        <div>
          <div className="loading-status__wallet-btn">
            <span>enter the wallets</span>
          </div>
          <div className="loading-status__wallet-text">
            <span>
              the data of all wallets may be incorrect without connection to the
              network
            </span>
          </div>
        </div>
      ) : (
        ''
      )}
    </div>
  );
};

ConnectingStatus.propTypes = {
  disconnected: PropTypes.bool,
};

export default ConnectingStatus;
