import web3 from './web3';
var BigNumber = require('bignumber.js');
var Ether     = new BigNumber(10e+17);

export function formatterTo0x(address) {
    return '0x'+address;   
}
export function formatterFrom0x(address) {
    return address.substring(2);  
}
export function formatAmount(amount) {
    if(amount && amount !== ''){
        let ethAmount;
        if(typeof(amount) == "number"){
            amount = amount.toString();
            ethAmount = web3.utils.fromWei(amount,'ether');
        }else{
            ethAmount = web3.utils.fromWei(amount,'ether');
        }
        return  ethAmount
    }
    
}
export function formatAmountTo(amount) {
    if(amount === 0 || amount === '0'){
        return 0;
    }
    if(amount && amount !== ''){
        let ethAmount;
        
        if(typeof(amount) == "number"){
            amount = amount.toString();
            ethAmount = web3.utils.toWei(amount,'ether');
        }else{
            ethAmount = web3.utils.toWei(amount,'ether');
        }
        return  ethAmount
    }
    
}
export function bigNumber(amount) {
    let byte16 = '';
    for(let i=0;i<amount.length;i++){
        let data =  amount[i].toString(16);
        if(data.length === 1){
            data = "0"+data;
        }
        byte16 += data;
    }
    let data = Number(web3.utils.hexToNumberString(byte16));
    var ret = new BigNumber(data.toString());

    return ret.dividedBy(Ether).toFixed(3) + " SEE";
}

export function BufferString(amount) {
    let byte16 = '';
    for(let i=0;i<amount.length;i++){
        let data =  amount[i].toString(16);
        if(data.length === 1){
            data = "0"+data;
        }
        byte16 += data;
    }

    return byte16;
}