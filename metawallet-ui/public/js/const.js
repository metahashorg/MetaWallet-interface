const VERSION = "1.0";
const VERSION_BUILD = "22";
const VERSION_APP = "1.0.3.4";

const NODE_PORT_PROXY = 9999;
const NODE_PORT_TOR = 5795;

const DNS_URL_PROXY_NODES = "https://cloudflare-dns.com/dns-query?name=proxy.net-main.metahashnetwork.com&type=A";
const DNS_URL_TOR_NODES = "https://cloudflare-dns.com/dns-query?name=tor.net-main.metahashnetwork.com&type=A";
const DNS_URL_PROXY_TEST_NODES = "https://cloudflare-dns.com/dns-query?name=proxy.net-dev.metahashnetwork.com&type=A";
const DNS_URL_TOR_TEST_NODES = "https://cloudflare-dns.com/dns-query?name=tor.net-dev.metahashnetwork.com&type=A";

const METAHASH_NODE_TYPE_MAIN = "main";
const METAHASH_NODE_TYPE_DEV = "dev";

const API_XHR_TIMEOUT = 3000;

const API_ENDPOINT_ID = "https://id.metahash.org/api/";
const API_ENDPOINT_WALLET = "https://wallet.metahash.org/api/";
const API_ENDPOINT_TOR = "https://tor.metawat.ch/";
const API_ENDPOINT_TOR_TEST = "https://tor-dev.metawat.ch/";
const API_ENDPOINT_PROXY = "https://proxy.metawat.ch/";
const API_ENDPOINT_PROXY_TEST = "https://proxy-dev.metawat.ch/";
const API_ENDPOINT_APP = "https://app.metahash.org/api/";
const API_ENDPOINT_PLUS = "https://plus.metawat.ch/api/";
const API_ENDPOINT_NETREGISTRY = "https://netregistry.metahash.io/api/";

/** @link https://www.cloudflare.com/distributed-web-gateway/ */
const API_ENDPOINT_ETHEREUM = "https://cloudflare-eth.com/";

const API_OK = "OK";
const API_ERROR = "ERROR";
const API_ERROR_BAD_REQUEST = "Bad Request";
const API_ERROR_BAD_TOKEN = "BAD_TOKEN";
const API_ERROR_FIELD_EXISTS = "FIELD_EXISTS";
const API_ERROR_TRY_AGAIN_LATER = "TRY_AGAIN_LATER";

const NATIVEAPI_RESULT_ERROR = 0;
const NATIVEAPI_RESULT_OK = 1;

const CURRENCY_ID_TMH = 1;
const CURRENCY_ID_BTC = 2;
const CURRENCY_ID_ETH = 3;
const CURRENCY_ID_MHC = 4;
const CURRENCY_ID_USD = 1000;

const CURRENCIES = [CURRENCY_ID_MHC, CURRENCY_ID_TMH, CURRENCY_ID_BTC, CURRENCY_ID_ETH];

const CURRENCY_CODES = {};
CURRENCY_CODES[CURRENCY_ID_TMH] = "tmh";
CURRENCY_CODES[CURRENCY_ID_BTC] = "btc";
CURRENCY_CODES[CURRENCY_ID_ETH] = "eth";
CURRENCY_CODES[CURRENCY_ID_MHC] = "mhc";
CURRENCY_CODES[CURRENCY_ID_USD] = "usd";

const DEV_CURRENCIES = [CURRENCY_CODES[CURRENCY_ID_TMH]];

const CURRENCY_DECIMALS = {};
CURRENCY_DECIMALS[CURRENCY_ID_TMH] = 6;
CURRENCY_DECIMALS[CURRENCY_ID_BTC] = 0;
CURRENCY_DECIMALS[CURRENCY_ID_ETH] = 0;
CURRENCY_DECIMALS[CURRENCY_ID_MHC] = 6;
CURRENCY_DECIMALS[CURRENCY_ID_USD] = 2;

const CURRENCY_MAX_DECIMALS = {};
CURRENCY_MAX_DECIMALS[CURRENCY_ID_TMH] = 6;
CURRENCY_MAX_DECIMALS[CURRENCY_ID_BTC] = 8;
CURRENCY_MAX_DECIMALS[CURRENCY_ID_ETH] = 8;
CURRENCY_MAX_DECIMALS[CURRENCY_ID_MHC] = 6;
CURRENCY_MAX_DECIMALS[CURRENCY_ID_USD] = 2;

const CURRENCY_COEFFICIENT = {};
CURRENCY_COEFFICIENT[CURRENCY_ID_TMH] = 1e6;
CURRENCY_COEFFICIENT[CURRENCY_ID_BTC] = 1;
CURRENCY_COEFFICIENT[CURRENCY_ID_ETH] = 1;
CURRENCY_COEFFICIENT[CURRENCY_ID_MHC] = 1e6;
CURRENCY_COEFFICIENT[CURRENCY_ID_USD] = 100;

const CURRENCY_DISABLED = [CURRENCY_ID_USD];

const EXPLORER_ENDPOINT_TX = {};
EXPLORER_ENDPOINT_TX[CURRENCY_ID_TMH] = "https://mhscan.com/?page=tx&id=";
EXPLORER_ENDPOINT_TX[CURRENCY_ID_MHC] = "https://venus.mhscan.com/?page=tx&id=";
EXPLORER_ENDPOINT_TX[CURRENCY_ID_BTC] = "https://blockchain.coinmarketcap.com/tx/bitcoin/";
EXPLORER_ENDPOINT_TX[CURRENCY_ID_ETH] = "https://etherscan.io/tx/";

