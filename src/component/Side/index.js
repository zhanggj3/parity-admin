import React, { Component } from 'react';
import { createHashHistory } from 'history';
import { FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router'
import './index.css';

class Side extends Component {
    constructor() {
        super();
        this.state = {
            collapsed: false,
            menu:[
                {name:"账号",id:0,path:"account",icon:require("../../image/menu-user.png")},
                {name:"合约管理",id:1,path:"contract",icon:require("../../image/menu-contract.png")},
                {name:"区块链浏览器",id:2,path:"browser",icon:require("../../image/menu-browser.png")},
                {name:"平台管理",id:3,path:"management",icon:require("../../image/menu-manage.png")}
            ],
            currentIndex:'account',
            logo:require("../../image/insee-logo.png")
        }
    }

    componentDidMount(){
        const { location } = this.props;
        if(location.pathname && location.pathname !== ''){
            let currentTab = location.pathname;
            currentTab = currentTab.substring(1);
            if(currentTab === '' || !currentTab){
                currentTab = "account";
            }
            this.setState({currentIndex:currentTab});
        }
    }

    toRouter(item) {
        this.setState({currentIndex:item.path});
        if(item.path === 'account'){
            createHashHistory().replace('/');
        }else{
            createHashHistory().replace('/'+item.path);
        }
        
    }

    render() {
        const {menu,currentIndex,logo} = this.state;

        const menuPart = menu.length>0 ? menu.map((item)=>(
            <li key={item.id} onClick={this.toRouter.bind(this,item)}>
                <div className={`li-cont ${item.path===currentIndex?"active":null}`} >
                    <p style={{width:"23px",margin:"0 auto"}}>
                        <img style={{width:"100%"}} src={item.icon} alt="" />
                    </p>
                    <p className="li-text"><FormattedMessage id={item.path}/></p>
                </div>
            </li>
        )):''

        return (
            <div className="comp-side">
                <div className="side-logo">
                    <p style={{width:"50px",margin:"0 auto"}}>
                        <img style={{width:"100%"}} src={logo} alt=""/>
                    </p>
                </div>
                <ul className="comp-side-ul">
                    {menuPart}
                </ul>
            </div>
        );
    }
}

export default withRouter(Side);