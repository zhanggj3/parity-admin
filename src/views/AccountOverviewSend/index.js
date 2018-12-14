import React, { Component } from 'react';
import web3 from '../../utils/web3';
import {getStorage} from '../../utils/storage';
import SendTransfer from '../AccountTransfer';
import { createHashHistory } from 'history';
import queryString from  'query-string' 
import {formatterTo0x,formatAmount} from '../../utils/0xExchange';
import Process from '../../component/Process';
import { Input,Select,Checkbox,message } from 'antd';
import { injectIntl,FormattedMessage } from 'react-intl';


import './index.css';

const Option = Select.Option;
const { TextArea } = Input;

class AccountOverviewSend extends Component {
	constructor(props){
		super(props);
		this.state = {
			accountList:[],
			from:'',
			balance:0,
			loading:true,
			toAddress:'',
			amount:0,
			sendData:'',
			sendState:false,
			gas:21000,
			defaultGas:21000,
			gasPrice:21000,
			checkState:false,
			optionState:false,
			list:[
				{
					label:this.props.intl.formatMessage({id:"account-home"}),
					id:0,
					path:'/'
				},
				{
					label:this.props.intl.formatMessage({id:"account-send"}),
					id:1,
					path:'/send'
				}
			]
		}
	}

	componentDidMount() {
		let query=this.query=queryString.parse(this.props.location.search);
		this.getAccountData();
		this.getGasPrice();
		// this.estimateGas(this.state.toAddress,this.state.sendData);
		let defaultAccount = getStorage("defaultAccount");
		if(query.from && query.from !== ''){
			this.setState({from:query.from});
		}else{
			if(defaultAccount && defaultAccount !== ''){
				defaultAccount = JSON.parse(defaultAccount);
				this.setState({from:defaultAccount.address});
			}
		}
		if(query.to && query.to !== ''){
			this.setState({toAddress:query.to});
			this.estimateGas(query.to,this.state.sendData);
		} 
		
		
	}

	estimateGas(to,data) {
		web3.appchain.estimateGas({
			to:to,
			data:data
		}).then((data)=>{
			// let gas = web3.utils.hexToNumber(data);
			this.setState({defaultGas:data});
		})
	}

	getGasPrice(){
		web3.appchain.getGasPrice().then((data)=>{
			let gasPrice = web3.utils.hexToNumber(data);
			this.setState({gasPrice:gasPrice});
		})
	}

	handleAmount(event){
		this.setState({amount:event.target.value});
	}

	handleData(event){
		this.setState({sendData:event.target.value});
		if(this.state.toAddress && this.state.toAddress !== ''){
			this.estimateGas(this.state.toAddress,event.target.value);
		}
	}

	handleChange(value) {
		this.setState({from:value});
		if(this.state.checkState && this.state.checkState === true){
			this.getBalance(value).then((data)=>{
				this.setState({amount:formatAmount(web3.utils.toBN(data).sub(web3.utils.toBN(this.state.gas*this.state.gasPrice)).toString(10))});
			})
		}else{
			this.setState({amount:0});
		}
	}

	recipientAddress(value){
		this.setState({toAddress:value});
		this.estimateGas(value,this.state.sendData);
	}

	onChange(e) {
		this.setState({checkState:e.target.checked});
		if(e.target.checked && e.target.checked === true){
			this.getBalance(this.state.from).then((data)=>{
				this.setState({amount:formatAmount(web3.utils.toBN(data).sub(web3.utils.toBN(this.state.gas*this.state.gasPrice)).toString(10))});
			})
		}else{
			this.setState({amount:0});
		}
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
        this.getAccounts().then((accounts)=>{
			this.setState({accountList:accounts,loading:false});
		})

    }

    getBalance(account){
        return new Promise((resolve, reject) => {
            web3.appchain.getBalance(account,function(err,balance){
                resolve(balance);
            })
        }); 
	}
	
	next(){
		if(!this.state.from || this.state.from ===''){
			message.warning("The From Address should not empty!");
			return;
		}
		// if(!this.state.toAddress || this.state.toAddress ===''){
		// 	message.warning("The Recipient Address should not empty!");
		// 	return;
		// }

		// if(!this.state.amount || this.state.amount ===''){
		// 	message.warning("The transaction Amount should not empty!");
		// 	return;
		// }
		
		if(!this.state.gas || this.state.gas ===''){
			message.warning("The transaction gas should not empty!");
			return;
		}
		if(!this.state.gasPrice || this.state.gasPrice ===''){
			message.warning("The transaction gasPrice should not empty!");
			return;
		}
		this.setState({sendState:true});
	}

