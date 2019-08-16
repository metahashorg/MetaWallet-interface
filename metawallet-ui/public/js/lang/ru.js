/**
 * Русская локализация
 * @type {Object<string, string>}
 */
window.appLang = {

    // errors

    "error.unknown": "Unknown error",
    "error.connection": "Connection problem",
    "error.connection.offline": "Offline mode",
    "error.connection.online": "Online mode",
    "error.notavailable": "Недоступно в текущей версии",
    "error.availableonlyinmetagate": "Недоступно только в MetaGate",
    "error.unknown.domain": "Unknown domain",

    // common

    "common.version": "Interface ver. " + VERSION + "." + VERSION_BUILD + ". Application ver. " + VERSION_APP,// + metawallet.env.appVersion + "." + metawallet.env.build,
    "common.copyright": "Copyright © 2017-2019 #MetaHash.  All Rights Reserved",

    "currency.tmh": "TMH",
    "currency.btc": "BTC",
    "currency.eth": "ETH",
    "currency.mhc": "MHC",
    "currency.usd": "USD",

    "action.continue": "Continue",

    // MenuView

    "menu.home": "Home",
    "menu.apps": "Apps",
    "menu.settings": "Settings",
    "menu.support": "Support",
    "menu.logout": "Log out",

    // PasscodeAlertView

    "passcodemodalview.title": "Enter Passcode",
    "passcodemodalview.title.new": "Enter New Passcode",
    "passcodemodalview.title.repeat": "Repeat New Passcode",

    "settings.passcode.changed": "Passcode changed",
    "settings.passcode.turnedon": "Passcode turned on",
    "settings.passcode.turnedoff": "Passcode turned off",

    // LoaderView

    "loaderview.message.connected": "Connected!",
    "loaderview.message.connecting": "Connecting...",

    "loaderview.tips.header": "TIP",
    "loaderview.tips.tip1": "Remember to keep the password yourself!",
    "loaderview.tips.tip2": "We never save your password anywhere.",
    "loaderview.tips.tip3": "Please keep your keys safely. Keep in mind that if you lose them, your keys cannot be recovered.",
    "loaderview.tips.tip4": "Don\u2019t delete the app in order not to lose all of its data.",
    "loaderview.tips.tip5": "Please note: the confirmation of Ethereum/Bitcoin transactions can take a long time.",
    "loaderview.tips.tip6": "You may create unlimited number of wallets.",
    "loaderview.tips.tip7": "You can select the preferred language in the menu.",
    "loaderview.tips.tip8": "You can import existing #MetaHash wallets using QR code.",
    "loaderview.tips.tip9": "Please keep the key password safely. If you lose it, you will not be able to manage your money. Make sure  you will not forget it.",
    "loaderview.tips.tip10": "We never save your password anywhere.",


    // AuthView

    "auth.error.usernotfound": "User not found",
    "auth.error.wrongcredentials": "Wrong password",

    // ResetPasswordView

    "resetpassword.ok": "Password reset link has been sent to your e-mail address",

    // TermsView

    "termsview.needagree": "Please read and agree with terms and conditions to continue",

    // CreateAccountView

    "register.error.emailexists": "Account with this e-mail address already exists",

    // CurrenciesView

    "wallets.settings.base.period.day": "24H",
    "wallets.settings.base.period.week": "7 DAYS",
    "wallets.settings.base.period.month": "1 MONTH",
    "wallets.settings.base.currency.1": "TMH",
    "wallets.settings.base.currency.2": "BTC",
    "wallets.settings.base.currency.3": "ETH",
    "wallets.settings.base.currency.4": "MHC",
    "wallets.settings.base.currency.1000": "USD",

    "currenciesview.totalassetsvalue": "Total Assets Value",
    "currenciesview.tab.currencies": "Currencies",
    "currenciesview.tab.wallets": "Recent Wallets",

    // WalletsView

    "walletsview.tab.wallets": "Wallets",
    "walletsview.tab.latesttransactions": "Latest Transactions",

    // SettingsView

    "settings.title": "Settings",

    "settings.locale.en": "English",
    "settings.locale.ru": "Русский",

    "settings.cache.cleaned": "Cache cleaned",

    // PasswordSettingsView

    "settings.password.changed": "Password changed",
    "settings.password.error.newpasswordsdonotmatch": "New passwords do not match",
    "settings.password.error.emptyoldpassword": "Enter your current password",
    "settings.password.error.emptynewpassword": "Enter your new password",
    "settings.password.error.wrongpassword": "Wrong current password",
    "settings.password.error.shortnewpassword": "New password too simple. Minimum length: ",

    // PasscodeSettingsView

    "settings.passcode.turnon": "Turn on passcode",
    "settings.passcode.turnoff": "Turn off passcode",
    "settings.passcode.error.donotmatch": "Passcodes do not match",

    // WalletImportEncryptedAlertView

    "walletimportview.error.unknowncode": "Unknown QRcode",
    "walletimportview.title.address": "Address",
    "walletimportview.title.key.public": "Public Key",
    "walletimportview.title.key.enc": "Key file is encrypted",
    "walletimportview.title.key.open": "Key file is open",
};

/**
 * @param {number} time - UNIX timestamp (seconds)
 * @param {boolean} date - need date?
 * @return {string}
 */
window.timeToDateTime = function (time, date) {
    date = typeof date !== "undefined" ? date : false;
    let d = new Date();
    d.setTime(time * 1000);

    /**
     * @param {number} n
     * @return {string}
     */
    function addZero (n) {
        return n <= 9 ? "0" + n : "" + n;
    }

    let dateStr = [addZero(d.getDate()), addZero(d.getMonth() + 1), d.getFullYear()].join(".");
    let timeStr = [addZero(d.getHours()), addZero(d.getMinutes()), addZero(d.getSeconds())].join(":");

    return (date ? dateStr + " " : "") + timeStr;
};