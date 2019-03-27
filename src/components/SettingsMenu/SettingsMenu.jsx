import React from 'react';
import cn from 'classnames';
import { connect } from 'react-redux';
import './SettingsMenu.css';
import clearCache from '../../model/clearCache';

const SettingsMenu = props => {
  const closeSettings = () => {
    props.onCloseSettings();
  };

  const openSettingsSingle = type => {
    props.onOpenSettingsSingle(type);
  };

  return (
    <div
      className={cn('settings-menu', props.store.settingsMenu ? 'opened' : '')}>
      <div className="settings-menu__bg">
        <div className="settings-menu__card">
          <div
            className="settings-menu__close"
            onClick={() => {
              closeSettings();
            }}
          />
          <div className="settings-menu__header">
            <span>Settings</span>
          </div>
          <div className="settings-menu__inner">
            <div className="group">
              <div className="group__item" style={{ display: 'none' }}>
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
                <div className="group__val">
                  {props.store.onlyLocal
                    ? 'Show wallets on the device only'
                    : 'Display all wallets'}
                </div>
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
  })
)(SettingsMenu);
