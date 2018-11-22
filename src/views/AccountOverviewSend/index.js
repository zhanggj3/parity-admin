import React, { Component } from 'react';
import web3 from '../../utils/web3';
import {getStorage} from '../../utils/storage';
import SendTransfer from '../AccountTransfer';
import { createHashHistory } from 'history';
import queryString from  'query-string' 
import {formatterTo0x,formatAmount} from '../../utils/0xExchange';
import { Input,Select,Checkbox,message } from 'antd';

import './index.css';

const Option = Select.Option;
const { TextArea } = Input;

class Home extends Component {
	constructor(){
		super();
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
			gasPrice:21000,
			checkState:false,
			list:[
				{
					label:"ACCOUNT",
					id:0,
					path:'/'
				},
				{
					label:"SEND",
					id:1,
					path:'/send'
				}
			]
		}
	}

	componentWillMount() {
		let query=this.query=queryString.parse(this.props.location.search);
		console.log(query);
		this.getAccountData();
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
		} 
		
		
	}

	handleAmount(event){
		this.setState({amount:event.target.value});
	}

	handleData(event){
		this.setState({sendData:event.target.value});
	}

	handleChange(value) {
		this.setState({from:value});
		if(this.state.checkState && this.state.checkState === true){
			this.getBalance(value).then((data)=>{
				this.setState({amount:Number(formatAmount(data))});
			})
		}else{
			this.setState({amount:0});
		}
	}

	recipientAddress(value){
		console.log(value);
		this.setState({toAddress:value});
	}

	onChange(e) {
		// console.log(`checked = ${e.target.checked}`);
		this.setState({checkState:e.target.checked});
		if(e.target.checked && e.target.checked === true){
			this.getBalance(this.state.from).then((data)=>{
				this.setState({amount:Number(formatAmount(data))});
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

		if(!this.state.amount || this.state.amount ===''){
			message.warning("The transaction Amount should not empty!");
			return;
		}
		
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

	tabExchange(item){
		createHashHistory().push(item.path);
	}

	render() {
		const {accountList,from,toAddress,amount,sendData,sendState,list,gas,gasPrice,checkState} = this.state;
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
								<p className="overviewsend-left">From:</p>
								<div className="overviewsend-right">
									<Select className="overviewsend-right" value={from} style={{ width: "200px" }} onChange={this.handleChange.bind(this)}>
										{fromAddress}
									</Select>
								</div>
								
							</div>
							<div className="overviewsend-center">
								<p className="overviewsend-left">To:</p>
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
								<p className="overviewsend-left">Amount:</p>
								<div className="overviewsend-right">
									<Input disabled={checkState} placeholder="Amount Input" onChange={this.handleAmount.bind(this)} value={amount} />
									<div className="overviewsend-tips">
										<Checkbox className="overviewsend-checkbox" onChange={this.onChange.bind(this)} value={checkState}>Send Everything / You want to send <span style={{color:"#50D4E3"}}>{amount} SEE</span></Checkbox>
									</div>
									<span className="overviewsend-options">Show Fewer Optins</span>
									<div className="overviewsend-textarea">
										<TextArea value={sendData} rows={4} onChange={this.handleData.bind(this)} placeholder='Data' />
									</div>
									
								</div>
								
							</div>

							<div className="overviewsend-center">
								<p className="overviewsend-left">Gas Fee:</p>
								<div className="overviewsend-right">
									<p className="overviewsend-gasfee">{gas*gasPrice} SEE</p>
									<p className="overviewsend-calculate">≈ Gas({gas})*Gas Price ({gasPrice} SEG)</p>
									<p className="overviewsend-next" onClick={this.next.bind(this)}>Next</p>
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

export default Home;
