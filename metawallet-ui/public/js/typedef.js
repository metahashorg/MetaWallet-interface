/**
 * @typedef {Object} xD
 * @property {function(string=):void} show
 * @property {function():void} hide
 * @property {function():void} isHidden
 * @property {function(string):HTMLElement|xD|null} qs
 * @property {function(string):Array<HTMLElement|xD>|null} qsa
 */

/**
 * @typedef {Object} ViewConfig
 * @property {App} app
 * @property {View} view - Parent view of SubView
 * @property {number} type
 * @property {string} selector
 * @property {string} dataSelector
 * @property {string} cssDisplayProp
 * @property {boolean} clone
 * @property {boolean} hideArrow
 * @property {HTMLElement} element
 * @property {Array<Task>} tasks
 */

/**
 * @typedef {Object} TaskConfig
 * @property {View} view
 * @property {number} interval
 * @property {Function} callback
 */

/**
 * @typedef {Object} TabConfig
 * @property {number} id
 * @property {Function} callback
 */

/**
 * @typedef {Object} MetaPayParams
 * @property {string} to
 * @property {number} value
 * @property {string} currency
 * @property {number} currencyId
 * @property {string} data
 * @property {string} description
 * @property {boolean} vendorKnown = false;
 * @property {string} vendorName
 * @property {boolean} valid
 */

/**
 * @typedef {Object} TransferParams
 * @property {string} to
 * @property {number} value
 * @property {string} data
 */

/**
 * @typedef {Object} Balance
 * @property {number} balance
 * @property {number} integer
 * @property {number} decimal
 * @property {string} localeString
 * @property {string} simpleString
 * @property {string} fullSimpleString
 */

/**
 * @typedef {Object} Transfer
 * @property {string} from
 * @property {string} to
 * @property {number} value
 * @property {string} data
 * @property {number} fee
 * @property {MetaHashAPI} api
 * @property {MetaHashWallet} apiWallet
 * @property {string} transaction
 * @property {Wallet} wallet
 * @property {number} status
 */

// Objects from Native App

/**
 * @typedef {Object} NativeResponse
 * @property {number} result
 * @property {*} data
 */

/**
 * @typedef {Object} NativeUser
 * @property {string} login
 * @property {string} email
 * @property {string} token
 * @property {string} tokenRefrech
 */

/**
 * @typedef {Object} NativeWallet
 * @property {number} currencyId
 * @property {string} currencyName
 * @property {string} address
 * @property {string} name
 * @property {string} privateKey
 * @property {boolean} privateKeyExists
 */

/**
 * @typedef {Object} NativeEnv
 * @property {boolean} touchId
 * @property {boolean} faceId
 * @property {string} appVersion
 * @property {string} deviceIdentifier
 */

// Objects from MetaGate API

/**
 * @typedef {Object} MetaGateWallet
 * @property {string} address
 * @property {string} currency
 * @property {string} currency_code
 * @property {string} hwid
 * @property {string} os
 * @property {string} ip
 * @property {string} use_last_ts_utc
 * @property {string} name
 */

// MetaHash

/**
 * @typedef {Object} MetaHash
 * @property {MetaHashWallet} Wallet
 * @property {MetaHashAPI} API
 */

/**
 * @typedef {Object} MetaHashTx
 */

/**
 * @typedef {Object} MetaHashTxParams
 * @property {string} to
 * @property {number} value
 * @property {number} fee
 * @property {number} nonce
 * @property {string} data
 */

/**
 * @typedef {Object|function(string):MetaHashWallet} MetaHashWallet
 * @property {string} privateKey
 * @property {string} publicKey
 * @property {string} address
 * @property {function(privateKey: string):MetaHashWallet} fromPrivateKey
 * @property {function(encryptedPEM: string, password: string):MetaHashWallet} fromEncryptedPEM
 * @property {function(password: string):string} toEncryptedPEM
 * @property {function(pem: string):MetaHashWallet} fromPEM
 * @property {function():string} toPEM
 * @property {function(MetaHashTxParams):MetaHashTx} createTx
 */

