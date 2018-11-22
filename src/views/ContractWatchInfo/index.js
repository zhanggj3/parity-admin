import React, { Component } from 'react';
import {Button,message} from 'antd';
import { createHashHistory } from 'history';
import {formatAmount} from '../../utils/0xExchange';
import web3 from '../../utils/web3';
import Contractinput from '../ContractInput';
import './index.css';
import { getStorage } from '../../utils/storage';


class Home extends Component {
	constructor(){
		super();
		this.state = {
			userIcon:require("../../image/insee-icon.png"),
			contract:'',
			showInfo:true,
			showInfoText:"HIDE CONTRACT INFO",
			interfaceNoinput:[],
			interfaceHasinput:[]
		}
	}

	componentWillMount() {
		let getCurrentContract = getStorage("currentContract");
		
		if(getCurrentContract && getCurrentContract !== ''){
			getCurrentContract = JSON.parse(getCurrentContract);
			console.log(getCurrentContract);
			this.getJsonInterface(getCurrentContract._jsonInterface,getCurrentContract._address);
			this.setState({contract:getCurrentContract});
		}else{
			message.warning("YOU HAVE NOT CHOOSE CONTRACT!");
			createHashHistory().push('/contract');
		}
		
	}

	queryContractDetail(interfaceHasinput,index){
        let that = this;
        let jsonInterface = this.state.contract._jsonInterface;
        let tokenAddress = this.state.contract._address;
        let contract = new web3.eth.Contract(jsonInterface,tokenAddress);
        let params = [];
        // params.push(tokenAddress);
        for(var i=0;i<interfaceHasinput[index].inputs.length;i++){
            let obj = interfaceHasinput[index].inputs[i];
            if(obj.params && obj.params !== '') {
                params.push(obj.params);
            }else{
                message.warning(obj.name+" the value is null!");
                return;
            }
        }
        contract.methods[interfaceHasinput[index].name].apply(null,params).call().then(function(result){
            console.log(result);
            let resultString = result.toString();
            interfaceHasinput[index].contractValue = resultString;
            that.setState({interfaceHasinput:interfaceHasinput})
        }).catch((err)=>{
            message.error(err.message);
        });
    }

	getJsonInterface(jsonInterface,tokenAddress){
        let that = this;
        let interfaceNoinput = [];
        let interfaceHasinput = [];
        // let jsonInterface = this.props.contractInfo.options.jsonInterface;
        // let tokenAddress = this.props.contractInfo.options.address;
        let contract = new web3.eth.Contract(jsonInterface,tokenAddress);
        jsonInterface.map((item)=>{
            if(item.type && item.type === "function"){
                if(item.constant === true && item.inputs.length === 0 && item.stateMutability === "view"){
                    contract.methods[item.name].call().call().then(function(result){
                        console.log(result);
                        item.value = result;
                        interfaceNoinput.push(item);
                        that.setState({interfaceNoinput:interfaceNoinput})
                    }).catch((err)=>{
						console.log(item);
						message.error(err.message);
					});
                    
                }else{
                    if(item.inputs.length > 0 && item.stateMutability === 'view'){
                        interfaceHasinput.push(item);
                        that.setState({interfaceHasinput:interfaceHasinput})
                    }
                    
                }
            }
            return true;
        })
        
    }

	contractExecute(){
		createHashHistory().push('/execute');
	}

	showWatchinfo(){
		if(this.state.showInfo && this.state.showInfo === true){
			this.setState({showInfoText:"SHOW CONTRACT INFO",showInfo:false});
		}else{
			this.setState({showInfoText:"HIDE CONTRACT INFO",showInfo:true});
		}
	}

