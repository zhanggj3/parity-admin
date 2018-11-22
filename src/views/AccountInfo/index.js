import React, { Component } from 'react';
import { Table,message,Input,Modal } from 'antd';
import web3 from '../../utils/web3';
import {getLatestTransactionData} from '../../utils/api';
import ExportAccount from '../AccountExport';
import { createHashHistory } from 'history';
import {replaceNameStorage,deleteStorage,getStorage,deleteItem} from '../../utils/storage';
import queryString from  'query-string' 
import {columns} from '../../data/latestTransactions';
import {formatAmount,formatterFrom0x} from '../../utils/0xExchange';
import Qrcodecomp from '../../component/Qrcode';
import './index.css';
const confirm = Modal.confirm;

class Side extends Component {
    constructor() {
        super();
        this.state = {
            block:5,
            balance:'',
            transactions:[],
            loading:true,
            limit:50,
            currentId:0,
            tab:[
                {
                    label:"Latest Transactions",
                    id:0,
                    blockNum:5,
                    limit:50
                },
                {
                    label:"More Transactions",
                    id:1,
                    blockNum:20,
                    limit:500
                }
            ],
            exportState:false,
            editIcon:require("../../image/edit.png"),
            userIcon:require("../../image/insee-icon.png"),
            qrcodeIcon:require("../../image/account-qr.png"),
            editState:false,
            accountName:'',
            codeState:false
        }
    }

    componentDidMount() {
        let block = this.state.block;
        let limit = this.state.limit;
        let address = this.props.address;
        this.accountInfo(address);
        this.getLatestData(block,limit,address);
        this.setState({accountName:this.props.name});
    }

    getBalance(account){
        return new Promise((resolve, reject) => {
            web3.appchain.getBalance(account,function(err,balance){
                if(err){
                    reject(err.message);
                    return;
                }
                resolve(balance);
            })
        }); 
    }

    accountInfo(address){
        this.getBalance(address).then((data) =>{
            this.setState({balance:data});
        }).catch((err)=>{
            message.error(err);
        })
    }

    getLatestData(block,limit,address){
        this.setState({transactions:[]})
        getLatestTransactionData(block,limit,address).then((data)=>{
            console.log(data);
            this.setState({transactions:data},()=>{
                this.setState({loading:false})
            });
        })
    }

    onChildExportChanged(){
        this.setState({exportState:false});
    }

    tabCheck(item){
        this.setState({currentId:item.id,block:item.blockNum,loading:true});
        this.getLatestData(item.blockNum,item.limit,this.props.address);
    }

    exportDialog(){
        this.setState({exportState:true});
    }

    transfer(){
        createHashHistory().push({pathname : '/send' ,search: queryString.stringify({
            to: this.props.address
        })});
    }

    send(){
        createHashHistory().push({pathname : '/send' ,search: queryString.stringify({
            from: this.props.address
        })});
    }

    editAccount(){
        this.setState({editState:true,accountName:this.props.name});
    }

    handleName(event){
        console.log(event.target.value);
        this.setState({accountName:event.target.value});
    }

    handleEdit(e){
        console.log(e);
        replaceNameStorage("keyStore",this.state.accountName,formatterFrom0x(this.props.address));
        this.setState({editState:false});
    }

    deleteAccount(){
        let that = this;
        let defaultAccount = getStorage("defaultAccount");
        if(defaultAccount && defaultAccount !== ''){
            defaultAccount = JSON.parse(defaultAccount);
            console.log(defaultAccount.address);
            console.log(that.props.address)
            if(defaultAccount.address === that.props.address){
                confirm({
                    title: 'Do you Want to delete the default Account "' +that.props.name+ '"?',
                    content:that.props.address,
                    onOk() {
                        deleteStorage("keyStore",formatterFrom0x(that.props.address));
                        deleteItem("defaultAccount");
                        window.location.reload();
                    }
                });
            }else{
                confirm({
                    title: 'Do you Want to delete the Account "' +that.props.name+ '"?',
                    content:that.props.address,
                    onOk() {
                        deleteStorage("keyStore",formatterFrom0x(that.props.address));
                        that.props.callback();
                    }
                });
            }
            
        }else{
            confirm({
                title: 'Do you Want to delete the Account "' +that.props.name+ '"?',
                content:that.props.address,
                onOk() {
                    deleteStorage("keyStore",formatterFrom0x(that.props.address));
                    that.props.callback();
                }
            });
        }
        
        
    }

    closeCode(newState) {
        this.setState({ codeState: newState })
    }

    showCode(){
        this.setState({codeState:true});
    }

    render() {
        const {balance,transactions,loading,tab,currentId,exportState,editIcon,userIcon,qrcodeIcon,editState,accountName,codeState} = this.state;

        const tabDialog = tab && tab.length>0 ? tab.map((item)=>(
            <p key={item.id} onClick={this.tabCheck.bind(this,item)} className={item.id === currentId?"transaction-active":null}>{item.label}</p>
        )):''

        let exportDialog = (exportState === true) ? 
        (<ExportAccount 
            addState={exportState} 
            address={this.props.address}
            callbackParent={this.onChildExportChanged.bind(this)}>
        </ExportAccount>):(<span></span>);

        let codeShow = codeState === true ? (
            <div>
                <Qrcodecomp state={codeState} address={this.props.address} callback={this.closeCode.bind(this)}></Qrcodecomp>
            </div>
        ) : ''

        return (
            <div className="account-info">
                <div className="account-info-left"> 
                    <div className="mobile-left">
                        <img className="account-info-code" onClick={this.showCode.bind(this)} src={qrcodeIcon} alt=""/>
                        <img className="account-info-img" src={userIcon} alt=""/>
                        <p className="account-info-name">
                            <span style={{display: (editState===false) ? "inline-block" : "none"}}>{accountName}</span>
                            <Input type="text" value={accountName} onBlur={this.handleEdit.bind(this)} onChange={this.handleName.bind(this)} style={{display: (editState===true) ? "inline-block" : "none"}} />
                            <img style={{display: (editState===false) ? "inline-block" : "none",width: "12px",marginLeft: "5px",cursor:'pointer'}} onClick={this.editAccount.bind(this)} src={editIcon} alt=""/>
                        </p>
                    </div>
                    <div className="mobile-right">
                        <p className="account-info-address">{this.props.address}</p>
                        <p onClick={this.exportDialog.bind(this)} className="account-info-export">Export private key</p>
                        <p onClick={this.exportDialog.bind(this)} className="account-info-keystore">Export KeyStore</p>
                        <p onClick={this.deleteAccount.bind(this)} className="account-info-delete">Delete</p>
                    </div>
                </div>
                <div className="account-info-right">
                    <div className="accountinfo-right-head">
                        <p className="account-img"><img style={{width:"100%"}} src={userIcon} alt=""/></p>
                        <p className="account-balance">{formatAmount(balance)} SEE</p>
                        <div className="account-operate">
                            <p onClick={this.transfer.bind(this)} className="account-transfer">Transafer</p>
                            <p onClick={this.send.bind(this)} className="account-send">SEND</p>
                        </div>
                    </div>
                    <div className="accountinfo-right-cont">
                        <div className="accountinfo-right-transaction">
                            {tabDialog}
                        </div>
                    </div>
                    <div className="accountinfo-right-table">
                        <Table 
                            loading={loading} 
                            className="transaction-table" 
                            columns={columns} 
                            dataSource={transactions} 
                            pagination={{pageSize:10}}
                            />
                    </div>
                </div>
                {exportDialog}
                {codeShow}
            </div>
        );
    }
}

export default Side;