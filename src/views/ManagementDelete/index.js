import React from 'react';
import { Modal,Input,message,Spin } from 'antd';
import web3 from '../../utils/web3';
import config from '../../utils/config';
import {getStorage} from '../../utils/storage';
import {getTransactionData} from '../../utils/transactionData';
import { injectIntl,FormattedMessage } from 'react-intl';


class ManagementDelete extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            password:'',
            from:'',
            loading:false,
            timerID:''
        }
    }

    componentWillMount(){
        let defaultAccount = getStorage("defaultAccount");
        if(defaultAccount && defaultAccount !== ''){
            defaultAccount = JSON.parse(defaultAccount);
			this.setState({from:defaultAccount.address});
        }
    }

    handleOk(e) {
		if(!this.state.password || this.state.password === ''){
            message.warning("The password should not be Empty!");
            return;
        }
        this.setState({loading:true});
        
        if(this.props.type === "node"){
            this.setState({timerID:setInterval(() => this.sendResult(),1000)});
        }

        if(this.props.type === "permission"){
            this.setState({timerID:setInterval(() => this.sendPermissionResult(),1000)});
        }

        if(this.props.type === "role"){
            this.setState({timerID:setInterval(() => this.sendRoleResult(),1000)});
        }

        // this.setState({timerID:setInterval(() => this.sendResult(),1000)});

        
    }

    sendResult(){
        let that = this;
        clearInterval(that.state.timerID);
		let params = config.contract.node_manager;
		let contract = new web3.appchain.Contract(params.abi,params.addr);
        getTransactionData(that.state.from,that.state.password).then((data)=>{
            contract.methods.deleteNode(that.props.address).send(data).then((result)=>{
                web3.listeners.listenToTransactionReceipt(result.hash).then((data)=>{
                    if(data.errorMessage && data.errorMessage !== ''){
                        that.setState({loading:false}); 
                        message.error(data.errorMessage); 
                    }else{
                        that.props.closeWatch();
                        that.props.freshData();
                        message.success("Node Delete Success!");
                        that.setState({loading:false}); 
                    }
                }); 
            }).catch((err)=>{
                message.error(err.message);
            })
        })
    }

    sendPermissionResult(){
        let that = this;
        clearInterval(that.state.timerID);
		let params = config.contract.permission_management;
		let contract = new web3.appchain.Contract(params.abi,params.addr);
        getTransactionData(that.state.from,that.state.password).then((data)=>{
            contract.methods.deletePermission(that.props.address).send(data).then((result)=>{
                web3.listeners.listenToTransactionReceipt(result.hash).then((data)=>{
                    if(data.errorMessage && data.errorMessage !== ''){
                        that.setState({loading:false}); 
                        message.error(data.errorMessage); 
                    }else{
                        that.props.closeWatch();
                        that.props.freshData();
                        message.success("Permission Delete Success!");
                        that.setState({loading:false}); 
                    }
                }); 
            }).catch((err)=>{
                message.error(err.message);
            })
        })
    }

    sendRoleResult(){
        let that = this;
        clearInterval(that.state.timerID);
		let params = config.contract.role_management;
		let contract = new web3.appchain.Contract(params.abi,params.addr);
        getTransactionData(that.state.from,that.state.password).then((data)=>{
            contract.methods.deleteRole(that.props.address).send(data).then((result)=>{
                web3.listeners.listenToTransactionReceipt(result.hash).then((data)=>{
                    if(data.errorMessage && data.errorMessage !== ''){
                        that.setState({loading:false}); 
                        message.error(data.errorMessage); 
                    }else{
                        that.props.closeWatch();
                        that.props.freshData();
                        message.success("Role Delete Success!");
                        that.setState({loading:false}); 
                    }
                }); 
            }).catch((err)=>{
                message.error(err.message);
            })
        })
    }

    handlePass(event){
        this.setState({password:event.target.value});
    }
    
    handleCancel(e) {
        this.props.closeWatch();
    }

	render() {
        const {password,loading} = this.state;

        const container = (
            <div className="watch-dialog-main">
                <div className="account-add-cont">
                    <p style={{textAlign:"center",fontSize:"15px"}}>Do you Want to delete the {this.props.type} "{this.props.address}"?</p>
                </div>
                
                <div className="account-add-cont">
                    <p className="account-add-left"><FormattedMessage id="account-password" />:</p>
                    <div className="account-add-right">
                        <Input type="password" placeholder="password " onChange={this.handlePass.bind(this)} value={password}/>
                    </div>
                </div>
            </div>
        )
        return (
            <div className="contract-watch-dialog">
                <Modal
                    title={this.props.intl.formatMessage({id:"delete-confirm"})}
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

export default injectIntl(ManagementDelete)