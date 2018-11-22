import web3 from './web3';
// import async from 'async';
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

export function getLatestTransactionData(count,limit,address){
    return new Promise((resolve, reject) => {
        // let txs = [];
        // async.waterfall([
        //     function(callback){
                // let accountData = [];
                
                web3.appchain.getBlockNumber().then((number)=>{
                    console.log(number);
                    console.log(address);
                    console.log(number-count+1);

                    web3.appchain.getLogs({
                        address: address,
                        fromBlock:"latest",
                        toBlock:"latest"
                    }).then((res)=>{
                        console.log(res);
                        resolve(res);
                    })
                    // for(let i=0;i<blockCount;i++){
                    //     web3.appchain.getBlock(data-i).then((block)=>{
                    //         console.log(block);
                    //         let transactions = block.body.transactions;
                    //         let txInfo;
                    //         async.eachSeries(transactions,function(item,eachCallback){
                    //             web3.appchain.getTransaction(item).then((transactionData)=>{
                    //                 txInfo = web3.appchain.unsigner(transactionData.content);
                    //                 txInfo.hash = item;
                    //                 txInfo.key = item;
                    //                 if(txs.length<limit){
                    //                     txs.push(txInfo);
                    //                 }
                    //                 eachCallback();
                    //             })
                    //         })
                    //     })
                    // }
                    // callback(null,txs);
            //     })
            // },function(txs,callsecondback){
            //     callsecondback(null,txs)
            // }],function(err,result){
            // if(!err){
            //     resolve(result);
            // }
        })
    })
}