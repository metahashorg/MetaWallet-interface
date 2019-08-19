/**
 * Popular addresses
 * @type {Object<number, Object<string, string>>}
 */
const HashDictionary = Object.assign({}, Dictionary);

HashDictionary[CURRENCY_ID_MHC] = {
    "0x00fa2a5279f8f0fd2f0f9d3280ad70403f01f9d62f52373833": "MetaWat.ch",
    // системные
    "InitialWalletTransaction": "Initial Wallet",
    "0x007a1e062bdb4d57f9a93fd071f81f08ec8e6482c3135c55ea": "Node registrator",
    "0x666174686572206f662077616c6c65747320666f7267696e67": "Wallet forging",
    "0x666174686572206f662073657276657220666f7267696e6720": "Server forging",
    // подписывальщики блоков
    "0x0028dd1ca2951fe554ef526d60ff55a64776ee5e033120ca91": "Sign 0x0028dd…ca91",
    "0x005140a0ae997aeae77c09d7d4ccf97aa65695a9a1e28812bd": "Sign 0x005140…12bd",
    "0x0057b301028c5e0c234bb35b611fc8d3d15c797fb39ef768a4": "Sign 0x0057b3…68a4",
    "0x0069fce976a40fbd2c894f1fe635255fc16c80bfe17ce65f5e": "Sign 0x0069fc…5f5e",
    "0x007fce3c1e56c67f963428b3dcdfc4400408918b843d1652ec": "Sign 0x007fce…52ec",
    "0x00a88a888d16a23991e73b4081b745eec0f56cdc7063baa360": "Sign 0x00a88a…a360",
    "0x00f3dc22cbe3519ce94e9bf12145d61789da0bfd26bbdf7999": "Sign 0x00f3dc…7999",
    // тестеры сети
    "0x00cacf8f42f4ffa95bc4a5eea3cf5986f56e13eed8ae012a67": "Tester EU",
    "0x00bc4787973cb36f47d4f274bc340cb3e1402030955c85e563": "Tester CN",
    "0x00b888869e8d4a193e80c59f923fe9f93fd6552875c857edbe": "Tester US",
    // биржи
    "0x0039f42ad734606d250ea0b0151d4aeab6b4edc6587c4b27ef": "KuCoin withdrawal wallet",
    "0x0033626a3977271fd3d1c47e05e3f34c69f38661bdebacad65": "KuCoin inner wallet",
    "0x00a335dc550bcb31abf2ec9c9c365ab39413ab6b2dfade258e": "Detax.io",
    "0x004e10e987a4f9ba73c40780679dd8688bc306b68052c31766": "DetaxPay",
    "0x00a8a58f6cdce810bafc58be25783a0ba6c917dd82d302d404": "Bit-Z|BitZ",
    "0x005b891007c2000fee08e085beb91494f1d3753eb8eee354f0": "CEX.IO",
    "0x001c65639339ad5ec96d02938f802858425a502ec04206515b": "BitMax.io",
};