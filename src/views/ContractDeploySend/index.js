import React from 'react';
import { Modal,Spin,Icon,Input,message } from 'antd';
// import { createAccount } from '../../utils/api';
import { replaceStorage } from '../../utils/storage';
// import pkutils from '../../utils/keyMnemonic';
import web3 from '../../utils/web3';
import{formatAmountTo,formatterFrom0x} from '../../utils/0xExchange';
import {getPrivateKey} from '../../utils/api';
import {getStorage} from '../../utils/storage';

import './index.css';
// const keythereum = require("keythereum");

export default class Addaccount extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading:false,
            password:'',
            timerID:'',
            blockNumber:''
        }
    }

    componentWillMount() {
        this.getBlockNumber();
    }

    getBlockNumber(){
        let that = this;
        web3.appchain.getBlockNumber().then((block)=>{
            that.setState({blockNumber:block})
        });
    }

    handleOk(e) {
        this.setState({loading:true});
        this.setState({timerID:setInterval(() => this.sendResult(),1000)});
    }

    sendResult(){
        let that = this;
        clearInterval(this.state.timerID);
        that.getSignTransactionData().then((signData)=>{
            console.log(signData);
            web3.appchain.sendSignedTransaction(signData).then((result)=>{
                // console.log(result.hash);
                web3.listeners.listenToTransactionReceipt(result.hash).then((data)=>{
                    console.log(data);
                    if(data.errorMessage && data.errorMessage !== ''){
                        that.setState({loading:false}); 
                        message.error(data.errorMessage); 
                    }else{
                        that.props.handleClose();
                        message.success("CONTRACT DEPLOY SUCCESS!"); 
                        that.setState({loading:false}); 
                    }
                });       
            }).catch((err)=>{
                that.setState({loading:false});    
                message.error(err.message);
            })
        })
        
    }

    getSignTransactionData(){
        return new Promise((resolve, reject) => {
            let that = this;
            let jsonInterface = JSON.parse(this.props.abi);
            let contract = new web3.appchain.Contract(jsonInterface,this.props.from);
            let argument = that.props.argument;
            console.log(argument);
            let params;
            if(argument) {
                if(argument.length > 0){
                    params = [];
                    for(var i=0;i<argument.length;i++){
                        let obj = argument[i];
                        if(obj.params && obj.params !== '') {
                            params.push(web3.utils.toHex(obj.params));
                        }else{
                            message.warning(obj.name+" the value is null!");
                            return;
                        }
                    }
                    params = [params];
                }else{
                    params = [];
                }
                
            }
            web3.appchain.getTransactionCount(this.props.from,function(err,count){
                let nonce = web3.utils.toHex(count);
                console.log(nonce);
                let value = formatAmountTo(that.props.amount);
                console.log(value);
                let bytecode = contract.deploy({data: that.props.code,arguments: params}).encodeABI();
                console.log(bytecode);
                web3.appchain.getMetaData().then((data)=>{
                    console.log(data);
                    that.getKey().then((key)=>{
                        console.log(key);
                        let transferData = {
                            // from:that.state.contractAddress,
                            privateKey:"0x"+key,
                            value:web3.utils.toHex(that.props.amount),
                            quota:that.props.gas*that.props.gasPrice,
                            // gasPrice:that.state.gasPrice,
                            nonce:nonce,
                            chainId: data.chainId,
                            version: 0,
                            validUntilBlock: that.state.blockNumber+88,
                        }
                        console.log(transferData);

                        web3.appchain.deploy(bytecode, transferData).then((result)=>{
                            if(result.errorMessage && data.errorMessage !== ''){
                                that.setState({loading:false}); 
                                message.error(result.errorMessage); 
                            }else{
                                if(result.contractAddress && result.contractAddress !== '') {
                                    let newContract = new web3.appchain.Contract(jsonInterface,result.contractAddress);
                                    console.log(newContract);
                                    newContract.name = that.props.name;
                                    replaceStorage("contractStore",newContract,"_address");
                                    that.props.handleClose();
                                }else{
                                    that.setState({loading:false}); 
                                    message.error("out of gas or unexpected token!");
                                }
                            }
                        })
                        
                    })
                });
            })
            
        }); 
    }

    getKeyStore(address){
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

    getKey(){
        let that = this;
        return new Promise((resolve, reject) => {
            let keyStore = that.getKeyStore(that.props.from);
            let data = {
                password:that.state.password,
                keyStore:keyStore,
            }
            getPrivateKey(data).then((key)=>{
                resolve(key);
            })
        })
    }

    componentWillUnmount() {
        clearInterval(this.state.timerID);
    }

    handleCancel(e) {
        this.props.handleClose();
    }

    handleSendPassword(event){
        this.setState({password:event.target.value});
    }

    render() {
        const { loading,password } = this.state;
        
        const transferTo = (this.props.to && this.props.to !== '') ? (
            <span>{this.props.to}</span>
        ):<span style={{display:"block",textAlign:"center"}}>null</span>

        const container = (
            <div className="account-confirm">
                <div className="account-transfer-head">
                    <div className="transfer-head-left">
                        <p className="transfer-head-lefttips">TRANSFER FROM</p>
                        <p className="transfer-head-leftaddress">{this.props.from}</p>
                    </div>
                    <p className="transfer-head-icon">
                        <Icon className="transfer-head-icon-pc" type="swap-right" />
                        <Icon className="transfer-head-icon-mb" type="arrow-down" />
                    </p>
                    <div className="transfer-head-right">
                        <p className="transfer-head-righttips">TRANSFER TO</p>
                        <p className="transfer-head-rightaddress">{transferTo}</p>
                    </div>
                </div>
                <div className="account-transfer-cont">
                    <div className="transfer-cont-item">
                        <p className="transfer-cont-left">Amount</p>
                        <p className="transfer-cont-right">{this.props.amount} SEE</p>
                    </div>
                    <div className="transfer-cont-item">
                        <p className="transfer-cont-left">Gas Fee</p>
                        <p className="transfer-cont-gas">
                            <span>Gas {this.props.gas*this.props.gasPrice} SEE</span>
                            <span>≈Gas({this.props.gas})*Gas Price ({this.props.gasPrice} SEG)</span>
                        </p>
                    </div>
                </div>
                <div className="account-transfer-bottom">
                    <Input type="password" placeholder="Enter password to cofirm the transaction" onChange={this.handleSendPassword.bind(this)} value={password} />
                </div>
            </div>
        )
        return (
            <Modal
                title="SEND TRANSACTION"
                visible={this.props.state}
                onOk={this.handleOk.bind(this)}
                onCancel={this.handleCancel.bind(this)}
                maskClosable={!loading}
                cancelButtonProps={{disabled:loading}}
                okButtonProps={{disabled:loading}}
            >
                <Spin spinning={loading}>{container}</Spin>
            </Modal>
        );
    };
}