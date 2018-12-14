import React, { Component } from 'react';
import AccountList from '../AccountList';
import AccountInfo from '../AccountInfo';
import { createHashHistory } from 'history';
import { injectIntl } from 'react-intl';
import './index.css';

class AccountOverview extends Component {
	constructor(props){
		super(props);
		this.state = {
			accountState:true,
			clickAddress:'',
			clickName:'',
			state:true,
			title:this.props.intl.formatMessage({id:"account-overview"}),
			list:[
				{
					label:this.props.intl.formatMessage({id:"account-home"}),
					id:0,
					path:'/'
				},
				{
					label:this.props.intl.formatMessage({id:"account-send"}),
					id:1,
					path:'/send'
				}
			]
		}
	}

	changeAccountState(item){
		
		this.setState({clickAddress:item.address,clickName:item.name,state:false});
	}

	tabExchange(item){
		if(item.path === '/'){
			this.setState({state:true});
			return;
		}
		createHashHistory().replace(item.path);
	}

	toListPage(){
		this.setState({state:true});
	}

	render() {
		const {clickAddress,clickName,title,list,state} = this.state;

		let accountText = state === true?(
			<AccountList goAccountInfo={this.changeAccountState.bind(this)}></AccountList>
		):(
			<AccountInfo address={clickAddress} callback={this.toListPage.bind(this)} name={clickName}></AccountInfo>
		)

		const List = list.length>0 ? list.map((item)=>(
            <li key={item.id} onClick={this.tabExchange.bind(this,item)}>
				<span className={item.id===0?"active":null}>{item.label}</span>
            </li>
		)):''
		
		return (
			<div className="account">
				<div className="account-top">
					<ul className="account-top-ul">
						{List}
					</ul>
				</div>
				<div className="account-main">
					<p style={{display: (state===true) ? "block" : "none"}} className="account-top-tips">{title}</p>
					<div className="account-overview">
						<div className="account-overview-main">
							{accountText}
						</div>
					</div>
				</div>
			</div>
			
		);
	}
}

export default injectIntl(AccountOverview);
