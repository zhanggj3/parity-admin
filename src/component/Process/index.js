import React, { Component } from 'react';
import './index.css';

class Process extends Component {
    constructor() {
        super();
        this.state = {
            min:21000,
            max:2684354,
            defaultValue:21000,
            multiple:1,
            gas:21000
        }
    }

    componentDidMount(){
        if(this.props.defaultGas > this.state.max){
            this.setState({defaultValue:this.state.max,gas:this.state.max},()=>{
                let total = this.state.gas * this.state.multiple;
                this.props.getGas(total);
            });
        }else if(this.props.defaultGas < this.state.min){
            this.setState({defaultValue:this.state.min,gas:this.state.min},()=>{
                let total = this.state.gas * this.state.multiple;
                this.props.getGas(total);
            });
        }else{
            this.setState({defaultValue:this.props.defaultGas,gas:this.props.defaultGas},()=>{
                let total = this.state.gas * this.state.multiple;
                this.props.getGas(total);
            });
        }
    }

    componentWillReceiveProps(nextProps){
        const {defaultGas} = nextProps;
        if(defaultGas !== this.state.defaultValue){
            this.setState({defaultValue:defaultGas,gas:defaultGas},()=>{
                let total = this.state.gas * this.state.multiple;
                this.props.getGas(total);
            });
        }
    }

    percent(event){
        let num = Number(event.target.value);
        let percent = (num / (this.state.max - this.state.min))*100;
        let range = document.getElementById("range");
        range.style.background = "linear-gradient(to right, #3EDDDF, #fff "+ percent + "%, #fff)";
        this.setState({gas:num},()=>{
            let total = num * this.state.multiple;
            this.props.getGas(total);
        })
    }

    getMulptiple(event){
        let times = event.target.value;
        if(times.length > 2 && times !== '100') {
            return;
        }
        if(!times || times === '' || times === '0'){
            times = 1;
        }
        this.setState({multiple:times},()=>{
            let total = this.state.gas * this.state.multiple;
            this.props.getGas(total);
        })
    }

    render() {
        const {min,max,defaultValue,multiple} = this.state;
        return (
            <div className="process">
                <input id="range" type="range" defaultValue={defaultValue} min={min} max={max} onChange={this.percent.bind(this)} />
                &nbsp;x&nbsp;<input type="number" onChange={this.getMulptiple.bind(this)} value={multiple} style={{width:"30px",border:"1px solid #D8D8D8",borderRadius:"4px"}} />
            </div>
        );
    }
}

export default Process;