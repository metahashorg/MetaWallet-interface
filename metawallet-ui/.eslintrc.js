module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "extends": "eslint:recommended",
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    "rules": {
        "no-console": "off",
        "no-unused-vars": "off",
        "no-undef": "off",
        "quotes": ["error", "double"],
        "no-inner-declarations": "off",
        "semi": ["error", "always"],
        "space-before-function-paren": "error",
        "no-case-declarations": "off",
    }
};