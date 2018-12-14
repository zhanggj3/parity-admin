import React, { Component } from 'react';
import web3 from '../../utils/web3';
import {Spin,message} from 'antd';
import AccountAdd from '../AccountAdd';
import PrivateAdd from '../AccountImportByPrivate';
import {getStorage} from '../../utils/storage';
import async from 'async';
import {formatterTo0x} from '../../utils/0xExchange';
import { injectIntl,FormattedMessage } from 'react-intl';
import blockies from '../../utils/blockies';
import './index.css';

class AccountList extends Component {
    constructor() {
        super();
        this.state = {
            accountAddState:false,
            accountList:[],
            loading:true,
            privateImportState:false,
            defaultAddress:'',
            userIcon:require("../../image/insee-icon.png"),
            currentIcon:require("../../image/current-user.png")
        }
    }

    componentWillMount() {
        this.getAccountData();
        let defaultAccount = getStorage("defaultAccount");
        if(defaultAccount && defaultAccount !== ''){
            defaultAccount = JSON.parse(defaultAccount);
            this.setState({defaultAddress:defaultAccount.address});
        }
    }

    goAccountInfo(address){
        this.props.goAccountInfo(address);
    }

    createAccount(){
        this.setState({accountAddState:true});
    }

    importAccount(){
        this.setState({privateImportState:true});
    }

    onChildChanged(){
        this.setState({accountAddState:false,privateImportState:false});
    }

    getAccounts(){
        let that = this;
        return new Promise((resolve, reject) => {
            let accounts = getStorage("keyStore");
            if(accounts && accounts !== ''){
                accounts = JSON.parse(accounts);
            }else{
                accounts = [];
            }
            that.setState({accounts:accounts});
            resolve(accounts)
        });   
    }

    getAccountData(){
        let that = this;
        async.waterfall([
            function(callback){
                let accountData = [];
                that.getAccounts().then((accounts)=>{
                    async.eachSeries(accounts,function(account,eachCallback){
                        that.getBalance(formatterTo0x(account.address)).then((data) =>{
                            let source = blockies.create({ seed:formatterTo0x(account.address) ,size: 8,scale: 16}).toDataURL();
                            account.img = source;
                            account.balance = data;
                            account.address = formatterTo0x(account.address);
                            accountData.push(account);
                            eachCallback();
                        })
                    },function(err){
                        callback(err,accountData);
                    })
                })
            }],function(err,accountData){
            if(!err){
                that.setState({accountList:accountData,loading:false});
            }else{
                message.error(err);
            }
        })
    }

    getBalance(account){
        return new Promise((resolve, reject) => {
            web3.appchain.getBalance(account,function(err,balance){
                if(!err){
                    resolve(balance);
                }else{
                    message.error(err.message);
                    return;
                }
            })
        }); 
    }

    render() {
        const {accountAddState,accountList,loading,privateImportState,defaultAddress,currentIcon} = this.state;

        let accountDialog = accountAddState === true?(
            <AccountAdd 
                state={accountAddState}
                callbackParent={this.onChildChanged.bind(this)} 
                freshData={this.getAccountData.bind(this)}>
            </AccountAdd>
        ):''

        let accountImportDialog = privateImportState === true?(
            <PrivateAdd 
                state={privateImportState}
                callbackParent={this.onChildChanged.bind(this)} 
                freshData={this.getAccountData.bind(this)}>
            </PrivateAdd>
        ):''

        let noData;
        if(loading && loading === true){
            noData = '';
        }else{
            noData = 'There are currently no accounts to display';
        }
        let accountArray = accountList && accountList.length>0? accountList.map((accountItem, index) => (
            <li key={index} onClick={this.goAccountInfo.bind(this,accountItem)} className={accountItem.address === defaultAddress?"active":null}>
                {/* <Icon className="account-list-img" type="user" theme="outlined" /> */}
                <img className="account-list-img" src={accountItem.img} alt=""/>
                <div className="account-list-text">
                    <p className="account-list-name">{accountItem.name}</p>
                    <p>{accountItem.address}</p>
                    <img className={accountItem.address === defaultAddress?"currentImg":"current-none"} src={currentIcon} alt=""/>
                    {/* <p>{formatAmount(accountItem.balance)} SEE</p> */}
                </div>
            </li>
        )): (<p>{noData}</p>);

        return (
            <div className="account-list">
                <div className="account-main-head">
                    <p onClick={this.createAccount.bind(this)}><FormattedMessage id="account-create" /></p>
                    <p onClick={this.importAccount.bind(this)}><FormattedMessage id="account-import"/></p>
                </div>
                <ul className="account-main-ul">
                    <Spin spinning={loading}>{accountArray}</Spin>
                </ul>
                {accountDialog}
                {accountImportDialog}
            </div>
        );
    }
}

export default injectIntl(AccountList);