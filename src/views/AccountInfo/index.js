import React, { Component } from 'react';
import { Table,message,Input } from 'antd';
import web3 from '../../utils/web3';
import {getLatestTransactionData} from '../../utils/api';
import ExportAccount from '../AccountExport';
import ExportAccountPrivate from '../AccountExportPrivate';
import DeleteAccount from '../AccountDelete';
import { createHashHistory } from 'history';
import {replaceNameStorage} from '../../utils/storage';
import queryString from  'query-string' 
import {columns} from '../../data/latestTransactions';
import {formatAmount,formatterFrom0x,BufferString} from '../../utils/0xExchange';
import Qrcodecomp from '../../component/Qrcode';
import { injectIntl,FormattedMessage } from 'react-intl';
import blockies from '../../utils/blockies';
import './index.css';
// const confirm = Modal.confirm;

class AccountInfo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            block:500,
            balance:'',
            transactions:[],
            loading:true,
            limit:500,
            currentId:0,
            tab:[
                {
                    label:this.props.intl.formatMessage({id:"latest-transactions"}),
                    id:0,
                    blockNum:500,
                    limit:500
                },
                {
                    label:this.props.intl.formatMessage({id:"more-transactions"}),
                    id:1,
                    blockNum:1000,
                    limit:1000
                }
            ],
            exportState:false,
            editIcon:require("../../image/edit.png"),
            userIcon:require("../../image/insee-icon.png"),
            qrcodeIcon:require("../../image/account-qr.png"),
            srcImg:'',
            editState:false,
            accountName:'',
            codeState:false,
            privateState:false,
            deleteState:false
        }
    }

    componentDidMount() {
        let block = this.state.block;
        let limit = this.state.limit;
        let address = this.props.address;
        var source = blockies.create({ seed:address ,size: 8,scale: 16}).toDataURL();
        this.accountInfo(address);
        this.getLatestData(block,limit,address);
        this.setState({accountName:this.props.name,srcImg:source});
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

    getLatestData(block,address){
        let that = this;
        this.setState({transactions:[]})
        getLatestTransactionData(block,address).then((result)=>{
            console.log(result);
            let data = result.filter(item=>that.filterData(item));
            this.setState({transactions:data,loading:false});
        });
    }

    filterData(item){
        return item.sender.address === formatterFrom0x(this.props.address) || BufferString(item.transaction.toV1) === formatterFrom0x(this.props.address);
    }

    onChildExportChanged(){
        this.setState({exportState:false,privateState:false,deleteState:false});
    }

    onChildDeleteChanged(){
        this.setState({deleteState:false});
        this.props.callback();
    }

    tabCheck(item){
        this.setState({currentId:item.id,block:item.blockNum,loading:true});
        this.getLatestData(item.blockNum,this.props.address);
    }

    exportDialog(){
        this.setState({exportState:true});
    }

    exportPrivate(){
        this.setState({privateState:true});
    }

    deleteAccount(){
        this.setState({deleteState:true});
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
        this.setState({accountName:event.target.value});
    }

    handleEdit(e){
        replaceNameStorage("keyStore",this.state.accountName,formatterFrom0x(this.props.address));
        this.setState({editState:false});
    }

    closeCode(newState) {
        this.setState({ codeState: newState })
    }

    showCode(){
        this.setState({codeState:true});
    }

    render() {
        const {balance,transactions,loading,tab,currentId,exportState,deleteState,editIcon,userIcon,qrcodeIcon,editState,accountName,codeState,privateState,srcImg} = this.state;

        const tabDialog = tab && tab.length>0 ? tab.map((item)=>(
            <p key={item.id} onClick={this.tabCheck.bind(this,item)} className={item.id === currentId?"transaction-active":null}>{item.label}</p>
        )):''

        let exportDialogText = (exportState === true) ? 
        (<ExportAccount 
            addState={exportState} 
            address={this.props.address}
            callbackParent={this.onChildExportChanged.bind(this)}>
        </ExportAccount>):(<span></span>);

        let deleteDialogText = (deleteState === true) ? 
        (<DeleteAccount 
            addState={deleteState} 
            address={this.props.address}
            callbackParent={this.onChildDeleteChanged.bind(this)}
            closeDialog={this.onChildExportChanged.bind(this)}>
        </DeleteAccount>):(<span></span>);

        let privateDialogText = (privateState === true) ? 
        (<ExportAccountPrivate 
            addState={privateState} 
            address={this.props.address}
            callbackParent={this.onChildExportChanged.bind(this)}>
        </ExportAccountPrivate>):(<span></span>);

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
                        <img className="account-info-img" src={srcImg} alt=""/>
                        <p className="account-info-name">
                            <span style={{display: (editState===false) ? "inline-block" : "none"}}>{accountName}</span>
                            <Input type="text" value={accountName} onBlur={this.handleEdit.bind(this)} onChange={this.handleName.bind(this)} style={{display: (editState===true) ? "inline-block" : "none"}} />
                            <img style={{display: (editState===false) ? "inline-block" : "none",width: "12px",marginLeft: "5px",cursor:'pointer'}} onClick={this.editAccount.bind(this)} src={editIcon} alt=""/>
                        </p>
                    </div>
                    <div className="mobile-right">
                        <p className="account-info-address">{this.props.address}</p>
                        <p onClick={this.exportPrivate.bind(this)} className="account-info-export"><FormattedMessage id="export-private" /></p>
                        <p onClick={this.exportDialog.bind(this)} className="account-info-keystore"><FormattedMessage id="export-keystore" /></p>
                        <p onClick={this.deleteAccount.bind(this)} className="account-info-delete"><FormattedMessage id="account-delete" /></p>
                    </div>
                </div>
                <div className="account-info-right">
                    <div className="accountinfo-right-head">
                        <p className="account-img"><img style={{width:"100%"}} src={userIcon} alt=""/></p>
                        <p className="account-balance">{formatAmount(balance)+' SEE'}</p>
                        <div className="account-operate">
                            <p onClick={this.transfer.bind(this)} className="account-transfer"><FormattedMessage id="transaction-transafer" /></p>
                            <p onClick={this.send.bind(this)} className="account-send"><FormattedMessage id="transaction-send" /></p>
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
                {exportDialogText}
                {privateDialogText}
                {deleteDialogText}
                {codeShow}
            </div>
        );
    }
}

export default injectIntl(AccountInfo);