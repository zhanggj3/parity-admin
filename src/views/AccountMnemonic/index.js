import React from 'react';
import { Modal, Input, message,Spin } from 'antd';
import { createAccount } from '../../utils/api';
import { pushStorage } from '../../utils/storage';
import pkutils from '../../utils/keyMnemonic';
import './index.css';
// const keythereum = require("keythereum");

export default class Addaccount extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mnemonicPhrase: '',
            mnemonicPhraseCheck: '',
            loading:false,
            loadingState:'',
            timerID:''
        }
    }

    componentWillMount() {
        let mnemonicPhrase = pkutils.getMnemonic();
        this.setState({ mnemonicPhrase: mnemonicPhrase });
    }

    handleOk(e) {
        
        // let that = this;
        if (!this.state.mnemonicPhraseCheck || this.state.mnemonicPhraseCheck === '') {
            message.warning("MnemonicPhrase Should not be Empty!");
            return;
        }
        if (this.state.mnemonicPhrase !== this.state.mnemonicPhraseCheck) {
            message.warning("Check MnemonicPhrase!");
            return;
        }

        this.setState({loading:true});
        this.setState({timerID:setInterval(() => this.createAccountData(),1000)});
            
    }

    componentWillUnmount() {
        clearInterval(this.state.timerID);
    }

    createAccountData() {
        let that = this;
        clearInterval(this.state.timerID);
        let privateKey = pkutils.getPrivateKeyFromMnemonic(this.state.mnemonicPhrase);
        createAccount(this.props.password, privateKey).then(function (res) {
            message.success('CREATE ACCOUNT SUCCESS!');
            if(that.props.name && that.props.name !== ''){
                res.name=that.props.name;
            }else{
                res.name="Account";
            }
            pushStorage("keyStore", res);
            that.props.freshData();
            that.props.callbackParent();
        }).catch((err)=>{
            this.setState({loading:false});
            message.error(err.message);
        })
    }

    checkMnemonic(event) {
        this.setState({ mnemonicPhraseCheck: event.target.value })
    }

    handleCancel(e) {
        this.props.callbackParent();
    }
    render() {
        const { mnemonicPhrase, mnemonicPhraseCheck,loading } = this.state;
        let warnigTips = (mnemonicPhrase === mnemonicPhraseCheck) ?
            (<span></span>) : (<span className="warning-tips">*The account recovery phrase does not match</span>);
        
        const container = (
            <div className="mnemonic-confirm">
                <div className="mnemonic-input">
                    <div>
                        <p style={{ paddingBottom: "10px", fontSize: "20px" }}>owner recovery phrase：</p>
                        <p style={{ paddingBottom: "10px" }}>{mnemonicPhrase}</p>
                        <Input placeholder="The account recovery phrase" onChange={this.checkMnemonic.bind(this)} value={mnemonicPhraseCheck} />
                        <p style={{ paddingTop: "10px" }} >{warnigTips}</p>
                    </div>
                </div>
            </div>
        )
        return (
            <div className="account-mnemonic">
                <Modal
                    title="WRITE MNEMONIC"
                    visible={this.props.mnemonicState}
                    onOk={this.handleOk.bind(this)}
                    onCancel={this.handleCancel.bind(this)}
                    maskClosable={!loading}
                    cancelButtonProps={{disabled:loading}}
                    okButtonProps={{disabled:loading}}
                >
                    <Spin spinning={loading}>{container}</Spin>
                </Modal>
            </div>
        );
    };
}