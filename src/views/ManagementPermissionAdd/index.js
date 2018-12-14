import React from 'react';
import { Modal,Input,message,Spin } from 'antd';
import web3 from '../../utils/web3';
import config from '../../utils/config';
import {formatterFrom0x} from '../../utils/0xExchange';
import {getStorage} from '../../utils/storage';
import {getPrivateKey} from '../../utils/api';
import { injectIntl,FormattedMessage } from 'react-intl';
const { TextArea } = Input;


class ManagementPermissionAdd extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            address:'',
            name:'',
            functions:'',
            from:'',
            password:'',
            loading:false,
            timerID:'',
            state:false
        }
    }

    componentWillMount(){
        let defaultAccount = getStorage("defaultAccount");
        if(defaultAccount && defaultAccount !== ''){
            defaultAccount = JSON.parse(defaultAccount);
			this.setState({from:defaultAccount.address});
        }
        const {name} = this.props;
        if(name && name !== ''){
            this.setState({name:this.props.name,state:true});
        }
    }

    handleOk(e) {
        if(!this.state.from || this.state.from === ''){
            message.warning("The Default Account should not be Empty!");
            return;
        }
		if(!this.state.name || this.state.name === ''){
            message.warning("The permission name should not be Empty!");
            return;
        }
        if(!this.props.name || this.props.name === '') {
            if(!this.state.address || this.state.address === ''){
                message.warning("The permission Address should not be Empty!");
                return;
            }
            if(!this.state.functions || this.state.functions === ''){
                message.warning("The permission functions should not be Empty!");
                return;
            }
        }
        
        this.setState({loading:true});
        this.setState({timerID:setInterval(() => this.sendResult(),1000)});
        
		// contract.methods.newPermission(name,address,functions).call().then((result)=>{
        //     if(result) {
        //         message.success("PERMISSION ADD SUCCESS!");
        //     }
        // }).catch((err)=>{
        //     message.error(err.message);
        // })
    }

    sendResult(){
        let that = this;
        clearInterval(that.state.timerID);
        let params = config.contract.permission_management;
        let contract = new web3.appchain.Contract(params.abi,params.addr);
        let name = web3.utils.toHex(this.state.name);
        let address = this.state.address.split(",");
        let functions = this.state.functions.split(",");
        this.getSignTransactionData().then((data)=>{
            if(that.props.name && that.props.name !== ''){
                contract.methods.updatePermissionName(that.props.address,name).send(data).then((result)=>{
                    web3.listeners.listenToTransactionReceipt(result.hash).then((data)=>{
                        if(data.errorMessage && data.errorMessage !== ''){
                            that.setState({loading:false}); 
                            message.error(data.errorMessage); 
                        }else{
                            that.props.closeWatch();
                            that.props.freshData();
                            message.success("PERMISSION UPDATE SUCCESS!"); 
                            that.setState({loading:false}); 
                        }
                    }); 
                })
            }else{
                contract.methods.newPermission(name,address,functions).send(data).then((result)=>{
                    web3.listeners.listenToTransactionReceipt(result.hash).then((data)=>{
                        if(data.errorMessage && data.errorMessage !== ''){
                            that.setState({loading:false}); 
                            message.error(data.errorMessage); 
                        }else{
                            that.props.closeWatch();
                            that.props.freshData();
                            message.success("PERMISSION ADD SUCCESS!"); 
                            that.setState({loading:false}); 
                        }
                    }); 
                })
            }
            
        })
    }

    getSignTransactionData(){
        return new Promise((resolve, reject) => {
            let that = this;
            let nonce = web3.utils.randomHex(6);
            web3.appchain.getBlockNumber().then((block)=>{            
                web3.appchain.getMetaData().then((data)=>{
                    that.getKey().then((key)=>{
                        let transferData = {
                            from:that.state.from,
                            privateKey:"0x"+key,
                            quota:10000000,
                            // gasPrice:that.state.gasPrice,
                            nonce:nonce,
                            chainId: Number(data.chainIdV1),
                            version: data.version,
                            validUntilBlock: block+88
                        }
                        resolve(transferData);
                        
                    })
                });
            });
            
        }); 
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
            let keyStore = that.getKeyStore(that.state.from);
            let data = {
                password:that.state.password,
                keyStore:keyStore,
            }
            getPrivateKey(data).then((key)=>{
                resolve(key);
            })
        })
    }

    handleAddress(event){
        this.setState({address:event.target.value});
    }

    handleFunc(event){
        this.setState({functions:event.target.value});
    }

    handleName(event){
        this.setState({name:event.target.value});
    }
    
    handleCancel(e) {
        this.props.closeWatch();
    }

    handlePass(event){
        this.setState({password:event.target.value});
    }

	render() {
        const {name,address,functions,password,loading,from,state} = this.state;

        const container = (
            <div className="watch-dialog-main">
                <div className="account-add-cont">
                    <p className="account-add-left"><FormattedMessage id="permission-add-name" />:</p>
                    <div className="account-add-right">
                        <Input placeholder="Name Input " onChange={this.handleName.bind(this)} value={name}/>
                    </div>
                </div>
                <div className="account-add-cont" style={{display: (state===true) ? "block" : "none"}}>
                    <p className="account-add-left"><FormattedMessage id="permission-address" />:</p>
                    <div className="account-add-right">
                        <p style={{lineHeight:"32px"}}>{this.props.address}</p>
                    </div>
                </div>
                <div className="account-add-cont" style={{display: (state===true) ? "none" : "block"}}>
                    <p className="account-add-left"><FormattedMessage id="permissions-array" />:</p>
                    <div className="account-add-right">
                        <TextArea placeholder="address Input " rows={3} onChange={this.handleAddress.bind(this)} value={address}/>
                    </div>
                </div>
                <div className="account-add-cont" style={{display: (state===true) ? "none" : "block"}}>
                    <p className="account-add-left"><FormattedMessage id="functions-array" />:</p>
                    <div className="account-add-right">
                        <TextArea placeholder="function Input " rows={3} onChange={this.handleFunc.bind(this)} value={functions}/>
                    </div>
                </div>
                <div style={{width:"100%",height:"1px",backgroundColor:"#d5d5d5",marginBottom:"20px"}}></div>
                <p style={{textAlign:"center",marginBottom:"10px"}}><FormattedMessage id="send-information" /></p>
                <div className="account-add-cont">
                    <p className="account-add-left"><FormattedMessage id="account-address" />:</p>
                    <div className="account-add-right">
                        <p style={{lineHeight:"32px"}}>{from}</p>
                    </div>
                </div>
                <div className="account-add-cont">
                    <p className="account-add-left"><FormattedMessage id="account-password" />:</p>
                    <div className="account-add-right">
                        <Input type="password" placeholder="password Input " onChange={this.handlePass.bind(this)} value={password}/>
                    </div>
                </div>
            </div>
        )
        return (
            <div className="contract-watch-dialog">
                <Modal
                    title={this.props.intl.formatMessage({id:"permission-add-edit"})}
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

export default injectIntl(ManagementPermissionAdd);