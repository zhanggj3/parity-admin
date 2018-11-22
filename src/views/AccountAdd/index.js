import React from 'react';
import { Modal,Checkbox,Input,message } from 'antd';
// import pkutils from '../../utils/keyMnemonic';
import './index.css';
import MnemonicAdd from '../AccountMnemonic';

export default class Addaccount extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            password:'',
            checkPassword:'',
            mnemonicState:false,
            name:'',
            showState:false
        }
    }
    handlePass(event){
        this.setState({password:event.target.value});
    }
    
    handleCheckPass(event) {
        this.setState({checkPassword:event.target.value});
    }
    handleName(event){
        this.setState({name:event.target.value});
    }
    onChildChanged(){
        this.setState({mnemonicState:false});
        this.props.callbackParent();
    }
    freshChildData(){
        this.props.freshData();
    }
    handleOk(e) {
        
        let that = this;
        if(!that.state.name || that.state.name === ''){
            message.warning('WRITE YOUR NAME!');
            return;
        }
        if(!that.state.password || that.state.password === ''){
            message.warning('WRITE YOUR PASSWORD!');
            return;
        }
        if(!that.state.checkPassword || that.state.checkPassword === ''){
            message.warning('VERIFY YOUR PASSWORD!');
            return;
        }
        if(that.state.checkPassword !== that.state.password) {
            message.warning('PASSWORD INCONSISTENT!');
            return;
        }
        this.setState({mnemonicState:true});
    }
    
    handleCancel(e) {
        this.props.callbackParent();
    }

    handleShow(e){
        if(e.target.checked && e.target.checked === true){
            this.setState({showState:true});
        }else{
            this.setState({showState:false});
        }
    }

	render() {
        const {password,checkPassword,mnemonicState,name,showState} = this.state;
        let warnigTips = (password === checkPassword) ? 
        (<span></span>):(<span className="warning-tips">* passwords does not match</span>);

        let mnemonicDialog = (mnemonicState === true) ? 
        (<MnemonicAdd 
            name={name}
            mnemonicState={mnemonicState} 
            password={password}
            callbackParent={this.onChildChanged.bind(this)}
            freshData={this.freshChildData.bind(this)}>
        </MnemonicAdd>):(<span></span>);
        return (
            <div className="account-add">
                <Modal
                    title="CREATE ACCOUNT"
                    visible={this.props.state}
                    onOk={this.handleOk.bind(this)}
                    onCancel={this.handleCancel.bind(this)}
                    >
                    <div className="account-add-input">
                        <div className="account-add-cont">
                            <p className="account-add-left">name:</p>
                            <div className="account-add-right">
                                <Input placeholder="account name" onChange={this.handleName.bind(this)} value={this.state.name}/>
                            </div>
                        </div>
                        <div className="account-add-cont">
                            <p className="account-add-left">password:</p>
                            <div className="account-add-right">
                                <Input style={{display: (showState===true) ? "block" : "none"}} placeholder="password" type="text" onChange={this.handlePass.bind(this)} value={this.state.password}/>
                                <Input style={{display: (showState===false) ? "block" : "none"}} placeholder="password" type="password" onChange={this.handlePass.bind(this)} value={this.state.password}/>
                            </div>
                        </div>
                        <div className="account-add-cont">
                            <p className="account-add-left">repeat:</p>
                            <div className="account-add-right">
                                <Input style={{display: (showState===true) ? "block" : "none"}} placeholder="password repeat" type="text" onChange={this.handleCheckPass.bind(this)} value={this.state.checkPassword}/>
                                <Input style={{display: (showState===false) ? "block" : "none"}} placeholder="password repeat" type="password" onChange={this.handleCheckPass.bind(this)} value={this.state.checkPassword}/>
                                <Checkbox className="overviewsend-checkbox" onChange={this.handleShow.bind(this)}>Show Password</Checkbox>
                                {warnigTips}
                            </div>
                        </div>
                    </div>
                </Modal>
                {mnemonicDialog}
                
            </div>
		);
	};
}