import React, { Component } from 'react';
// import AccountOverview from '../AccountOverview';
// import AccountOverviewSend from '../AccountOverviewSend';
import {Link} from 'react-router-dom';
import './index.css';

class Home extends Component {
	constructor(){
		super();
		this.state = {
			accountState:true,
			currentIndex:0,
			list:[
				{
					label:"ACCOUNT",
					id:0,
					path:'/account'
				},
				{
					label:"SEND",
					id:1,
					path:'/send'
				}
			],
			title:"ACCOUNT OVERVIEW",
			state:true
		}
	}

	changeAccountState(address){
		this.setState({accountState:false,clickAddress:address});
	}

	handleAccount(item){
		if(item.id === 1){
			this.setState({currentIndex:1,accountState:false,title:"SEND"});
		}else{
			this.setState({currentIndex:0,state:true,accountState:true,title:"ACCOUNT OVERVIEW"});
		}
	}

	exchangeState(){
		this.setState({state:false});
	}

	render() {
		const {list,currentIndex,title} = this.state;

		// let accountText = accountState === true?(
		// 	<AccountOverview state={state} exchange={this.exchangeState.bind(this)}></AccountOverview>
		// ):(
		// 	<AccountOverviewSend></AccountOverviewSend>
		// )

		const List = list.length>0 ? list.map((item)=>(
            <li key={item.id} className={item.id===currentIndex?"active":null}>
				<Link to={item.path}>{item.label}</Link>
            </li>
        )):''

		return (
			<div className="account">
				<div className="account-top">
					<p className="account-top-tips">{title}</p>
					<ul className="account-top-ul">
						{List}
					</ul>
				</div>
				<div className="account-main">
					{/* {accountText} */}
					{this.props.children}
					
				</div>
			</div>
		);
	}
}

export default Home;
