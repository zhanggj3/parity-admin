import React from 'react';
import { Modal,Input,message } from 'antd';
import web3 from '../../utils/web3';
import {replaceStorage} from '../../utils/storage';
import { injectIntl,FormattedMessage } from 'react-intl';
import './index.css';
const { TextArea } = Input;

class ContractWatch extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            address:'',
            name:'',
            abi:''
        }
    }

    handleOk(e) {
        if(!this.state.address || this.state.address === ''){
            message.warning("The Contract Address should not be Empty!");
            return;
        }
        if(!this.state.name || this.state.name === ''){
            message.warning("The Contract Name should not be Empty!");
            return;
        }
        if(!this.state.abi || this.state.abi === ''){
            message.warning("The Contract Abi should not be Empty!");
            return;
        }
        let jsonInterface = JSON.parse(this.state.abi);
        let tokenAbi = jsonInterface;
        let contract = new web3.appchain.Contract(tokenAbi,this.state.address);
        if(contract && contract !== ''){
            contract.name = this.state.name;
            message.success("CONTRACT ADD SUCCESS!");
            replaceStorage("contractStore",contract,"_address");
            this.props.freshData();
        }
        this.props.closeWatch();
    }

    handleAddress(event){
        this.setState({address:event.target.value});
    }

    handleName(event){
        this.setState({name:event.target.value});
    }

    handleAbi(event){
        this.setState({abi:event.target.value});
    }
    
    handleCancel(e) {
        this.props.closeWatch();
    }

	render() {
        const {address,name,abi} = this.state;
        return (
            <div className="contract-watch-dialog">
                <Modal
                    title={this.props.intl.formatMessage({id:"contract-watch"})}
                    visible={this.props.state}
                    onOk={this.handleOk.bind(this)}
                    onCancel={this.handleCancel.bind(this)}
                    >
                    <div className="watch-dialog-main">
                        <div className="account-add-cont">
                            <p className="account-add-left"><FormattedMessage id="contract-address" />:</p>
                            <div className="account-add-right">
                                <Input placeholder="contract address" onChange={this.handleAddress.bind(this)} value={address}/>
                            </div>
                        </div>
                        <div className="account-add-cont">
                            <p className="account-add-left"><FormattedMessage id="contract-name" />:</p>
                            <div className="account-add-right">
                                <Input placeholder="contract name" type="text" onChange={this.handleName.bind(this)} value={name}/>
                            </div>
                        </div>
                        <div className="account-add-cont">
                            <p className="account-add-left"><FormattedMessage id="contract-abi" />:</p>
                            <div className="account-add-right">
                                <TextArea placeholder="contract abi " rows={4} onChange={this.handleAbi.bind(this)} value={abi}/>
                            </div>
                        </div>
                    </div>
                </Modal>     
            </div>
		);
	};
}

export default injectIntl(ContractWatch);