	render() {
		const {userIcon,contract,showInfo,showInfoText,interfaceNoinput,interfaceHasinput} = this.state;

		// 合约无参数列表
        let interfaceArray = interfaceNoinput.length? interfaceNoinput.map((interfaceNoItem, index) => (
			<div key={index} className="watchinfo-right-static">
				<p className="watchinfo-static-question">{interfaceNoItem.name}</p>
				<p className="watchinfo-static-answer">{interfaceNoItem.value}</p>
			</div>
		)): '';

		let interfaceHasArray = interfaceHasinput.length? interfaceHasinput.map((interfaceHasItem, index) => (
            // <li key={index} >
            //     <p>{interfaceHasItem.name}:</p>
            //     <Contractinput inputs={interfaceHasItem.inputs}></Contractinput>
            //     <p style={{wordWrap:"break-word"}}>output:{interfaceHasItem.contractValue}</p>
            //     <Button type="primary" onClick={this.queryContractDetail.bind(this,interfaceHasinput,index)}>Query</Button>
            // </li>
			<div key={index} className="watchinfo-right-dynamic">
				<div className="watchinfo-dynamic-question">
					<p>{interfaceHasItem.name}</p>
					<Contractinput inputs={interfaceHasItem.inputs}></Contractinput>
					<Button style={{marginBottom:"5px"}} type="primary" onClick={this.queryContractDetail.bind(this,interfaceHasinput,index)}>Query</Button>
					{/* <p>owner-address</p>
					<Input type="text" /> */}
				</div>
				<p className="watchinfo-dynamic-answer">{interfaceHasItem.contractValue}</p>
			</div>
        )): 'There are currently no contract interface (Has Params) to display'
		
		return (
			<div className="contract-watchinfo">
				<div className="contract-header">
                    <span>Watch</span>
					<div className="contract-header-tab">
						<p onClick={this.contractExecute.bind(this)}>Execute</p>
						<p>Delete</p>
					</div>
                </div>
				<div className="contract-watchinfo-cont">
					<div style={{overflow:"hidden"}}>
						<div className="watchinfo-cont-left">
							<img src={userIcon} alt="" />
						</div>
						<div className="watchinfo-cont-right">
							<div className="watchinfo-right-top">
								<p className="watchinfo-name">{contract.name}</p>
								<p className="watchinfo-address">{contract._address}</p>
								<p className="watchinfo-balance">{formatAmount(contract.balance)} ether</p>
								<Button onClick={this.showWatchinfo.bind(this)} type="primary" className="watchinfo-tips">{showInfoText}</Button>
							</div>
						</div>
					</div>
					
					<div style={{display: (showInfo===true) ? "block" : "none"}} className="watchinfo-right-middle">
						<p className="watchinfo-right-title">READ FROM CONTRACT</p>
						{interfaceArray}
						{interfaceHasArray}
						{/* <div className="watchinfo-right-static">
							<p className="watchinfo-static-question">name</p>
							<p className="watchinfo-static-answer">INSEE COIN</p>
						</div>
						<div className="watchinfo-right-dynamic">
							<div className="watchinfo-dynamic-question">
								<p>Balance Of</p>
								<p>owner-address</p>
								<Input type="text" />
							</div>
							<p className="watchinfo-dynamic-answer">0</p>
						</div>
						<div className="watchinfo-right-static">
							<p className="watchinfo-static-question">name</p>
							<p className="watchinfo-static-answer">INSEE COIN</p>
						</div>
						<div className="watchinfo-right-static">
							<p className="watchinfo-static-question">name</p>
							<p className="watchinfo-static-answer">INSEE COIN</p>
						</div>
						<div className="watchinfo-right-static">
							<p className="watchinfo-static-question">name</p>
							<p className="watchinfo-static-answer">INSEE COIN</p>
						</div>
						<div className="watchinfo-right-dynamic">
							<div className="watchinfo-dynamic-question">
								<p>Balance Of</p>
								<p>owner-address</p>
								<Input type="text" />
							</div>
							<p className="watchinfo-dynamic-answer">0</p>
						</div>
						<div className="watchinfo-right-dynamic">
							<div className="watchinfo-dynamic-question">
								<p>Balance Of</p>
								<p>owner-address</p>
								<Input type="text" />
							</div>
							<p className="watchinfo-dynamic-answer">0</p>
						</div>
						<div className="watchinfo-right-dynamic">
							<div className="watchinfo-dynamic-question">
								<p>Balance Of</p>
								<p>owner-address</p>
								<Input type="text" />
							</div>
							<p className="watchinfo-dynamic-answer">0</p>
						</div>		 */}
					</div>
					<div className="watchinfo-right-bottom">
						<Button className="watchinfo-events">latest events</Button>
					</div>	
				</div>
			</div>
			
		);
	}
}

export default Home;