const EXPLORER_ENDPOINT_ADDRESS = {};
EXPLORER_ENDPOINT_ADDRESS[CURRENCY_ID_TMH] = "https://mhscan.com/?page=address&id=";
EXPLORER_ENDPOINT_ADDRESS[CURRENCY_ID_MHC] = "https://venus.mhscan.com/?page=address&id=";
EXPLORER_ENDPOINT_ADDRESS[CURRENCY_ID_BTC] = "https://live.blockcypher.com/btc/address/";
EXPLORER_ENDPOINT_ADDRESS[CURRENCY_ID_ETH] = "https://etherscan.io/address/";

const NETWORK_ONLINE = 1;
const NETWORK_OFFLINE = 0;

// default settings
const DEFAULT_LANG = "en";
const DEFAULT_BASE_CURRENCY = CURRENCY_ID_USD;
const DEFAULT_BASE_PERIOD = "day";
const DEFAULT_WALLETS_SHOW = 1;
const DEFAULT_RATE_PERIOD = 10 * 60 * 1000;

const DEFAULT_VIEW = "CurrenciesView";

const DEFAULT_USER_EMAIL = "_unregistered";

// ui animations
const UI_ALERTVIEW_TIME = 0.2; // seconds
const UI_ALERTVIEW_TIME_R = 0.1; // seconds
const UI_ALERTSLIDEVIEW_TIME = 0.3; // seconds
const UI_ALERTSLIDEVIEW_TIME_R = 0.2; // seconds
const UI_ALERTSLIDEVIEW_THRESHOLD = 0.1; // percent
const UI_PUSHVIEW_TIME = 0.3; // seconds
const UI_PUSHVIEW_TIME_R = 0.25; // seconds
const UI_MODALVIEW_TIME = 0.2; // seconds
const UI_MODALVIEW_TIME_R = 0.2; // seconds
const UI_PASSCODE_DELAY = 0.1; // seconds
const UI_PASSCODE_CHECKID_DELAY = 0.75; // seconds

const UI_PULLTOREFRESH_TOP = 279; // px
const UI_PULLTOREFRESH_TOP_THRESHOLD = 70; // px
const UI_PULLTOREFRESH_BOTTOM_THRESHOLD = 70; // px

const UI_ERROR_NOTIFICATION_DEFAULT_TIMEOUT = 1.5; // seconds
const UI_ERROR_NOTIFICATION_LONG_TIMEOUT = 3; // seconds
const UI_ERROR_NOTIFICATION_NO_TIMEOUT = -1;

const UI_INTERACTION_TIMEOUT = 200; // ms

// ui
const UI_FORM_INPUT_ERROR_CLASS = "form-control--error";

// settings
const WALLETCOLLECTION_RELOAD_TIME = 60; // seconds
const CHAIN_FETCH_RETRY_TIMEOUT = 3; // seconds

const WALLETS_SHOW_ALL = 1;
const WALLETS_SHOW_NATIVE = 2;

// MetaHash hash types
const HASH_TYPE_UNDEFINED = 0;
const HASH_TYPE_METAHASH_ADDRESS = 1;
const METAHASH_HASH_TYPE_TRANSACTION = 2;
const METAHASH_HASH_TYPE_KEY_PUBLIC = 3;
const HASH_TYPE_METAHASH_KEY_PRIVATE_OPEN = 4;
const HASH_TYPE_METAHASH_KEY_PRIVATE_PEM_ENC = 5;
const HASH_TYPE_METAHASH_KEY_PRIVATE_PEM_OPEN = 6;
const METAHASH_HASH_TYPE_METAPAY = 7;
const HASH_TYPE_ETH_KEYV3 = 8;
const HASH_TYPE_ETH_ADDRESS = 9;
const HASH_TYPE_BTC_KEY_PRIVATE_RAW = 10;
const HASH_TYPE_BTC_ADDRESS = 11;
const HASH_TYPE_BTC_KEY_METAGATE = 12;

const METAHASH_WALLET_SECP256K1 = "secp256k1";
const METAHASH_WALLET_SECP256R1 = "secp256r1";

// MetaHash system addresses
const ADDRESS_FORGING = "0x666174686572206f662077616c6c65747320666f7267696e67";

const TRANSACTIONS_PER_FETCH = 20;

const PROXYNODE_HARDCAP = 1e13;
const PROXYNODE_HARDCAP_SOFT = 1e12;
const PROXYNODE_BALANCE_START = 1e11;
const BALANCE_DELEGATION_MIN = 1;// 512e6; // @info test

const PAYMENT_METAPAY = 1;
const PAYMENT_DELEGATE = 2;
const PAYMENT_UNDELEGATE = 3;

const WALLET_UPDATE_INTERVAL = {};
WALLET_UPDATE_INTERVAL[CURRENCY_ID_TMH] = 5000;
WALLET_UPDATE_INTERVAL[CURRENCY_ID_BTC] = 50000;
WALLET_UPDATE_INTERVAL[CURRENCY_ID_ETH] = 50000;
WALLET_UPDATE_INTERVAL[CURRENCY_ID_MHC] = 5000;
WALLET_UPDATE_INTERVAL[CURRENCY_ID_USD] = 50000;

const BITCOIN_KEYTYPE = "legacy";
const BITCOIN_TESTNET = false;