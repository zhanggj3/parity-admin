import React, { Component } from 'react'
import {Table,Input,Button,message} from 'antd';
import config from '../../utils/config';
import web3 from '../../utils/web3';
import ManagementPermissionAdd from '../ManagementRolesAdd';
import ManagementDelete from '../ManagementDelete';
import async from 'async';
import { injectIntl,FormattedMessage } from 'react-intl';
import './index.css';


class ManagementRole extends Component {
	constructor(){
		super();
		this.state = {
            search:require("../../image/search.png"),
			closeSearch:require("../../image/permission-closesearch.png"),
			permAddState:false,
			permissionList:[],
			num:'',
			account:'',
			loading:true,
			name:'',
			permissions:'',
			address:''
		}
	}
	
	componentWillMount(){
		this.getPermissionList();
	}

	getPermissionList(){
		let that = this;
		let params = config.contract.role_management;
		let roleContract = new web3.appchain.Contract(params.abi,params.addr);
		let params2 = config.contract.role;
		this.setState({permissionList:[]});			
		async.waterfall([
			function(callback){
				let accountData = [];
				roleContract.methods.listRoles().call().then((list)=>{
					async.eachSeries(list,function(item,eachCallback){
						let roleNameContract = new web3.appchain.Contract(params2.abi,item);
						roleNameContract.methods.queryName().call().then((name)=>{
							let nameString = web3.utils.hexToUtf8(name);
							roleNameContract.methods.queryPermissions().call().then((permissions)=>{
								that.permissionName(permissions).then((permName)=>{
									let obj = {
										address:item,
										name:nameString,
										permissions:permissions.join(","),
										permissionsName:permName.join(",")
									}
									accountData.push(obj);
									eachCallback();
								})
							})
						})
					},function(err){
						callback(err,accountData);
					})
				})
			}],function(err,accountData){
			if(!err){
				that.setState({permissionList:accountData,num:accountData.length,loading:false});
			}else{
				message.error(err);
			}
		})
	}

	getListName(item){
		// return new Promise((resolve)=>{
			let params3 = config.contract.permission;
			let permContract = new web3.appchain.Contract(params3.abi,item);
			return permContract.methods.queryName().call().then((name)=>{
				let permnameString = web3.utils.hexToUtf8(name);
				return permnameString;
			})
		// })
	}

	permissionName(data){
		if(data && data.length>0){
			return Promise.all(data.map(this.getListName)).then((res)=>{
				return res;
			})
		}
	}

	showPermAdd(){
		this.setState({permAddState:true,name:'',permissions:''})
	}

	closePermAdd(){
		this.setState({permAddState:false})
	}

	handleAccount(event){
		this.setState({account:event.target.value});
	}

	search(e){
		if(e.keyCode === 13){
			if(this.state.account === ''){
				this.getPermissionList();
			}else{
				let accountFilter = this.state.permissionList.filter((item)=>{return (item.address === this.state.account)});
				this.setState({permissionList:accountFilter});
			}
			
		}
	}

	clearSearch(){
		this.setState({account:''});
		this.getPermissionList();
	}

	editRole(record){
		this.setState({permAddState:true,name:record.name,permissions:record.permissions,address:record.address})
	}

	deleteRole(record){
		this.setState({deleteState:true,deleteAddress:record.address});
	}

	closeDialog(){
		this.setState({deleteState:false});
	}

	render() {
        const {search,closeSearch,permAddState,permissionList,num,account,loading,name,permissions,address,deleteState,deleteAddress} = this.state;

		const columns = [
			{
				title: this.props.intl.formatMessage({id:"role-name"}),
				dataIndex: 'address',
				key: 'address',
				align:'center',
			}, 
			{
				title: this.props.intl.formatMessage({id:"permission-describe"}),
				dataIndex: 'name',
				key: 'name',
				align:'center',
			}, 
			{
				title: this.props.intl.formatMessage({id:"role-permission-num"}),
				dataIndex: 'permissionsName',
				key: 'permissionsName',
				align:'center',
				width:"400px"
			},
			{
				title: this.props.intl.formatMessage({id:"node-operation"}),
				key: 'action',
				align:'center',
				render: (text, record) => (
					<div>
						<span onClick={this.editRole.bind(this,record)} style={{color:"#6753FF",cursor:"pointer"}}>{this.props.intl.formatMessage({id:"edit"})}</span>&nbsp;|&nbsp;
						<span onClick={this.deleteRole.bind(this,record)} style={{color:"#FF6176",cursor:"pointer"}}>{this.props.intl.formatMessage({id:"account-delete"})}</span>
					</div>
				  ),
			}
		];

		const permissionAdd = permAddState === true ? (
            <ManagementPermissionAdd
                state={permAddState}
				closeWatch={this.closePermAdd.bind(this)}
				freshData={this.getPermissionList.bind(this)}
				name={name}
				permissions={permissions}
				address={address}
                >
            </ManagementPermissionAdd>
		):''
		
		const deleteDialog = deleteState === true ? (
			<ManagementDelete
				state={deleteState}
				address={deleteAddress}
				closeWatch={this.closeDialog.bind(this)}
				freshData={this.getPermissionList.bind(this)}
				type="role">
			</ManagementDelete>
		):''
		
		return (
			<div className="management-accountList">
                <div className="management-accountList-header">
                    <p className="management-accountList-title"><FormattedMessage id="roleManagementNum" />:{num}</p>
                    <div className="management-accountList-search">
                        <img className="management-accountList-img" src={search} alt="" />
                        <Input onKeyDown={this.search.bind(this)} type="text" onChange={this.handleAccount.bind(this)} placeholder={this.props.intl.formatMessage({id:"search-role"})} value={account} />
                        <img onClick={this.clearSearch.bind(this)} className="management-accountList-close" src={closeSearch} alt="" />
                    </div>
                    <Button onClick={this.showPermAdd.bind(this)} className="management-accountList-button"><FormattedMessage id="role-create" /></Button>
				</div>
				<div className="management-nodelist-cont">
					<Table loading={loading} rowKey={record => record.address} className="management-nodelist-table" columns={columns} dataSource={permissionList} />
				</div>

				{permissionAdd}
				{deleteDialog}
			</div>
			
		);
	}
}

export default injectIntl(ManagementRole);
