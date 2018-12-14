import React, { Component } from 'react'
import { Menu,Icon } from 'antd';
import {Route,Link} from 'react-router-dom';
import ManageNodelist from '../ManagementNodelist';
import ManageNodeadd from '../ManagementNodeadd';
import ManageAccountList from '../ManagementAccountList';
import ManagePermissin from '../ManagementPermission';
import ManageRole from '../ManagementRoles';
import ManagementNodeAdd from '../ManagementNodeadd';
import ManageApi from '../ManagementApi';
import { injectIntl } from 'react-intl';
import './index.css';
const SubMenu = Menu.SubMenu;


class Management extends Component {
	constructor(){
		super();
		this.state = {
            current: '',
            nodeAddState:false
		}
    }

    handleClick(e) {
        this.setState({
          current: e.key,
        });
    }

    closeNodeAdd() {
        this.setState({nodeAddState:false});
    }

    showNodeAdd() {
        this.setState({nodeAddState:true});
    }

	render() {
        const {nodeAddState} = this.state;
        const nodeAdd = nodeAddState === true ? (
            <ManagementNodeAdd
                state={nodeAddState}
                closeWatch={this.closeNodeAdd.bind(this)}
                >
            </ManagementNodeAdd>
        ):''

		return (
			<div className="management">
                <div className="management-header">
                    <Menu
                        onClick={this.handleClick.bind(this)}
                        selectedKeys={[this.state.current]}
                        mode="horizontal"
                        style={{width:"100%",height:"40px",lineHeight:"38px",backgroundColor:"#f4f4f4"}}
                    >
                        <SubMenu key="node" title={<span className="submenu-title-wrapper">{this.props.intl.formatMessage({id:"node-management"})}<Icon type="caret-down" style={{color:"#1890ff",marginRight:"0"}} /></span>}>
                            <Menu.Item key="node-list"><Link to={'/management'} replace>{this.props.intl.formatMessage({id:"node-list"})}</Link></Menu.Item>
                            <Menu.Item key="node-add" onClick={this.showNodeAdd.bind(this)}>{this.props.intl.formatMessage({id:"node-add"})}</Menu.Item>
                        </SubMenu>
                        <Menu.Item key="interface">
                            <Link to={'/management/api'} replace>{this.props.intl.formatMessage({id:"interface-management"})}</Link>
                        </Menu.Item>
                        <SubMenu key="permission" title={<span className="submenu-title-wrapper">{this.props.intl.formatMessage({id:"permission-management"})}<Icon type="caret-down" style={{color:"#1890ff",marginRight:"0"}} /></span>}>
                            <Menu.Item key="user-permission"><Link to={'/management/accountlist'} replace>{this.props.intl.formatMessage({id:"user-management"})}</Link></Menu.Item>
                            <Menu.Item key="manage-permission"><Link to={'/management/permission'} replace>{this.props.intl.formatMessage({id:"permission-management"})}</Link></Menu.Item>
                        </SubMenu>
                        <Menu.Item key="role">
                            <Link to={'/management/role'} replace>{this.props.intl.formatMessage({id:"role-management"})}</Link>
                        </Menu.Item>
                    </Menu>
                </div>
                <div className="management-main">
                    {this.props.children}
                    <Route exact path={'/management'} component={ManageNodelist} />
                    <Route path={'/management/nodeadd'} component={ManageNodeadd} />
                    <Route path={'/management/accountlist'} component={ManageAccountList} />
                    <Route path={'/management/permission'} component={ManagePermissin} />
                    <Route path={'/management/role'} component={ManageRole} />
                    <Route path={'/management/api'} component={ManageApi} />
                </div>
                {nodeAdd}
			</div>
			
		);
	}
}

export default injectIntl(Management);