/**
 * @typedef {Object|function(string, string):MetaHashAPI} MetaHashAPI
 * @property {function(string):Promise<Object>} getNodes
 * @property {function({address: string}):Promise<MetaHashBalance>} fetchBalance
 * @property {function({address: string, beginTx: number, countTxs: number}):Promise<Array<MetaHashTransaction>>} fetchHistory
 * @property {function({address: string, beginTx: number, countTxs: number}):Promise<Object>} fetchRewards
 * @property {function({hash: string}):Promise<MetaHashTransaction>} getTx
 * @property {function({address: string}):Promise<Object>} getNonce
 * @property {function(MetaHashTx):Promise<Object>} sendTx
 * @property {function(string):Promise<Array<string>>} getProxyNodes
 * @property {function(string):Promise<Array<string>>} getTorNodes
 * @property {function(string):Promise<Object<{tor: Array<string>, proxy: Array<string>}>>} getNodes
 */

/**
 * @typedef {Object} MetaHashBalance
 * @property {string} address
 * @property {number} block_number
 * @property {number} countDelegatedOps
 * @property {number} countForgedOps
 * @property {number} count_received
 * @property {number} count_spent
 * @property {number} count_txs
 * @property {number} currentBlock
 * @property {number} delegate
 * @property {number} delegated
 * @property {number} forged
 * @property {string} hash
 * @property {number} received
 * @property {number} reserved
 * @property {number} spent
 * @property {number} undelegate
 * @property {number} undelegated
 */

/**
 * @typedef {Object} MetaHashTransaction
 * @property {string} from
 * @property {string} to
 * @property {number} value
 * @property {string} transaction
 * @property {string} data
 * @property {string} timestamp
 * @property {string} type
 * @property {number} blockNumber
 * @property {string} signature
 * @property {string} publickey
 * @property {number} fee
 * @property {number} realFee
 * @property {number} nonce
 * @property {number} intStatus
 * @property {string} status
 */

/**
 * @typedef {Object} MetaHashDelegation
 * @property {string} to
 * @property {number} value
 * @property {string} tx
 */

// Ethereum

/**
 * @typedef {Object} Ethereum
 * @property {EthereumWallet} Wallet
 * @property {EthereumAPI} API
 */

/**
 * @typedef {Object} EthereumTx
 */

/**
 * @typedef {Object} EthereumTxParams
 * @property {string} from
 * @property {string} to
 * @property {number} value
 * @property {number} fee
 * @property {number} gasPrice
 * @property {string} gasLimit
 * @property {number} nonce
 * @property {string} data
 */

/**
 * @typedef {Object|function(string):EthereumWallet} EthereumWallet
 * @property {string} privateKey
 * @property {string} publicKey
 * @property {string} address
 * @property {function(string):EthereumWallet} fromPrivateKey
 * @property {function(password: string):string} toV3JSON
 * @property {function(EthereumTxParams):EthereumTx} createTx
 */

/**
 * @typedef {Object|function(string):EthereumAPI} EthereumAPI
 * @property {function({address: string, contract: string}):Promise<Object>} getBalance
 * @property {function({address: string}):Promise<Object>} getNonce
 * @property {function(EthereumTx):Promise<Object>} sendTx
 * @property {function({hash: string}):Promise<Object>} getTx
 * @property {Object} web3
 */

// Bitcoin

/**
 * @typedef {Object} Bitcoin
 * @property {BitcoinWallet} Wallet
 * @property {BitcoinAPI} API
 */

/**
 * @typedef {Object} BitcoinTx
 */

/**
 * @typedef {Object|function(string):BitcoinWallet} BitcoinWallet
 * @property {string} privateKey
 * @property {string} publicKey
 * @property {string} address
 * @property {function(password: string):string} toBIP38
 */

/**
 * @typedef {Object|function(string):BitcoinAPI} BitcoinAPI
 * @property {function(wallet: BitcoinWallet, address: string, value: number, fee: number):Promise<*>} sendTx
 */