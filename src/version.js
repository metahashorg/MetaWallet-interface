import getAppInfo from './model/getAppInfo';

const MH_APP_VERSION = ' 0.1.91';
window.MH_APP_VERSION = MH_APP_VERSION;

getAppInfo()
  .then(info => {
    window.APP_VERSION = info;
    window.MH_APP_VERSION_SHORT = MH_APP_VERSION;
    window.MH_APP_VERSION = `Interface ver. ${MH_APP_VERSION}. Application ver. ${info}`;
    window.PLATFORM = window.androidJsBridge ? 'Android' : 'iOS';
  })
  .catch(err => {});

export default MH_APP_VERSION;
