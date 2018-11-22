import React from 'react';
import { Modal,Input,message,Spin } from 'antd';
import {getStorage} from '../../utils/storage';
import {getPrivateKey} from '../../utils/api';
import {formatterFrom0x,formatterTo0x} from '../../utils/0xExchange';
const FileSaver = require('file-saver');

export default class Addaccount extends React.Component {
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
        if(!this.state.checkPassword || this.state.checkPassword === ''){
            message.warning('VERIFY YOUR PASSWORD!');
            return;
        }
        if(this.state.checkPassword !== this.state.password) {
            message.warning('PASSWORD INCONSISTENT!');
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
            console.log(data);
            let keyStore = that.getKeyStore(that.props.address);
            // let storeObj = JSON.parse(keyStore);
            keyStore.privateKey = formatterTo0x(data);
            let exportData = JSON.stringify(keyStore);
            // let blob = new Blob([exportData], {type: "text/plain;charset=utf-8"});
            // FileSaver.saveAs(blob, "keyStore.txt");
            var file = new File([exportData], "keyStore.txt", {type: "text/plain;charset=utf-8"});
            FileSaver.saveAs(file);
            this.props.callbackParent();
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
        this.props.callbackParent();
    }
	render() {
        const {password,checkPassword,loading} = this.state;
        let warnigTips = (password === checkPassword) ? 
        (<span></span>):(<span className="warning-tips">*the supplied passwords does not match</span>);

        const container = (
            <div className="addaccount-input">
                <p>{this.props.address}</p>
                <Input placeholder="password" type="password" onChange={this.handlePass.bind(this)} value={this.state.password}/>
                <Input placeholder="password repeat" type="password" onChange={this.handleCheckPass.bind(this)} value={this.state.checkPassword}/>
                {warnigTips}
            </div>
        )
        return (
            <div>
                <Modal
                    title="EXPORT ACCOUNT"
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