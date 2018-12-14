const bip39 = require('bip39');
const hdkey = require('ethereumjs-wallet/hdkey');
const keythereum = require("keythereum");

exports.debug = false;

function getMnemonic() {
    const mnemonic = bip39.generateMnemonic();
	return mnemonic;
}

exports.getMnemonic = getMnemonic;

function checkMnemonic(params) {
	return bip39.validateMnemonic(params);
}

exports.checkMnemonic = checkMnemonic;


function getPrivateKeyFromMnemonic(mnemonic) {
	const hdwallet = hdkey.fromMasterSeed(bip39.mnemonicToSeed(mnemonic));
	const wallet_hdpath = "m/44'/60'/0'/0/";

	const wallet = hdwallet.derivePath(wallet_hdpath + '0').getWallet();
	const privateKey = wallet._privKey.toString('hex');
	const account = '0x' + wallet.getAddress().toString('hex').toUpperCase();

	if (exports.debug)
		console.log({
			mnemonic: mnemonic,
			privateKey: privateKey,
			account: account
		});

	return privateKey;
}

exports.getPrivateKeyFromMnemonic = getPrivateKeyFromMnemonic;

function getPrivateKeyFromKeystore(privateKey) {

	if (exports.debug)
		console.log({
			privateKey: privateKey
		});

	return privateKey;
}

exports.getPrivateKeyFromKeystore = getPrivateKeyFromKeystore;

function getKeystoreFromPrivateKey(privateKey, password) {
	const params = { keyBytes: 32, ivBytes: 16 };
	const dk = keythereum.create(params);

	const options = {
		kdf: 'pbkdf2',
		cipher: 'aes-128-ctr',
		kdfparams: {
			c: 262144,
			dklen: 32,
			prf: 'hmac-sha256'
		}
	};

	// const keystore = keythereum.dump(password, dk.privateKey, dk.salt, dk.iv, options);
	const keystore = keythereum.dump(password, privateKey, dk.salt, dk.iv, options);

	if (exports.debug) {
		console.log({
			privateKey: privateKey,
			password: password,
			keystore: keystore
		});
	}

	return keystore;
}

exports.getKeystoreFromPrivateKey = getKeystoreFromPrivateKey;
