import React from 'react';
import cn from 'classnames';
import { connect } from 'react-redux';
import './SettingsSingle.css';

const SettingsSingle = props => {
  const closeSettingsSingle = () => {
    props.onCloseSettingsSingle();
  };

  const toggleSettingsSystemRequest = () => {
    props.onToggleSettingsSystemRequest();
  };

  const settingsSystemResendRequest = () => {
    props.onSettingsSystemResendRequest();
  };

  const openVerticalMenu = type => {
    props.onOpenVerticalMenu(type);
  };

  return (
    <div
      className={cn(
        'settings-single-menu',
        props.store.settingsSingle.opened ? 'opened' : 'closed',
        props.store.settingsSingle.init ? 'init' : '',
        props.store.settingsResendRequest ? 'settings-single-menu_resend' : ''
      )}>
      <div className="settings-single-menu__bg" />
      <div className="settings-single-menu__content">
        <div className="settings-single-menu__menu">
          <div
            className="settings-single-menu__close"
            onClick={() => {
              closeSettingsSingle();
            }}
          />
          <div className="settings-single-menu__header">
            {props.store.settingsSingle.type === 'wallet' && 'Display wallets'}
            {props.store.settingsSingle.type === 'system' &&
              'System information'}
          </div>
        </div>

        {!props.store.settingsResendRequest && (
          <div className="scroll-container">
            {props.store.settingsSingle.type === 'system' && (
              <div className="settings-single-menu__category">Versions</div>
            )}

            <form className="form">
              {props.store.settingsSingle.type === 'wallet' && (
                <div>
                  <input
                    type="radio"
                    name="display-wallets"
                    id="radio1"
                    defaultChecked={!props.store.onlyLocal}
                  />
                  <label
                    htmlFor="radio1"
                    onClick={e => {
                      props.onSelectOnlyLocal(false);
                    }}>
                    Display all wallets
                  </label>
                  <input
                    type="radio"
                    name="display-wallets"
                    id="radio2"
                    defaultChecked={props.store.onlyLocal}
                  />
                  <label
                    htmlFor="radio2"
                    onClick={e => {
                      props.onSelectOnlyLocal(true);
                    }}>
                    Show wallets on the device only
                  </label>
                </div>
              )}
              {props.store.settingsSingle.type === 'system' && (
                <div>
                  <div className="line">
                    <div className="line__name">
                      App version ({window.PLATFORM}
                      ):
                    </div>
                    <div className="line__val">{window.APP_VERSION}</div>
                    <div className="line__btn line__btn_copy" />
                  </div>
                  <div className="line">
                    <div className="line__name">
                      Interface version ({window.PLATFORM}
                      ):
                    </div>
                    <div className="line__val">
                      {window.MH_APP_VERSION_SHORT}
                    </div>
                    <div className="line__btn line__btn_copy" />
                  </div>
                </div>
              )}
            </form>

            <div className="description">
              {props.store.settingsSingle.type === 'wallet' && (
                <p>
                  You can choose one of the display’s option to see all wallets,
                  even some of them are not on your current device, or see only
                  the wallets, locating on your device. If you select to display
                  all wallets, the wallets, which are not locate on yor device,
                  will be demonstrated as grey ones. You will not be allowed to
                  make transactions and will not be able to check a status and a
                  balance of such wallet.
                </p>
              )}
              {props.store.settingsSingle.type === 'system' && (
                <p>
                  If somenthing goes wrong and you need to ask for help from
                  support team, just make the screenshot of this page or copy
                  following information to apply with your question.
                </p>
              )}
            </div>

            {/*Второй блок*/}
            {props.store.settingsSingle.type === 'wallet' &&
              window.PLATFORM === 'iOS' && (
                <div className="settings-single-menu__category settings-single-menu__category_icloud">
                  iCloud synchronization
                </div>
              )}
            {props.store.settingsSingle.type === 'wallet' &&
              window.PLATFORM === 'iOS' && (
                <form className="form">
                  <div>
                    <input
                      type="checkbox"
                      name="iCloud"
                      id="iCloud"
                      defaultChecked={true}
                    />
                    <label htmlFor="iCloud">Store private keys in iCloud</label>
                  </div>
                </form>
              )}
            {props.store.settingsSingle.type === 'wallet' &&
              window.PLATFORM === 'iOS' && (
                <div className="description">
                  <p>
                    If your device is lost or damaged you can restore wallets
                    from iCloud to your new device. If turned off, please make
                    sure you have secure backup of your private keys and
                    passwords elswhere. They can not be restored or reset.{' '}
                    <b>If lost, they are gone.</b>
                  </p>
                </div>
              )}

            {props.store.settingsSingle.type === 'system' && (
              <div className="share">
                <div className="settings-single-menu__category settings-single-menu__category_share">
                  share a problem (system’s logs)
                </div>
                <form className="form">
                  <div>
                    {props.store.settingsSendRequest && (
                      <div
                        className="line line_share"
                        onClick={() => {
                          toggleSettingsSystemRequest();
                        }}>
                        <div className="line__icon" />
                        <div className="line__name">
                          Re-send logs to support team
                        </div>
                      </div>
                    )}
                    {!props.store.settingsSendRequest && (
                      <div
                        className="line line_share"
                        onClick={() => {
                          openVerticalMenu('problem');
                        }}>
                        <div className="line__icon" />
                        <div className="line__name">
                          Send logs to support team
                        </div>
                      </div>
                    )}
                  </div>
                </form>

                {props.store.settingsSendRequest && (
                  <div className="description">
                    <div className="status">
                      <div className="status__line">
                        Last request was sent:{' '}
                        <span>29.06.2019, 20:30 (+3 GMT)</span>
                      </div>
                      <div className="status__line">
                        Request ID: <span>156 678</span>
                      </div>
                      <div className="status__line">
                        Problem type: <span>other</span>
                      </div>
                      <div className="status__line">
                        Request status: <span>processing</span>
                      </div>
                    </div>
                    <p>
                      Your request has been successfully sent to support team.
                      Average time of request processing takes from 1 up 24
                      hours (depends on a number of requests).
                    </p>
                    <p>
                      If you have any questions, please don’t be hesitate to
                      contact us:{' '}
                      <a href="mailto:support@metahash.org">
                        support@metahash.org
                      </a>
                    </p>
                  </div>
                )}
                {!props.store.settingsSendRequest && (
                  <div className="description">
                    <p>
                      If you have any troubles with the application or
                      functions, click this button to send your system’s logs,
                      including versions of app and interface, errors’ list,
                      proxys’ and torrents connected to the app, etc. After
                      sending, you will see your personal ID, which can be used
                      as ID of your request.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {props.store.settingsResendRequest && (
          <div className="resend">
            <div className="resend__card">
              <div className="resend__header">
                <span>Are you sure that you want to re-send a request?</span>
              </div>
              <div className="resend__text">
                <span>
                  In case of re-sending your last request <em>(ID 156 678)</em>{' '}
                  will be eliminated from the list of requests.
                </span>
              </div>
              <div className="resend__buttons">
                <div
                  className="button"
                  onClick={() => {
                    settingsSystemResendRequest();
                  }}>
                  <span>Re-send a request</span>
                </div>
                <div
                  className="button button_cancel"
                  onClick={() => {
                    settingsSystemResendRequest();
                  }}>
                  <span>cancel</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default connect(
  state => ({
    store: state,
  }),
  dispatch => ({
    onCloseSettingsSingle: () => {
      dispatch({ type: 'SETTINGS-SINGLE_CLOSE' });
    },
    onToggleSettingsSystemRequest: () => {
      dispatch({ type: 'SETTINGS-SYSTEM-REQUEST_TOGGLE' });
    },
    onSettingsSystemResendRequest: () => {
      dispatch({ type: 'SETTINGS-SYSTEM-RESEND-REQUEST' });
    },
    onOpenVerticalMenu: type => {
      dispatch({ type: 'SETTINGS_OPEN', payload: type });
    },
    onSelectOnlyLocal: flag => {
      dispatch({ type: 'SETTINGS-ONLY_LOCAL', payload: flag });
    },
  })
)(SettingsSingle);
