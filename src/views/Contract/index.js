import React, { Component } from 'react'
import {Button,Spin} from 'antd';
import ContractWatch from '../../views/ContractWatch';
import { createHashHistory } from 'history';
import web3 from '../../utils/web3';
import {getStorage, setStorage} from '../../utils/storage';
import {formatAmount} from '../../utils/0xExchange';
import async from 'async';
import { injectIntl,FormattedMessage } from 'react-intl';
import './index.css';

class Contract extends Component {
	constructor(){
		super();
		this.state = {
            userIcon:require("../../image/insee-icon.png"),
            watchState:false,
            contractsList:'',
            loading:true
		}
    }

    componentWillMount() {
        this.getContractData();
    }

    getContractData(){
        let that = this;
        async.waterfall([
            function(callback){
                let accountData = [];
                that.getContractList().then((accounts)=>{
                    async.eachSeries(accounts,function(account,eachCallback){
                        that.getBalance(account._address).then((data) =>{
                            account.balance = data;
                            accountData.push(account);
                            eachCallback();
                        })
                    },function(err){
                        callback(err,accountData);
                    })
                })
            }],function(err,accountData){
            if(!err){
                that.setState({contractsList:accountData});
            }
        })
    }

    getContractList(){
        let that = this;
        that.setState({contracts:[]});
        return new Promise((resolve, reject) => {
            let contracts = getStorage("contractStore");
            if(contracts && contracts !== ''){
                contracts = JSON.parse(contracts);
            }else{
                contracts = [];
            }
            that.setState({contracts:contracts,loading:false});
            resolve(contracts)
        });  
    }
    getBalance(account){
        return new Promise((resolve, reject) => {
            web3.appchain.getBalance(account,function(err,balance){
                resolve(balance);
            })
        }); 
    }
    
    showWatch(){
        this.setState({watchState:true});
    }

    showDeploy(){
        createHashHistory().push('/deploy');
    }

    closeDialog(){
        this.setState({watchState:false});
    }

    watchInfo(item){
        setStorage("currentContract",JSON.stringify(item));
        createHashHistory().push('/watch');
    }

	render() {
        const {userIcon,watchState,contractsList,loading} = this.state;

        let noData;
        if(loading && loading === true){
            noData = '';
        }else{
            noData = 'There are currently no contracts to display';
        }

        let contractArray = contractsList.length? contractsList.map((contractItem, index) => (
            <li key={index} onClick={this.watchInfo.bind(this,contractItem)}>
                <img className="watch-list-user" src={userIcon} alt=""/>
                <div className="watch-list-text">
                    <p className="watch-list-name">{contractItem.name}</p>
                    <p className="watch-list-balance">{formatAmount(contractItem.balance)} ether</p>
                    <p className="watch-list-address">{contractItem._address}</p>
                </div>
            </li>
        )): (<p>{noData}</p>);
        

        let watchDialog = watchState === true?(
            <ContractWatch 
                state={watchState}
                freshData={this.getContractData.bind(this)}
                closeWatch={this.closeDialog.bind(this)}>
            </ContractWatch>
        ):''
		
		return (
			<div className="contract">
                <div className="contract-header">
                    <p><FormattedMessage id="contract-home" /></p>
                </div>
                <div className="contract-deploy">
                    <Button type="primary" onClick={this.showDeploy.bind(this)} className="contract-deploy-button"><FormattedMessage id="deploy" /></Button>
                </div>
                <div className="contract-watch">
                    <p className="contract-watch-title"><FormattedMessage id="custom-contract" /></p>
                    <p className="contract-watch-tips">To watch and interact with a contract already deployed on the blockchain, you need to know its address and the description of its interface in JSON format</p>
                    <ul className="contract-watch-list">
                       {/* {contractArray} */}
                       <Spin spinning={loading}>{contractArray}</Spin>
                    </ul>
                    <Button type="primary" onClick={this.showWatch.bind(this)} className="contract-watch-button"><FormattedMessage id="watch" /></Button>
                </div>
                {watchDialog}
			</div>
			
		);
	}
}

export default injectIntl(Contract);
