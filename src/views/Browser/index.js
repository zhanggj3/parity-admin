import React, { Component } from 'react'
import {browserUrl} from '../../utils/global';
import './index.css';

class Browser extends Component {
	constructor(){
		super();
		this.state = {
		}
    }

	render() {

		return (
			<div className="browser">
                <iframe title="Browser" style={{border:0,width:"100%",height:"100%",}} src={browserUrl}/>
			</div>
			
		);
	}
}

export default Browser;
