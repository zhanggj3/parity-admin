import React from 'react';
import { Modal,Input,message,Spin,Checkbox } from 'antd';
import web3 from '../../utils/web3';
import config from '../../utils/config';
import {formatterFrom0x} from '../../utils/0xExchange';
import {getStorage} from '../../utils/storage';
import {getPrivateKey} from '../../utils/api';
import { injectIntl,FormattedMessage } from 'react-intl';
import async from 'async';
const CheckboxGroup = Checkbox.Group;



class ManagementRoleAdd extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name:'',
            from:'',
            password:'',
            loading:false,
            timerID:'',
            permissionList:[],
            permissionCheck:[],
            defaultValue:[],
            state:false
        }
    }

    componentWillMount(){
        let defaultAccount = getStorage("defaultAccount");
        if(defaultAccount && defaultAccount !== ''){
            defaultAccount = JSON.parse(defaultAccount);
			this.setState({from:defaultAccount.address});
        }
        const {name,permissions} = this.props;
        if(name && name !== ''){
            this.setState({name:name,state:true});
        }else{
            this.setState({name:''});
        }
        if(permissions && permissions !== ''){
            this.getPermissionList(true);
            this.setState({defaultValue:permissions.split(",")});
        }else{
            this.setState({defaultValue:[]});
            this.getPermissionList(false);
        }
        
    }

    getPermissionList(state){
		let that = this;
		let params = config.contract.permission_management;
		let permContract = new web3.appchain.Contract(params.abi,params.addr);
		let params2 = config.contract.permission;
		this.setState({permissionList:[]});			
		async.waterfall([
			function(callback){
				let accountData = [];
				permContract.methods.listPermissions().call().then((list)=>{
					async.eachSeries(list,function(item,eachCallback){
						let permNameContract = new web3.appchain.Contract(params2.abi,item);
						permNameContract.methods.queryName().call().then((name)=>{
							let nameString = web3.utils.hexToUtf8(name);
							var obj = {
								value:item,
                                label:nameString,
                                disabled:state
							}
							accountData.push(obj);
							eachCallback();
						})
					},function(err){
						callback(err,accountData);
					})
				})
			}],function(err,accountData){
			if(!err){
				that.setState({permissionList:accountData});
			}else{
				message.error(err);
			}
		})
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
        let params = config.contract.role_management;
        let contract = new web3.appchain.Contract(params.abi,params.addr);
        let name = web3.utils.toHex(this.state.name);
        let permissionCheck = that.state.permissionCheck;
        this.getSignTransactionData().then((data)=>{
            if(that.props.name && that.props.name !== ''){
                contract.methods.updateRoleName(that.props.address,name).send(data).then((result)=>{
                    web3.listeners.listenToTransactionReceipt(result.hash).then((data)=>{
                        if(data.errorMessage && data.errorMessage !== ''){
                            that.setState({loading:false}); 
                            message.error(data.errorMessage); 
                        }else{
                            that.props.closeWatch();
                            that.props.freshData();
                            message.success("ROLE UPDATE SUCCESS!"); 
                            that.setState({loading:false}); 
                        }
                    }); 
                })
            }else{
                contract.methods.newRole(name,permissionCheck).send(data).then((result)=>{
                    web3.listeners.listenToTransactionReceipt(result.hash).then((data)=>{
                        if(data.errorMessage && data.errorMessage !== ''){
                            that.setState({loading:false}); 
                            message.error(data.errorMessage); 
                        }else{
                            that.props.closeWatch();
                            that.props.freshData();
                            message.success("ROLE ADD SUCCESS!"); 
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

    onChange(checkedValues) {
        this.setState({permissionCheck:checkedValues});
    }

	render() {
        const {name,password,loading,from,permissionList,defaultValue,state} = this.state;

        const container = (
            <div className="watch-dialog-main">
                <div className="account-add-cont">
                    <p className="account-add-left"><FormattedMessage id="role-add-name" />:</p>
                    <div className="account-add-right">
                        <Input placeholder="Name Input " onChange={this.handleName.bind(this)} value={name}/>
                    </div>
                </div>
                <div className="account-add-cont" style={{display: (state===true) ? "block" : "none"}}>
                    <p className="account-add-left"><FormattedMessage id="role-address" />:</p>
                    <div className="account-add-right">
                        <p style={{lineHeight:"32px"}}>{this.props.address}</p>
                    </div>
                </div>
                <div className="account-add-cont">
                    <p className="account-add-left"><FormattedMessage id="permission-list" />:</p>
                    <div className="account-add-right">
                        <CheckboxGroup style={{lineHeight:"32px"}} options={permissionList} defaultValue={defaultValue} onChange={this.onChange.bind(this)} />
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
                    title={this.props.intl.formatMessage({id:"role-add-edit"})}
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

export default injectIntl(ManagementRoleAdd);