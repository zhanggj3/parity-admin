import React, { Component } from 'react';
import web3 from '../../utils/web3';
import {getStorage} from '../../utils/storage';
import ContractDeploySend from '../ContractDeploySend';
// import { createHashHistory } from 'history';
// import queryString from  'query-string' 
import Contractinput from '../ContractInput';
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
			amount:0,
            abi:'',
            code:'',
			sendState:false,
			gas:21000,
			gasPrice:21000,
            checkState:false,
			currentTab:1,
			argument:[],
			name:''
		}
	}

	componentWillMount() {
        this.getAccountData();	
        let defaultAccount = getStorage("defaultAccount");
        if(defaultAccount && defaultAccount !== ''){
            defaultAccount = JSON.parse(defaultAccount);
            this.setState({from:defaultAccount.address});
        }
	}

	handleAmount(event){
		this.setState({amount:event.target.value});
	}

	jsonPromise(param){
		return new Promise((resolve,reject)=>{
			let parse = JSON.parse(param);
			resolve(parse);
		})
	}

	handleData(event){
		let abiArray = event.target.value;
		console.log(typeof(abiArray));
		let abiArrayParse = this.jsonPromise(abiArray).catch((err)=>{
			message.error(err.message);
			return;
		});
        let argument = [];
        if(abiArrayParse && abiArrayParse.length>0){
            for(let i=0;i<abiArrayParse.length;i++){
                if(abiArrayParse[i].type && abiArrayParse[i].type === "constructor"){
                    if(abiArrayParse[i].inputs.length >0){
                        argument = abiArrayParse[i].inputs;
                        this.setState({argument:argument});
                    }
                }
            }
        }
		this.setState({abi:abiArray});
    }
    
    handleCode(event){
        this.setState({code:event.target.value});
	}

	handleName(event){
		this.setState({name:event.target.value});
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
        if(!this.state.name || this.state.name ===''){
            message.warning("The Contract Name should not empty!");
            return;
        }
        if(!this.state.abi || this.state.abi ===''){
			message.warning("The Contract ABI should not empty!");
			return;
        }
        if(!this.state.code || this.state.code ===''){
			message.warning("The Contract Code should not empty!");
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

	tabExchange(id){
		this.setState({currentTab:id});
	}

	render() {
		const {accountList,from,amount,abi,sendState,gas,gasPrice,checkState,currentTab,code,argument,name} = this.state;
		let fromAddress = accountList && accountList.length>0? accountList.map((accountItem, index) => (
            <Option key={index} value={formatterTo0x(accountItem.address)}>{accountItem.name}</Option>
		)):'';
		
		const DeployDialog = sendState === true ? (
			<ContractDeploySend 
				state={sendState}
				from={from} 
				amount={amount}
				abi={abi}
				name={name}
                code={code}
				gas={gas}
				gasPrice={gasPrice}
				argument={argument}
				handleClose={this.closeSend.bind(this)}>
			</ContractDeploySend>
		):''

		return (
			<div className="account">
				<div className="contract-header">
                    <span>Deploy Contract</span>
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
								<p className="overviewsend-left">Name:</p>
								<div className="overviewsend-right">
									<Input type="text" placeholder="Contract Name" onChange={this.handleName.bind(this)} value={name} />
								</div>
								
							</div>
							<div className="overviewsend-center">
								<p className="overviewsend-left">Amount:</p>
								<div className="overviewsend-right">
									<Input disabled={checkState} placeholder="Amount Input" onChange={this.handleAmount.bind(this)} value={amount} />
									<div className="overviewsend-tips">
										<Checkbox className="overviewsend-checkbox" onChange={this.onChange.bind(this)} value={checkState}>Send Everything / You want to send <span style={{color:"#50D4E3"}}>{amount} SEE</span></Checkbox>
									</div>
									<div className="contract-deploy-options">
                                        <p className={currentTab === 1?"deply-active":null} onClick={this.tabExchange.bind(this,1)}>ABI</p>
                                        <p className={currentTab === 2?"deply-active":null} onClick={this.tabExchange.bind(this,2)}>CONTRACT CODE</p>
                                    </div>
									<div style={{display: (currentTab===1) ? "block" : "none"}} className="overviewsend-textarea">
										<TextArea value={abi} rows={4} onChange={this.handleData.bind(this)} placeholder='abi' />
									</div>
                                    <div style={{display: (currentTab===2) ? "block" : "none"}} className="overviewsend-textarea">
										<TextArea value={code} rows={4} onChange={this.handleCode.bind(this)} placeholder='contract byte code' />
									</div>
									<Contractinput inputs={argument}></Contractinput>
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
						{DeployDialog}
					</div>
					
				</div>
			</div>
			
		);
	}
}

export default Home;
