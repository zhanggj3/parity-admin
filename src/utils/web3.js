import Nervos from '@nervos/web3';

let net = localStorage.getItem("net");
let nervos;
if(net && net !== ''){
    if(net === "Mainnet"){
        
        // nervos = Nervos('http://47.96.116.138:1340');
        nervos = Nervos('http://47.96.116.138:1340');
    }else if(net === "Testnet"){
        // nervos = Nervos('http://127.0.0.1:8540');
        nervos = Nervos('http://192.168.1.200:1338');
    }else{
        nervos = Nervos(net);
    }
}else{
    // nervos = Nervos('http://127.0.0.1:8540');
    nervos = Nervos('http://47.96.116.138:1340');
}
// const nervos = Nervos('http://47.96.116.138:1340');
export default nervos;