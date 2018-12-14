import React, { Component } from 'react'
import {Table,Input,message} from 'antd';
import config from '../../utils/config';
import web3 from '../../utils/web3';
import async from 'async';
import { injectIntl,FormattedMessage } from 'react-intl';
import './index.css';


class ManagementAccountList extends Component {
	constructor(){
		super();
		this.state = {
            search:require("../../image/search.png"),
			closeSearch:require("../../image/permission-closesearch.png"),
			accountList:[],
			account:'',
			num:'0'
		}
	}
	
	componentWillMount(){
		this.getList();
	}

	getList(){
		let that = this;
		
		async.waterfall([
            function(callback){
                let accountData = [];
                that.queryAccounts().then((accounts)=>{
					if(accounts && accounts.length>0){
						that.setState({num:accounts.length});
						async.eachSeries(accounts,function(account,eachCallback){
							that.getPermissions(account).then((data)=>{
								that.getRoles(account).then((role)=>{
									var obj = {
										address:account,
										permission:data.join(","),
										role:role.join(",")
									}
									accountData.push(obj);
									eachCallback();
								})
							})
						},function(err){
							callback(err,accountData);
						})
					}
                    
                }).catch((err)=>{
					message.error(err);
				})
            }],function(err,accounts){
            if(!err){
				that.setState({accountList:accounts});
            }
        })
	}

	queryAccounts(){
		return new Promise((resolve,reject)=>{
			let params = config.contract.authorization;
			let contract = new web3.appchain.Contract(params.abi,params.addr);
			contract.methods.queryAllAccounts().call().then((accounts)=>{
				resolve(accounts);
			}).catch((err)=>{
				reject(err.message);
			})
		})
	}

	getPermissions(account){
		return new Promise((resolve,reject)=>{
			let params = config.contract.authorization;
			let accountContract = new web3.appchain.Contract(params.abi,params.addr);
			let params2 = config.contract.permission;
			// let permContract = new web3.appchain.Contract(params2.abi,params2.addr);
			let names = [];
			accountContract.methods.queryPermissions(account).call().then((data)=>{
				data.map((item)=>{
					let permContract = new web3.appchain.Contract(params2.abi,item);
					permContract.methods.queryName().call().then((name)=>{
						let nameString = web3.utils.hexToUtf8(name);
						names.push(nameString);
					})
					return true;
				})
				resolve(names);
			})
		})
		
	}

	getRoles(account){
		return new Promise((resolve,reject)=>{
			let params1 = config.contract.role_auth;
			let roleContract = new web3.appchain.Contract(params1.abi,params1.addr);
			let params2 = config.contract.role;
			// let permContract = new web3.appchain.Contract(params2.abi,params2.addr);
			let names = [];
			roleContract.methods.queryRoles(account).call().then((data)=>{
				data.map((item)=>{
					let permContract = new web3.appchain.Contract(params2.abi,item);
					permContract.methods.queryName().call().then((name)=>{
						let nameString = web3.utils.hexToUtf8(name);
						names.push(nameString);
					})
					return true;
				})
				resolve(names);
			})
		})
	}

	search(e){
		if(e.keyCode === 13){
			if(this.state.account === ''){
				this.getList();
			}else{
				let accountFilter = this.state.accountList.filter((item)=>{return (item.address === this.state.account)});
				this.setState({accountList:accountFilter});
			}
			
		}
		
	}

	handleAccount(e){
		this.setState({account:e.target.value});
	}

	clearSearch(){
		this.setState({account:''});
		this.getList();
	}

	render() {
		const {search,closeSearch,accountList,account,num } = this.state;
		
		const columns = [
			{
				title: this.props.intl.formatMessage({id:"account-name"}),
				dataIndex: 'address',
				key: 'address',
				align:'center',
			}, 
			{
				title: this.props.intl.formatMessage({id:"account-permissions"}),
				dataIndex: 'permission',
				key: 'permission',
				align:'center',
				width:'400px'
			}, 
			{
				title: this.props.intl.formatMessage({id:"account-roles"}),
				dataIndex: 'role',
				key: 'role',
				align:'center',
				width:'300px'
			},
			// {
			//     title: '操作',
			//     key: 'action',
			//     align:'center',
			//     render: (text, record) => (
			//         <span>
			//             Delete
			//         </span>
			//       ),
			// }
		];
		
		return (
			<div className="management-accountList">
                <div className="management-accountList-header">
						<p className="management-accountList-title"><FormattedMessage id="userManagementNum" />:{num}</p>
                    <div className="management-accountList-search">
                        <img className="management-accountList-img" src={search} alt="" />
                        <Input onKeyDown={this.search.bind(this)} type="text" onChange={this.handleAccount.bind(this)} placeholder={this.props.intl.formatMessage({id:"search-accounts"})} value={account} />
                        <img onClick={this.clearSearch.bind(this)} className="management-accountList-close" src={closeSearch} alt="" />
                    </div>
				</div>
				<div className="management-nodelist-cont">
					<Table rowKey={record => record.address} className="management-nodelist-table" columns={columns} dataSource={accountList} />
				</div>
			</div>
			
		);
	}
}

export default injectIntl(ManagementAccountList);
