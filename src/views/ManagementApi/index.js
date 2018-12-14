import React, { Component } from 'react';
import {apiUrl} from '../../utils/global';
import './index.css';

class ManagementApi extends Component {
	constructor(){
		super();
		this.state = {
		}
    }

	render() {

		return (
			<div className="management-api">
                <iframe title="Api" style={{border:0,width:"100%",height:"100%",}} src={apiUrl} />
			</div>
			
		);
	}
}

export default ManagementApi;
