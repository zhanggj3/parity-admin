import React from 'react';
import { Modal } from 'antd';
const QRCode = require('qrcode.react');

export default class Qrcode extends React.Component {
    constructor() {
        super();
        this.state = {

        }
    }

    handleCancel(e) {
        this.props.callback(false);
    }
    render() {
        return (
            <div>
                <Modal
                    visible={this.props.state}
                    onCancel={this.handleCancel.bind(this)}
                    footer={null}
                    width="400px"
                >
                    <div style={{ width: "100%", textAlign: "center", fontSize: "12px" }}>
                        <QRCode value={this.props.address} size={120} style={{ marginTop: "20px" }} />
                        <p style={{marginTop:"10px"}}>{this.props.address}</p>
                    </div>
                </Modal>
            </div>
        );
    };
}