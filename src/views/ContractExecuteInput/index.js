import React from 'react';
import { Input } from 'antd';

export default class ContractInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inputs:[]
        }
    }
    componentWillMount() {
        this.setState({inputs:this.props.inputs});
    }

    handleParams(inputs,index,event){
        inputs[index].params = event.target.value;
        this.setState({inputs:inputs});
    }
    componentWillReceiveProps(nextProps){
        this.setState({inputs:nextProps.inputs});
    }
	render() {
        const {inputs} = this.state;

        let inputList = inputs.length?inputs.map((inputItem, index) => (
            <div key={index} className="contract-execute-item">
                <p className="contract-execute-left"><span>{inputItem.name}:{inputItem.type}</span></p>
                <div className="contract-execute-right">
                    <Input disabled={this.props.disabled} placeholder={inputItem.type} value={inputItem.params} onChange={this.handleParams.bind(this,inputs,index)}/>
                </div>
            </div>
        )):(<span></span>)

        return (
            <div style={{width:"100%"}}>
               {inputList}
            </div>
		);
	};
}