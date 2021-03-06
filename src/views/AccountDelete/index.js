import React from 'react';
import { Modal,Input,message,Spin } from 'antd';
import {getStorage} from '../../utils/storage';
import {getPrivateKey} from '../../utils/api';
import {formatterFrom0x} from '../../utils/0xExchange';
import {deleteStorage,deleteItem} from '../../utils/storage';
import { injectIntl,FormattedMessage } from 'react-intl';


class AccountExport extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            password:'',
            checkPassword:'',
            loading:false,
            timerID:''
        }
    }
    handlePass(event){
        this.setState({password:event.target.value});
    }
    
    handleCheckPass(event) {
        this.setState({checkPassword:event.target.value});
    }

    getKeyStore(address){
        let formAddress = formatterFrom0x(address);
        let keyStores = getStorage("keyStore");
        keyStores = JSON.parse(keyStores);
        for(let i=0;i<keyStores.length;i++){
            if(keyStores[i].address === formAddress){
                return keyStores[i];
            }else{
                continue;
            }
        }
        return {};
    }

    getKey(){
        let that = this;
        return new Promise((resolve, reject) => {
            let keyStore = that.getKeyStore(that.props.address);
            let data = {
                password:that.state.password,
                keyStore:keyStore,
            }
            getPrivateKey(data).then((key)=>{
                resolve(key);
            }).catch((err)=>{
                reject(err.message);
            })
        })
    }

    handleOk(e) {
        
        if(!this.state.password || this.state.password === ''){
            message.warning('WRITE YOUR PASSWORD!');
            return;
        }

        this.setState({loading:true});
        this.setState({timerID:setInterval(() => this.exportAccount(),1000)});
        // let mnemonicPhrase = pkutils.getMnemonic();
        // this.setState({mnemonicPhrase:mnemonicPhrase,mnemonicState:true});
    }

    exportAccount(){
        let that = this;
        clearInterval(this.state.timerID);
        that.getKey().then((data)=>{
            let defaultAccount = getStorage("defaultAccount");
            if(defaultAccount && defaultAccount !== ''){
                defaultAccount = JSON.parse(defaultAccount);
                if(defaultAccount.address === that.props.address){
                    deleteStorage("keyStore",formatterFrom0x(that.props.address),"address");
                    deleteItem("defaultAccount");
                    message.success("ACCOUNT DELETE SUCCESS!");
                    window.location.reload();
                }else{
                    deleteStorage("keyStore",formatterFrom0x(that.props.address),"address");
                    message.success("ACCOUNT DELETE SUCCESS!");
                    that.props.callbackParent();
                }
            }else{
                deleteStorage("keyStore",formatterFrom0x(that.props.address),"address");
                message.success("ACCOUNT DELETE SUCCESS!");
                that.props.callbackParent();
            }
        }).catch((err)=>{
            that.setState({loading:false});
            clearInterval(that.state.timerID);
            message.error(err);
        })
    }

    componentWillUnmount() {
        clearInterval(this.state.timerID);
    }
    
    handleCancel(e) {
        this.props.closeDialog();
    }
	render() {
        const {password,loading} = this.state;
        // let warnigTips = (password === checkPassword) ? 
        // (<span></span>):(<span className="warning-tips">*<FormattedMessage id="password-match" /></span>);

        const container = (
            <div className="addaccount-input">
                <div className="account-add-cont">
                    <p className="account-add-left"><FormattedMessage id="account-address" />:</p>
                    <div className="account-add-right">
                        <span style={{lineHeight:"30px",fontSize:"15px"}}>{this.props.address}</span>
                    </div>
                </div>
                <div className="account-add-cont">
                    <p className="account-add-left"><FormattedMessage id="account-password" />:</p>
                    <div className="account-add-right">
                        <Input placeholder="password" type="password" onChange={this.handlePass.bind(this)} value={password}/>
                    </div>
                </div>
                {/* <div className="account-add-cont">
                    <p className="account-add-left"><FormattedMessage id="password-repeat" />:</p>
                    <div className="account-add-right">
                        <Input placeholder="password repeat" type="password" onChange={this.handleCheckPass.bind(this)} value={this.state.checkPassword}/>
                        {warnigTips}
                    </div>
                </div> */}
                
            </div>
        )
        return (
            <div>
                <Modal
                    title={this.props.intl.formatMessage({id:"delete-account"})}
                    visible={this.props.addState}
                    onOk={this.handleOk.bind(this)}
                    onCancel={this.handleCancel.bind(this)}
                    maskClosable={!loading}
                    cancelButtonProps={{disabled:loading}}
                    okButtonProps={{disabled:loading}}
                    >
                    <Spin spinning={loading}>{container}</Spin>
                </Modal>                
            </div>
		);
	};
}

export default injectIntl(AccountExport);