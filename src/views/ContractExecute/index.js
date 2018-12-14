import React, { Component } from 'react';
import {Button,Select,message} from 'antd';
import {getStorage} from '../../utils/storage';
import { createHashHistory } from 'history';
import ContractExecuteInput from '../ContractExecuteInput';
import ContractSend from '../ContractSend';
import web3 from '../../utils/web3';
import { injectIntl,FormattedMessage } from 'react-intl';
import './index.css';
const Option = Select.Option;


class ContractExecute extends Component {
	constructor(){
		super();
		this.state = {
            contract:'',
            functionList:[],
            selectedFunction:'',
            selectedItem:[],
            sendShow:false,
            code:''
		}
    }

    componentWillMount() {
		let getCurrentContract = getStorage("currentContract");
		
		if(getCurrentContract && getCurrentContract !== ''){
			getCurrentContract = JSON.parse(getCurrentContract);
			this.getFunctions(getCurrentContract._jsonInterface);
			this.setState({contract:getCurrentContract});
		}else{
			message.warning("YOU HAVE NOT CHOOSE CONTRACT!");
			createHashHistory().push('/contract');
		}
		
    }
    
    getFunctions(jsonInterface){
        let functionList = [];
        let i =0;
        jsonInterface.map((item,index)=>{
            if(item.type && item.type === "function"){
                if(item.stateMutability !== 'view'){
                    if(i === 0){
                        this.setState({selectedItem:item,selectedFunction:item.name});
                        i++;
                    }
                    functionList.push(item);
                }      
            }
            return true;
        })
        this.setState({functionList:functionList})
    }
    
    handleFunc(name){
        this.state.functionList.map((item,index)=>{
            if(item.name === name){
                this.setState({selectedItem:item});
            }
            return true;
        })
        this.setState({selectedFunction:name});
    }

    nextSend() {
        let params = [];
        for(var i=0;i<this.state.selectedItem.inputs.length;i++){
            let obj = this.state.selectedItem.inputs[i];
            if(obj.params && obj.params !== '') {
                params.push(obj.params);
            }else{
                message.warning(obj.name+" value is empty!");
                return;
            }
        }
        let contract = new web3.appchain.Contract(this.state.contract._jsonInterface,this.state.contract._address);
        let byteCode = contract.methods[this.state.selectedItem.name].apply(null,params).encodeABI();
        this.setState({code:byteCode},()=>{
            this.setState({sendShow:true});
        })
    }

    cancelSend() {
        this.setState({sendShow:false});
    }

	render() {
        const {contract,selectedFunction,functionList,selectedItem,sendShow,code} = this.state;

        let functionSelect = functionList.length > 0 ? functionList.map((item, index) => (
            <Option key={index} value={item.name}>
                {item.name}
            </Option>
        )):(<span></span>);

		return (
			<div className="contract-execute">
				<div className="contract-header">
                    <p><FormattedMessage id="contract-execute" /></p>
                </div>
                <div className="contract-execute-cont">
                    <div className="contract-execute-item">
                        <p className="contract-execute-left"><FormattedMessage id="contract-function" />:</p>
                        <div className="contract-execute-right">
                            <Select 
                                disabled={sendShow}
                                value={selectedFunction} 
                                style={{width:"100%"}}
                                placeholder="function to execute" 
                                onChange={this.handleFunc.bind(this)}>
                                    {functionSelect}
                            </Select>
                        </div>
                    </div>
                    <ContractExecuteInput disabled={sendShow} inputs={selectedItem.inputs}></ContractExecuteInput>
                    <div className="contract-execute-bottom">
                        <Button disabled={sendShow} onClick={this.nextSend.bind(this)} className="contract-execute-button" type="primary"><FormattedMessage id="next" /></Button>
                        <Button onClick={this.cancelSend.bind(this)} className="contract-execute-cancelbutton"><FormattedMessage id="cancel" /></Button>
                    </div>
                    <div style={{display: (sendShow===true) ? "block" : "none"}}>
                        <ContractSend code={code} contractAddress={contract._address}></ContractSend>
                    </div>
                </div>
                
				
			</div>
			
		);
	}
}

export default injectIntl(ContractExecute);
