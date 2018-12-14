import React from 'react';
import { Modal,Spin,Icon,Input,message } from 'antd';
// import { createAccount } from '../../utils/api';
// import { pushStorage } from '../../utils/storage';
// import pkutils from '../../utils/keyMnemonic';
import web3 from '../../utils/web3';
import{formatAmountTo,formatterFrom0x,formatAmount} from '../../utils/0xExchange';
import {getPrivateKey} from '../../utils/api';
import {getStorage} from '../../utils/storage';
import { injectIntl,FormattedMessage } from 'react-intl';

import './index.css';
// const keythereum = require("keythereum");

class AccountTransfer extends React.Component {
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
            web3.appchain.sendSignedTransaction(signData).then((result)=>{
                web3.listeners.listenToTransactionReceipt(result.hash).then((data)=>{
                    if(data.errorMessage && data.errorMessage !== ''){
                        that.setState({loading:false}); 
                        message.error(data.errorMessage); 
                    }else{
                        that.props.handleClose();
                        message.success("TRANSFER SUCCESS!"); 
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
            web3.appchain.getTransactionCount(this.props.from,function(err,count){
                let nonce = web3.utils.toHex(count);
                let value = web3.utils.toBN(formatAmountTo(that.props.amount)).toString(16);
                
                web3.appchain.getMetaData().then((data)=>{
                    console.log(data);
                    that.getKey().then((key)=>{
                        let transferData = {
                            // from:that.props.from,
                            privateKey:"0x"+key,
                            value:value,
                            to:that.props.to,
                            quota:that.props.gas*that.props.gasPrice,
                            // gasPrice:that.state.gasPrice,
                            nonce:nonce,
                            data:that.props.sendData,
                            chainId: Number(data.chainIdV1),
                            version: data.version,
                            validUntilBlock: that.state.blockNumber+88
                        }
                        console.log(transferData);
                        let signData = web3.appchain.signer(transferData);
                        resolve(signData);
                        
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
        
        const container = (
            <div className="account-confirm">
                <div className="account-transfer-head">
                    <div className="transfer-head-left">
                        <p className="transfer-head-lefttips"><FormattedMessage id="transferFrom" /></p>
                        <p className="transfer-head-leftaddress">{this.props.from}</p>
                    </div>
                    <p className="transfer-head-icon">
                        <Icon className="transfer-head-icon-pc" type="swap-right" />
                        <Icon className="transfer-head-icon-mb" type="arrow-down" />
                    </p>
                    <div className="transfer-head-right">
                        <p className="transfer-head-righttips"><FormattedMessage id="transferTo" /></p>
                        <p className="transfer-head-rightaddress">{this.props.to}</p>
                    </div>
                </div>
                <div className="account-transfer-cont">
                    <div className="transfer-cont-item">
                        <p className="transfer-cont-left"><FormattedMessage id="amount" /></p>
                        <p className="transfer-cont-right">{this.props.amount} SEE</p>
                    </div>
                    <div className="transfer-cont-item">
                        <p className="transfer-cont-left"><FormattedMessage id="gasFee" /></p>
                        <p className="transfer-cont-gas">
                            <span>{formatAmount(this.props.gas*this.props.gasPrice)} SEE</span>
                            <span>≈ SEG limit({this.props.gas})*SEG Price ({this.props.gasPrice} SEG)</span>
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
                title={this.props.intl.formatMessage({id:"send-transaction"})}
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

export default injectIntl(AccountTransfer);