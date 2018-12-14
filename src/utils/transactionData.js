// import React from 'react';
import web3 from './web3';
import {formatterFrom0x} from './0xExchange';
import {getStorage} from './storage';
import {getPrivateKey} from './api';

export function getTransactionData (from,password) {
    return new Promise((resolve,reject)=>{
        getSignTransactionData(from,password).then((data)=>{
            resolve(data);
        }).catch((err)=>{
            reject(err.message);
        })
    })
}

function getSignTransactionData(from,password){
    return new Promise((resolve, reject) => {
        let nonce = web3.utils.randomHex(6);
        web3.appchain.getBlockNumber().then((block)=>{
            web3.appchain.getMetaData().then((data)=>{
                getKey(from,password).then((key)=>{
                    let transferData = {
                        from:from,
                        privateKey:"0x"+key,
                        quota:10000000,
                        nonce:nonce,
                        chainId: Number(data.chainIdV1),
                        version: data.version,
                        validUntilBlock: block+88
                    }
                    console.log(transferData);
                    resolve(transferData);
                    
                })
            });
        })
        
    }); 
}

function getKeyStore(address){
    let formAddress = formatterFrom0x(address);
    let keyStores = getStorage("keyStore");
    keyStores = JSON.parse(keyStores);
    for(let i=0;i<keyStores.length;i++){
        if(keyStores[i].address === formAddress){
            return keyStores[i];
        }else{
            continue;
        }
    }
    return {};
}

function getKey(from,password){
    return new Promise((resolve, reject) => {
        let keyStore = getKeyStore(from);
        let data = {
            password:password,
            keyStore:keyStore,
        }
        getPrivateKey(data).then((key)=>{
            resolve(key);
        })
    })
}