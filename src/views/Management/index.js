import React, { Component } from 'react'
import { Menu } from 'antd';
import {Route,Link} from 'react-router-dom';
import ManageNodelist from '../ManagementNodelist';
import ManageNodeadd from '../ManagementNodeadd';
import './index.css';
const SubMenu = Menu.SubMenu;


class Home extends Component {
	constructor(){
		super();
		this.state = {
            current: 'node-list'
		}
    }

    handleClick(e) {
        console.log('click ', e);
        this.setState({
          current: e.key,
        });
    }

	render() {
		
		return (
			<div className="management">
                <div className="management-header">
                    <Menu
                        onClick={this.handleClick.bind(this)}
                        selectedKeys={[this.state.current]}
                        mode="horizontal"
                        style={{width:"100%",height:"40px",lineHeight:"38px",backgroundColor:"#f4f4f4"}}
                    >
                        <SubMenu key="node" title={<span className="submenu-title-wrapper">节点管理</span>}>
                            <Menu.Item key="node-list"><Link to={'/management/nodelist'}>节点列表</Link></Menu.Item>
                            <Menu.Item key="node-add"><Link to={'/management/nodeadd'}>增加节点</Link></Menu.Item>
                        </SubMenu>
                        <Menu.Item key="interface">
                            接口管理
                        </Menu.Item>
                        <SubMenu key="permission" title={<span className="submenu-title-wrapper">权限管理</span>}>
                            <Menu.Item key="user-permission">用户管理</Menu.Item>
                            <Menu.Item key="manage-permission">权限管理</Menu.Item>
                        </SubMenu>
                        <Menu.Item key="role">
                            角色管理
                        </Menu.Item>
                    </Menu>
                </div>
                <div className="management-main">
                    {this.props.children}
                    <Route path={'/management/nodelist'} component={ManageNodelist} />
                    <Route path={'/management/nodeadd'} component={ManageNodeadd} />
                </div>
			</div>
			
		);
	}
}

export default Home;
