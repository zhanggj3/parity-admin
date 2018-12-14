import web3 from './web3';
import async from 'async';
const keythereum = require("keythereum");
// const sign = require('ethjs-signer').sign;

export function createAccount (pwd,privateKey) {
    return new Promise((resolve, reject) => {
        let params = { keyBytes: 32, ivBytes: 16 };
        let privateBuf = Buffer.from(privateKey, 'hex');
        let dk = keythereum.create(params);
        let options = {
            kdf: "scrypt",
            cipher: "aes-128-ctr",
            kdfparams: {
                n:262144,
                r : 8,
                p : 1,
                dklen: 32
            }
        };
        let keyObject = keythereum.dump(pwd, privateBuf, dk.salt, dk.iv, options);
        resolve(keyObject);
    });   
}
export function createAccountByPrivate (pwd,privateKey) {
    return new Promise((resolve, reject) => {
        let params = { keyBytes: 32, ivBytes: 16 };
        let dk = keythereum.create(params);
        let options = {
            kdf: "scrypt",
            cipher: "aes-128-ctr",
            kdfparams: {
                n:262144,
                r : 8,
                p : 1,
                dklen: 32
            }
        };
        let keyObject = keythereum.dump(pwd, privateKey, dk.salt, dk.iv, options);
        resolve(keyObject);
    });   
}

export function getPrivateKey (data) {
    return new Promise((resolve, reject) => {
        let privateKey = keythereum.recover(data.password, data.keyStore).toString('hex');
        resolve(privateKey);
    });   
}

export function getLatestTransactionData(count){
    return new Promise((resolve, reject) => {
        async.waterfall([
            function(callback){
                let txs = [];
                web3.appchain.getBlockNumber().then((data)=>{
                    let blockCount = count;
                    if(data - blockCount < 0){
                        blockCount = data + 1;
                    }
                    let list = [];
                    for(let i=0;i<blockCount;i++){
                        list.push(i);
                    }
                    async.eachSeries(list,function(j,eachSecondCallback){
                        web3.appchain.getBlock(data-j).then((block)=>{
                            let transactions = block.body.transactions;
                            let txInfo;
                            async.eachSeries(transactions,function(item,eachCallback){
                                web3.appchain.getTransaction(item).then((transactionData)=>{
                                    txInfo = web3.appchain.unsigner(transactionData.content);
                                    txInfo.hash = item;
                                    txInfo.key = item;
                                    txs.push(txInfo);
                                    eachCallback();
                                })
                            },function(err){
                                eachSecondCallback();
                            })
                        })
                    },function(err){
                        callback(err,txs);
                    })
                })
            }],function(err,result){
            if(!err){
                resolve(result);
            }
        })
    })
}