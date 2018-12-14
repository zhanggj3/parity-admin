import React, { Component } from 'react'
import {Table} from 'antd';
import web3 from '../../utils/web3';
import config from '../../utils/config';
import ManagementDelete from '../ManagementDelete';
import async from 'async';
import { injectIntl,FormattedMessage } from 'react-intl';
import './index.css';


class ManagementNodelist extends Component {
	constructor(){
		super();
		this.state = {
			blockNumber:'',
			chainId:'',
			version:'',
			peerTotalCount:'',
			peerCount:'',
			blockTime:'',
			nodeList:[],
			loading:true,
			password:'',
			deleteAddress:'',
			deleteState:false
		}
	}
	
	componentWillMount() {
		this.getBlockNumber();
		this.getMetaData();
		this.getPeerCount();
		this.getContract();
		let time = new Date();
		this.setState({blockTime:time.toLocaleString()});
	}

	getBlockNumber(){
		web3.appchain.getBlockNumber().then((number)=>{
			this.setState({blockNumber:number});
		})
	}

	getContract(){
		let that = this;
		let params = config.contract.node_manager;
		let contract = new web3.appchain.Contract(params.abi,params.addr);
		async.waterfall([
            function(callback){
                let accountData = [];
                that.getNodeList().then((nodelists)=>{
                    async.eachSeries(nodelists,function(nodeItem,eachCallback){
                        contract.methods.getStatus(nodeItem).call().then((state)=>{
							var obj = {
								address:nodeItem,
								status:state
							}
                            accountData.push(obj);
                            eachCallback();
                        })
                    },function(err){
                        callback(err,accountData);
                    })
                })
            }],function(err,nodeList){
            if(!err){
				contract.methods.listStake().call().then((data)=>{
					data.map((item,index)=>{
						nodeList[index].stake = item;
						return true;
					})
					that.setState({nodeList:nodeList,loading:false});
				})
            }
        })

		
	}

	getNodeList(){
		return new Promise((resolve)=>{
			let params = config.contract.node_manager;
			let contract = new web3.appchain.Contract(params.abi,params.addr);
			contract.methods.listNode().call().then((data)=>{
				resolve(data);
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
			this.setState({chainId:data.chainIdV1,version:data.version,peerTotalCount:count});
		})
	}

	handlePass(event){
		this.setState({password:event.target.value});
	}

	deleteNode(record){
		this.setState({deleteAddress:record.address,deleteState:true});
	}

	closeDialog(){
		this.setState({deleteState:false});
	}

	render() {
		const {blockNumber,chainId,version,peerTotalCount,blockTime,peerCount,nodeList,loading,deleteAddress,deleteState} = this.state;
		const columns = [
			{
				title: this.props.intl.formatMessage({id:"node-name"}),
				dataIndex: 'address',
				key: 'address',
				align:'center',
			}, 
			{
				title: this.props.intl.formatMessage({id:"node-percent"}),
				dataIndex: 'stake',
				key: 'stake',
				align:'center'
			}, 
			{
				title: this.props.intl.formatMessage({id:"node-status"}),
				dataIndex: 'status',
				key: 'status',
				align:'center',
				render:(text, record)=>(
					<div>
						<p style={{display:text === "1"? "block":"none"}}><span style={{display:"inline-block",width:"10px",height:"10px",borderRadius:"5px",backgroundColor:"#3EDDDF",marginRight:"5px"}}></span>正常</p>
						<p style={{display:text === "0"? "block":"none"}}><span style={{display:"inline-block",width:"10px",height:"10px",borderRadius:"5px",backgroundColor:"#FF6176",marginRight:"5px"}}></span>掉线</p>
					</div>
				)
			},
			{
				title: this.props.intl.formatMessage({id:"node-operation"}),
				key: 'action',
				align:'center',
				render: (text, record) => (
					<span style={{color:"#FF6176",cursor:"pointer"}} onClick={this.deleteNode.bind(this,record)}>
						<FormattedMessage id="account-delete" />
					</span>
				  ),
			}
		];

		const deleteDialog = deleteState === true ? (
			<ManagementDelete
				state={deleteState}
				address={deleteAddress}
				closeWatch={this.closeDialog.bind(this)}
				freshData={this.getContract.bind(this)}
				type="node">
			</ManagementDelete>
		):''
		
		return (
			<div className="management-nodelist">
                <div className="management-nodelist-header">
					<ul className="nodelist-header-left">
						<li>
							<p className="nodelist-lefttab"><FormattedMessage id="current-height" /></p>
							<p className="nodelist-righttab">{blockNumber}</p>
						</li>
						<li>
							<p className="nodelist-lefttab"><FormattedMessage id="verify-height" /></p>
							<p className="nodelist-righttab">{blockNumber}</p>
						</li>
						<li>
							<p className="nodelist-lefttab"><FormattedMessage id="block-time" /></p>
							<p className="nodelist-righttab">{blockTime}</p>
						</li>
					</ul>
					<ul className="nodelist-header-right">
						<li>
							<p className="nodelist-lefttab"><FormattedMessage id="mainChainId" /></p>
							<p className="nodelist-righttab">{chainId}</p>
						</li>
						<li>
							<p className="nodelist-lefttab"><FormattedMessage id="version" /></p>
							<p className="nodelist-righttab">{version}</p>
						</li>
						<li>
							<p className="nodelist-lefttab"><FormattedMessage id="peerCount" /></p>
							<p className="nodelist-righttab">{peerCount+1}/{peerTotalCount}</p>
						</li>
					</ul>
				</div>
				<div className="management-nodelist-cont">
					<Table loading={loading} rowKey={record => record.address} className="management-nodelist-table" columns={columns} dataSource={nodeList} />
				</div>
				{deleteDialog}
			</div>
			
		);
	}
}

export default injectIntl(ManagementNodelist);
