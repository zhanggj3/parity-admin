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
import './App.css';

class App extends Component {
	render() {
		return (
			<div className="App">
				<div className="side" id="app-side">
					<Side></Side>
				</div>
				<div className="content">
					<Header></Header>
					<div className="main">
						{this.props.children}
						<Route exact path='/' component={AccountOverview}/>
						<Route path='/send' component={AccountOverviewSend}/>
						<Route path='/contract' component={Contract}/>
						<Route path='/deploy' component={ContractDeploy}/>
						<Route path='/watch' component={ContractWatchinfo}/>
						<Route path='/execute' component={ContractExecute}/>
						<Route path='/management' component={Management}/>
					</div>
				</div>
			</div>
			
		);
	}
}

export default App;
