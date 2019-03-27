import React from 'react';
import cn from 'classnames';
import { connect } from 'react-redux';
import './VerticalMenu.css';
import clearCache from '../../model/clearCache';

const VerticalMenu = props => {
  const closeSettings = () => {
    props.onCloseSettings();
  };

  const openSettingsSingle = type => {
    props.onOpenSettingsSingle(type);
  };

  const toggleSettingsSystemRequest = () => {
    props.onCloseSettings();
    props.onToggleSettingsSystemRequest();
  };

  return (
    <div
      className={cn(
        'vertical-menu',
        props.store.verticalMenu.opened ? 'opened' : 'closed',
        props.store.verticalMenu.init ? 'init' : '',
        props.store.verticalMenu.type === 'problem' ? 'problem' : ''
      )}>
      <div className="vertical-menu__bg">
        <div className="vertical-menu__card">
          <div
            className="vertical-menu__close"
            onClick={() => {
              closeSettings();
            }}
          />
          <div className="vertical-menu__header">
            {props.store.verticalMenu.type === 'settings' && (
              <span>Settings</span>
            )}

            {props.store.verticalMenu.type === 'problem' && (
              <span>Select your problem</span>
            )}
          </div>
          {props.store.verticalMenu.type === 'settings' && (
            <div className="vertical-menu__inner">
              <div className="group">
                <div className="group__item">
                  <div className="group__icon group__icon_lang" />
                  <div className="group__name">Language</div>
                  <div className="group__val">English</div>
                </div>

                <div
                  className="group__item"
                  onClick={() => {
                    openSettingsSingle('wallet');
                  }}>
                  <div className="group__icon group__icon_wallets" />
                  <div className="group__name">Display wallets</div>
                  <div className="group__val">Wallets on the device</div>
                </div>

                <div
                  className="group__item"
                  onClick={() => {
                    openSettingsSingle('system');
                  }}>
                  <div className="group__icon group__icon_system" />
                  <div className="group__name">System info</div>
                  <div className="group__val" />
                </div>
                <div
                  className="group__item"
                  onClick={() => {
                    clearCache();
                  }}>
                  <div className="group__icon group__icon_system" />
                  <div className="group__name">Clear cache</div>
                  <div className="group__val" />
                </div>
              </div>

              <div className="group" style={{ display: 'none' }}>
                <div className="group__header">
                  <span>Security</span>
                </div>
                <div className="group__item">
                  <div className="group__icon group__icon_edit" />
                  <div className="group__name group__name_alt">
                    Change account Password
                  </div>
                  <div className="group__val group__val_alt" />
                </div>

                <div className="group__item group__item_empty" />

                <div className="group__item">
                  <div className="group__icon group__icon_google" />
                  <div className="group__name">Google Authenticator</div>
                  <div className="group__val">Activated</div>
                </div>

                <div className="group__item">
                  <div className="group__icon group__icon_onetime" />
                  <div className="group__name">OneTime Password</div>
                  <div className="group__val">Activated</div>
                </div>

                <div className="group__item">
                  <div className="group__icon group__icon_faceid" />
                  <div className="group__name">Face ID</div>
                  <div className="group__val">Enabled, for transfer</div>
                </div>

                <div className="group__item">
                  <div className="group__icon group__icon_codepas" />
                  <div className="group__name">Code-Password</div>
                  <div className="group__val">Enabled, for transfer</div>
                </div>
              </div>

              <div className="group" style={{ display: 'none' }}>
                <div className="group__header">
                  <span>Account settings</span>
                </div>
                <div className="group__item">
                  <div className="group__icon group__icon_delete" />
                  <div className="group__name group__name_red">
                    Delete Account
                  </div>
                  <div className="group__val group__val_alt" />
                </div>
              </div>
            </div>
          )}
          {props.store.verticalMenu.type === 'problem' && (
            <div className="vertical-menu__inner">
              <div className="radio">
                <div className="radio__input">
                  <input
                    type="radio"
                    defaultChecked={true}
                    name="problem"
                    id="problem1"
                  />
                  <label htmlFor="problem1">
                    <span>I can’t create a wallet</span>
                  </label>
                </div>
                <div className="radio__input">
                  <input type="radio" name="problem" id="problem2" />
                  <label htmlFor="problem2">
                    <span>My balance isn’t displayed</span>
                  </label>
                </div>
                <div className="radio__input">
                  <input type="radio" name="problem" id="problem3" />
                  <label htmlFor="problem3">
                    <span>My balance isn’t correct</span>
                  </label>
                </div>
                <div className="radio__input">
                  <input type="radio" name="problem" id="problem4" />
                  <label htmlFor="problem4">
                    <span>I can’t transfer anything</span>
                  </label>
                </div>
                <div className="radio__input radio__input_empty">
                  <label />
                </div>
                <div className="radio__input radio__input_other">
                  <input type="radio" name="problem" id="problem5" />
                  <label htmlFor="problem5">
                    <span>Other problem</span>
                  </label>
                  <textarea placeholder="Describe a problem, e.g. My connection is ok, but the system shows an error." />
                </div>
              </div>

              <div
                className="button"
                onClick={() => {
                  toggleSettingsSystemRequest();
                }}>
                <span>send a request</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default connect(
  state => ({
    store: state,
  }),
  dispatch => ({
    onCloseSettings: () => {
      dispatch({ type: 'SETTINGS_CLOSE' });
    },
    onOpenSettingsSingle: type => {
      dispatch({ type: 'SETTINGS-SINGLE_OPEN', payload: type });
    },
    onToggleSettingsSystemRequest: () => {
      dispatch({ type: 'SETTINGS-SYSTEM-REQUEST_TOGGLE' });
    },
  })
)(VerticalMenu);
