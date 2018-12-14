import React, { Component } from 'react';
import web3 from '../../utils/web3';
import {getStorage} from '../../utils/storage';
import SendTransfer from '../AccountTransfer';
import { createHashHistory } from 'history';
import {formatterTo0x,formatAmount} from '../../utils/0xExchange';
import Process from '../../component/Process';
import { Input,Select,Checkbox,message,Button } from 'antd';
import { injectIntl,FormattedMessage } from 'react-intl';

// import './index.css';

const Option = Select.Option;
const { TextArea } = Input;

class ContractSend extends Component {
	constructor(){
		super();
		this.state = {
			accountList:[],
			from:'',
			balance:0,
			loading:true,
			amount:0,
			sendData:'',
			sendState:false,
			gas:21000,
			defaultGas:21000,
			gasPrice:21000,
			checkState:false
		}
	}

	componentWillMount() {
		this.getAccountData();
		this.getGasPrice();
		let defaultAccount = getStorage("defaultAccount");
		if(defaultAccount && defaultAccount !== ''){
			defaultAccount = JSON.parse(defaultAccount);
			this.setState({from:defaultAccount.address});
		}
	}

	componentWillReceiveProps(nextProps){
		const {code} = nextProps;
		if(code !== this.props.code){
			this.estimateGas(code);
		}
	}

	estimateGas(data) {
		web3.appchain.estimateGas({
			to:this.props.contractAddress,
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

	tabExchange(item){
		createHashHistory().push(item.path);
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
		const {accountList,from,amount,sendState,gas,gasPrice,checkState,defaultGas} = this.state;
		let fromAddress = accountList && accountList.length>0? accountList.map((accountItem, index) => (
            <Option key={index} value={formatterTo0x(accountItem.address)}>{accountItem.name}</Option>
		)):'';
		
		const sendDialog = sendState === true ? (
			<SendTransfer 
				state={sendState}
				from={from} 
				to={this.props.contractAddress}
				amount={amount}
				sendData={this.props.code}
				gas={gas}
				gasPrice={gasPrice}
				handleClose={this.closeSend.bind(this)}>
			</SendTransfer>
		):''

		return (
			<div style={{width:"100%"}}>
				<div className="account-overviewsend-cont">
					<div className="overviewsend-center">
						<p className="overviewsend-left" style={{width:"60px"}}><FormattedMessage id="from" />:</p>
						<div className="overviewsend-right" style={{marginLeft:"10px",width:"calc(100% - 80px)"}}>
							<Select className="overviewsend-right" value={from} style={{ width: "200px" }} onChange={this.handleChange.bind(this)}>
								{fromAddress}
							</Select>
						</div>
						
					</div>
					<div className="overviewsend-center">
						<p className="overviewsend-left" style={{width:"60px"}}><FormattedMessage id="to" />:</p>
						<div className="overviewsend-right" style={{marginLeft:"10px",width:"calc(100% - 80px)"}}>
							<Input 
								disabled
								value={this.props.contractAddress} 
								className="overviewsend-right">
							</Input>
						</div>
						
					</div>
					<div className="overviewsend-center">
						<p className="overviewsend-left" style={{width:"60px"}}><FormattedMessage id="amount" />:</p>
						<div className="overviewsend-right" style={{marginLeft:"10px",width:"calc(100% - 80px)"}}>
							<Input disabled={checkState} placeholder="Amount Input" onChange={this.handleAmount.bind(this)} value={amount} />
							<div className="overviewsend-tips">
								<Checkbox className="overviewsend-checkbox" onChange={this.onChange.bind(this)} value={checkState}>Send Everything / You want to send <span style={{color:"#50D4E3"}}>{amount} SEE</span></Checkbox>
							</div>
							{/* <span className="overviewsend-options">Show Fewer Optins</span> */}
							<div className="overviewsend-textarea" style={{marginTop:"10px"}}>
								<TextArea disabled value={this.props.code} rows={4} onChange={this.handleData.bind(this)} placeholder='Data' />
							</div>
							
						</div>
						
					</div>

					<div className="overviewsend-center">
						<p className="overviewsend-left" style={{width:"60px"}}><FormattedMessage id="gasFee" />:</p>
						<div className="overviewsend-right" style={{marginLeft:"10px",width:"calc(100% - 80px)"}}>
							<p className="overviewsend-gasfee">{formatAmount(gas*gasPrice)} SEE</p>
							<p className="overviewsend-calculate">≈ SEG limit({gas})*SEG Price ({gasPrice} SEG)</p>
							<Process defaultGas={defaultGas} getGas={this.getGas.bind(this)} ></Process>
							<Button className="overviewsend-next" onClick={this.next.bind(this)} type="primary"><FormattedMessage id="next" /></Button>
						</div>
					</div>
				</div>
				{sendDialog}
					
			</div>
			
		);
	}
}

export default injectIntl(ContractSend);
