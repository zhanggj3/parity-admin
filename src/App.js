import React, { Component } from 'react';
import {Route} from 'react-router-dom';
import Header from './component/Header';
import Side from './component/Side';
import AccountOverview from './views/AccountOverview';
import AccountOverviewSend from './views/AccountOverviewSend';
import Contract from './views/Contract';
import  ContractDeploy from './views/ContractDeploy';
import ContractWatchinfo from './views/ContractWatchInfo';
import ContractExecute from './views/ContractExecute';
import Management from './views/Management';
import Process from './component/Process';
import Browser from './views/Browser';
import { withRouter } from 'react-router';
import './App.css';

class App extends Component {

	componentDidUpdate(){
		const { location } = this.props;
		if(location.pathname && location.pathname === '/browser'){
			let main = document.getElementById("main");
			main.style.height = "100%";
		}else{
			let main = document.getElementById("main");
			main.style.height = "calc(100% - 60px)";
		}
	}

	render() {
        const { location } = this.props;

		let headDialog = location.pathname !== '/browser' ? (
			<Header></Header>
		):''

		return (
			<div className="App">
				<div className="side" id="app-side">
					<Side></Side>
				</div>
				<div className="content">
					<div className="main" id="main">
						{headDialog}
						{this.props.children}
						<Route exact path='/' component={AccountOverview}/>
						<Route path='/send' component={AccountOverviewSend}/>
						<Route path='/contract' component={Contract}/>
						<Route path='/deploy' component={ContractDeploy}/>
						<Route path='/watch' component={ContractWatchinfo}/>
						<Route path='/execute' component={ContractExecute}/>
						<Route path='/management' component={Management}/>
						<Route path='/process' component={Process}/>
						<Route path='/browser' component={Browser}/>
					</div>
				</div>
			</div>
			
		);
	}
}

export default withRouter(App);
