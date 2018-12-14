import React from 'react';
import { Modal,Input,message,Checkbox,Spin,Select,Button } from 'antd';
import {createAccountByPrivate,getPrivateKey} from '../../utils/api';
import {replaceStorage} from '../../utils/storage';
// import {formatterFrom0x} from '../../utils/0xExchange';
import {getPrivateKeyFromMnemonic} from '../../utils/keyMnemonic';
import { injectIntl,FormattedMessage } from 'react-intl';
import {checkMnemonic} from '../../utils/keyMnemonic';
// import TextArea from 'antd/lib/input/TextArea';
const Option = Select.Option;
const { TextArea } = Input;

class AccountImport extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            password:'',
            checkPassword:'',
            privateKey:'',
            loading:false,
            timerID:'',
            name:'',
            type:"1",
            memoriziWord:'',
            keystore:'',
            showState:false
        }
    }
    handlePass(event){
        this.setState({password:event.target.value});
    }

    handleMemorizeWord(event){
        this.setState({memoriziWord:event.target.value});
    }
    
    handleCheckPass(event) {
        this.setState({checkPassword:event.target.value});
    }
    handlePrivate(event){
        this.setState({privateKey:event.target.value});
    }
    handleName(event){
        this.setState({name:event.target.value});
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
        if(that.state.type && that.state.type === "1"){
            if(!that.state.memoriziWord || that.state.memoriziWord === ''){
                message.warning('WRITE YOUR MEMORIZING WORDS!');
                return;
            }else {
                let state = checkMnemonic(that.state.memoriziWord);
                if(!state || state === false){
                    message.warning('MEMORIZING WORDS IS NOT VALIDATE!');
                    return;
                }
            }
            this.setState({loading:true});
            this.setState({timerID:setInterval(() => this.importAccount(),1000)});
        }else if(that.state.type && that.state.type === "2"){
            if(!that.state.keystore || that.state.keystore === ''){
                message.warning('IMPORT YOUR KEYSTORE!');
                return;
            }
            this.setState({loading:true});
            this.setState({timerID:setInterval(() => this.importKeystore(),1000)});
        }
        
        
    }

    componentWillUnmount() {
        clearInterval(this.state.timerID);
    }

    importKeystore(){
        let that = this;
        clearInterval(this.state.timerID);
        let data = {
            password:this.state.password,
            keyStore:JSON.parse(this.state.keystore)
        }
        getPrivateKey(data).then((res)=>{
            createAccountByPrivate(that.state.password,res).then(function(res){
                message.success('IMPORT ACCOUNT SUCCESS!');
                res.name=that.state.name;
                replaceStorage("keyStore",res,"address");
                that.props.freshData();
                that.props.callbackParent();
            }).catch((err)=>{
                this.setState({loading:false});
                clearInterval(this.state.timerID);
                message.error(err.message);
            })
        }).catch((err)=>{
            that.setState({loading:false});
            clearInterval(this.state.timerID);
            message.error(err.message);
        })
    }

    importAccount(){
        let that = this;
        let privateKey = getPrivateKeyFromMnemonic(that.state.memoriziWord);
        createAccountByPrivate(that.state.password,privateKey).then(function(res){
            message.success('IMPORT ACCOUNT SUCCESS!');
            res.name=that.state.name;
            replaceStorage("keyStore",res,"address");
            that.props.freshData();
            that.props.callbackParent();
        }).catch((err)=>{
            this.setState({loading:false});
            clearInterval(this.state.timerID);
            message.error(err.message);
        })
    }
    
    handleCancel(e) {
        this.props.callbackParent();
    }

    handleType(item){
        this.setState({type:item});
    }

    myfile(){
        this.refs["my_file"].click();
    }

    handleFile(){
        let that = this;
        let file = this.refs["my_file"].files[0];
        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function (e) {
            var fileText = e.target.result.split("\n");
            that.setState({keystore:fileText[0]});
        }
    }

    handleShow(e){
        if(e.target.checked && e.target.checked === true){
            this.setState({showState:true});
        }else{
            this.setState({showState:false});
        }
    }

	render() {
        const {password,checkPassword,loading,name,type,memoriziWord,keystore,showState} = this.state;
        let warnigTips = (password === checkPassword) ? 
        (<span></span>):(<span className="warning-tips">*<FormattedMessage id="password-match" /></span>);

        const container = (
            <div className="account-add-input">
                <div className="account-add-cont">
                    <p className="account-add-left"><FormattedMessage id="import-type" />:</p>
                    <div className="account-add-right">
                        <Select value={type} style={{width:"100%"}} onChange={this.handleType.bind(this)}>
                            <Option value="1"><FormattedMessage id="mnemonic-word" /></Option>
                            <Option value="2"><FormattedMessage id="import-keystore" /></Option>
                        </Select>                   
                    </div>
                </div>
                <div className="account-add-cont">
                    <p className="account-add-left"><FormattedMessage id="account-name" />:</p>
                    <div className="account-add-right">
                        <Input placeholder="account name" onChange={this.handleName.bind(this)} value={name}/>
                    </div>
                </div>
                {/* <div className="account-add-cont">
                    <p className="account-add-left">private key:</p>
                    <div className="account-add-right">
                        <Input placeholder="private key" onChange={this.handlePrivate.bind(this)} value={privateKey}/>
                    </div>
                </div> */}
                <div style={{display: (type==="1") ? "block" : "none"}} className="account-add-cont">
                    <p className="account-add-left"><FormattedMessage id="import-mnemonic" />:</p>
                    <div className="account-add-right">
                        <TextArea placeholder="Memorizing words" row={2} onChange={this.handleMemorizeWord.bind(this)} value={memoriziWord}/>
                    </div>
                </div>
                <div style={{display: (type==="2") ? "block" : "none"}} className="account-add-cont">
                    <p className="account-add-left"><FormattedMessage id="import-keystore" />:</p>
                    <div className="account-add-right">
                        <input type="file" ref="my_file" style={{display: "none"}} onChange={this.handleFile.bind(this)} />
                        <TextArea placeholder="Keystore" rows={4} disabled value={keystore}/>
                        <Button type="primary" style={{marginTop:"5px"}} onClick={this.myfile.bind(this)}><FormattedMessage id="import-keystore-button" /></Button>
                    </div>
                </div>
                <div className="account-add-cont">
                    <p className="account-add-left"><FormattedMessage id="account-password" />:</p>
                    <div className="account-add-right">
                        <Input style={{display: (showState===true) ? "block" : "none"}} placeholder="password" type="text" onChange={this.handlePass.bind(this)} value={password}/>
                        <Input style={{display: (showState===false) ? "block" : "none"}} placeholder="password" type="password" onChange={this.handlePass.bind(this)} value={password}/>
                    </div>
                </div>
                <div className="account-add-cont">
                    <p className="account-add-left"><FormattedMessage id="password-repeat" />:</p>
                    <div className="account-add-right">
                        <Input style={{display: (showState===true) ? "block" : "none"}} placeholder="password repeat" type="text" onChange={this.handleCheckPass.bind(this)} value={checkPassword}/>
                        <Input style={{display: (showState===false) ? "block" : "none"}} placeholder="password repeat" type="password" onChange={this.handleCheckPass.bind(this)} value={checkPassword}/>
                        <Checkbox className="overviewsend-checkbox" onChange={this.handleShow.bind(this)}><FormattedMessage id="password-show" /></Checkbox>
                        {warnigTips}
                    </div>
                </div>
            </div>
        )
        return (
            <div className="account-private">
                <Modal
                    title="IMPORT ACCOUNT"
                    visible={this.props.state}
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

export default injectIntl(AccountImport);