	closeSend(){
		this.setState({sendState:false});
	}

	showOptions() {
		this.setState({optionState:!this.state.optionState});
	}

	tabExchange(item){
		createHashHistory().replace(item.path);
	}

	getGas(value){
		this.setState({gas:value});
		if(this.state.checkState && this.state.checkState === true){
			this.getBalance(this.state.from).then((data)=>{
				this.setState({amount:formatAmount(web3.utils.toBN(data).sub(web3.utils.toBN(value*this.state.gasPrice)).toString(10))});
			})
		}
	}

	render() {
		const {accountList,from,toAddress,amount,sendData,sendState,defaultGas,list,gas,gasPrice,checkState,optionState } = this.state;
		let fromAddress = accountList && accountList.length>0? accountList.map((accountItem, index) => (
            <Option key={index} value={formatterTo0x(accountItem.address)}>{accountItem.name}</Option>
		)):'';
		
		const sendDialog = sendState === true ? (
			<SendTransfer 
				state={sendState}
				from={from} 
				to={toAddress}
				amount={amount}
				sendData={sendData}
				gas={gas}
				gasPrice={gasPrice}
				handleClose={this.closeSend.bind(this)}>
			</SendTransfer>
		):''

		const List = list.length>0 ? list.map((item)=>(
            <li key={item.id} onClick={this.tabExchange.bind(this,item)}>
				<span className={item.id===1?"active":null}>{item.label}</span>
            </li>
        )):''

		return (
			<div className="account">
				<div className="account-top">
					<ul className="account-top-ul">
						{List}
					</ul>
				</div>
				<div className="account-main">
					<div className="account-overviewsend">
						<div className="account-overviewsend-cont">
							<div className="overviewsend-center">
								<p className="overviewsend-left"><FormattedMessage id="from" />:</p>
								<div className="overviewsend-right">
									<Select className="overviewsend-right" value={from} style={{ width: "200px" }} onChange={this.handleChange.bind(this)}>
										{fromAddress}
									</Select>
								</div>
								
							</div>
							<div className="overviewsend-center">
								<p className="overviewsend-left"><FormattedMessage id="to" />:</p>
								<div className="overviewsend-right">
									<Select 
										value={toAddress} 
										onBlur={this.recipientAddress.bind(this)} 
										onSearch={this.recipientAddress.bind(this)}
										showSearch 
										style={{ width: "200px" }}
										className="overviewsend-right" 
										onChange={this.recipientAddress.bind(this)}>
											{fromAddress}
									</Select>
								</div>
								
							</div>
							<div className="overviewsend-center">
								<p className="overviewsend-left"><FormattedMessage id="amount" />:</p>
								<div className="overviewsend-right">
									<Input disabled={checkState} placeholder="Amount Input" onChange={this.handleAmount.bind(this)} value={amount} />
									<div className="overviewsend-tips">
										<Checkbox className="overviewsend-checkbox" onChange={this.onChange.bind(this)} value={checkState}>Send Everything / You want to send <span style={{color:"#6753FF"}}>{amount} SEE</span></Checkbox>
									</div>
									<span className="overviewsend-options" onClick={this.showOptions.bind(this)}><FormattedMessage id="showOptions" /></span>
									<div className="overviewsend-textarea" style={{display:optionState === true ? "block":"none"}}>
										<TextArea value={sendData} rows={4} onChange={this.handleData.bind(this)} placeholder='Data' />
									</div>
									
								</div>
								
							</div>

							<div className="overviewsend-center">
								<p className="overviewsend-left"><FormattedMessage id="gasFee" />:</p>
								<div className="overviewsend-right">
									<p className="overviewsend-gasfee">{formatAmount(gas*gasPrice)} SEE</p>
									<p className="overviewsend-calculate">≈ SEG limit({gas})*SEG Price ({gasPrice} SEG)</p>
									<Process defaultGas={defaultGas} getGas={this.getGas.bind(this)} ></Process>
									<p className="overviewsend-next" onClick={this.next.bind(this)}><FormattedMessage id="next" /></p>
								</div>
							</div>
						</div>
						{sendDialog}
					</div>
					
				</div>
			</div>
			
		);
	}
}

export default injectIntl(AccountOverviewSend);
