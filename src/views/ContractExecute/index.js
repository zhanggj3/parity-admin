import React, { Component } from 'react';
import {Button,Select,message} from 'antd';
import {getStorage} from '../../utils/storage';
import { createHashHistory } from 'history';
import ContractExecuteInput from '../ContractExecuteInput';
import './index.css';
const Option = Select.Option;


class Home extends Component {
	constructor(){
		super();
		this.state = {
            contract:'',
            functionList:[],
            selectedFunction:'',
            selectedItem:[]
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
                console.log(item);
                this.setState({selectedItem:item});
            }
            return true;
        })
        this.setState({selectedFunction:name});
    }

	render() {
        const {selectedFunction,functionList,selectedItem} = this.state;

        let functionSelect = functionList.length > 0 ? functionList.map((item, index) => (
            <Option key={index} value={item.name}>
                {item.name}
            </Option>
        )):(<span></span>);

		return (
			<div className="contract-execute">
				<div className="contract-header">
                    <span>Contract Execute</span>
                </div>
                <div className="contract-execute-cont">
                    <div className="contract-execute-item">
                        <p className="contract-execute-left">Function to execute:</p>
                        <div className="contract-execute-right">
                            <Select 
                                value={selectedFunction} 
                                style={{width:"100%"}}
                                placeholder="function to execute" 
                                onChange={this.handleFunc.bind(this)}>
                                    {functionSelect}
                            </Select>
                        </div>
                    </div>
                    <ContractExecuteInput inputs={selectedItem.inputs}></ContractExecuteInput>
                    
                    {/* <div className="contract-execute-item">
                        <p className="contract-execute-left">From(address):</p>
                        <div className="contract-execute-right">
                            <Input type="text" />
                        </div>
                    </div>
                    <div className="contract-execute-item">
                        <p className="contract-execute-left">To(address):</p>
                        <div className="contract-execute-right">
                            <Input type="text" />
                        </div>
                    </div>
                    <div className="contract-execute-item">
                        <p className="contract-execute-left">Tokens(uint256):</p>
                        <div className="contract-execute-right">
                            <Input type="text" />
                        </div>
                    </div> */}
                    <div className="contract-execute-bottom">
                        <Button className="contract-execute-button" type="primary">Next</Button>
                    </div>
                </div>
				
			</div>
			
		);
	}
}

export default Home;
