import React from 'react';
import { Modal,Input,message,Spin } from 'antd';
import web3 from '../../utils/web3';
import config from '../../utils/config';
import {getTransactionData} from '../../utils/transactionData';
import {getStorage} from '../../utils/storage';
import { injectIntl,FormattedMessage } from 'react-intl';
import './index.css';
const { TextArea } = Input;
const confirm = Modal.confirm;


class ManagementNodeadd extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            address:'',
            from:'',
            password:'',
            loading:false,
            timerID:'',
            peerCount:'',
            peerTotalCount:''
        }
    }

    componentWillMount(){
        this.getPeerCount();
        this.getMetaData();
        let defaultAccount = getStorage("defaultAccount");
        if(defaultAccount && defaultAccount !== ''){
            defaultAccount = JSON.parse(defaultAccount);
			this.setState({from:defaultAccount.address});
        }
    }

    handleOk(e) {
        
        if(!this.state.from || this.state.from === ''){
            message.warning("The Default Address should not be Empty!");
            return;
        }
        if(!this.state.address || this.state.address === ''){
            message.warning("The Node Address should not be Empty!");
            return;
        }

        if(((this.state.peerCount + 1) / (this.state.peerTotalCount + 1)) < 2/3) {
            confirm({
                title: 'Make sure your local node is open in case of consensus risk!',
                content:'If you confirm that you want to add, please click OK, or Cancel.',
                onOk() {
                    this.setState({loading:true});
                    this.setState({timerID:setInterval(() => this.sendResult(),1000)});
                }
            });
        }else{
            this.setState({loading:true});
            this.setState({timerID:setInterval(() => this.sendResult(),1000)});
        }
        
		
    }

    sendResult() {
        let that = this;
        clearInterval(that.state.timerID);
		let params = config.contract.node_manager;
        let contract = new web3.appchain.Contract(params.abi,params.addr);
        getTransactionData(this.state.from,this.state.password).then((data)=>{
            contract.methods.approveNode(this.state.address).send(data).then((result)=>{
                web3.listeners.listenToTransactionReceipt(result.hash).then((data)=>{
                    if(data.errorMessage && data.errorMessage !== ''){
                        that.setState({loading:false}); 
                        message.error(data.errorMessage); 
                    }else{
                        that.props.closeWatch();
                        message.success("Node Add Success!");
                        window.location.reload();
                        that.setState({loading:false}); 
                    }
                }); 
            }).catch((err)=>{
                message.error(err.message);
            })
        })
    }

    getPeerCount(){
		web3.appchain.peerCount().then((peer)=>{
			this.setState({peerCount:web3.utils.hexToNumber(peer)});
		})
	}

	getMetaData(){
		web3.appchain.getMetaData().then((data)=>{
			let count;
			if(data.validators && data.validators.length>0){
				count = data.validators.length;
			}else{
				count = 0;
			}
			this.setState({peerTotalCount:count});
		})
	}

    handleAddress(event){
        this.setState({address:event.target.value});
    }
    
    handleCancel(e) {
        this.props.closeWatch();
    }

    handlePass(event){
        this.setState({password:event.target.value});
    }

	render() {
        const {address,password,loading,from} = this.state;

        const container = (
            <div className="watch-dialog-main">
                <div className="account-add-cont">
                    <p className="account-add-left"><FormattedMessage id="node-address" />:</p>
                    <div className="account-add-right">
                        <TextArea placeholder="Node Address Input " rows={4} onChange={this.handleAddress.bind(this)} value={address}/>
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
                    title={this.props.intl.formatMessage({id:"node-add"})}
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

export default injectIntl(ManagementNodeadd);