import React, { Component } from 'react';
import { createHashHistory } from 'history';
import { FormattedMessage } from 'react-intl';
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
            currentIndex:''
        }
    }

    toRouter(item) {
        this.setState({currentIndex:item.id});
        if(item.path === 'account'){
            createHashHistory().replace('/');
        }else{
            createHashHistory().replace('/'+item.path);
        }
        
    }

    render() {
        const {menu,currentIndex} = this.state;

        const menuPart = menu.length>0 ? menu.map((item)=>(
            <li key={item.id} onClick={this.toRouter.bind(this,item)} className={item.id===currentIndex?"active":null}>
                <div className="mobile-li-cont">
                    <p style={{width:"23px",float:"left",marginLeft: "30px"}}>
                        <img style={{width:"100%"}} src={item.icon} alt="" />
                    </p>
                    <p className="mobile-li-text"><FormattedMessage id={item.path}/></p>
                </div>
            </li>
        )):''

        return (
            <div className="mobile-side-all">
                <ul className="mobile-side-ul">
                    {menuPart}
                </ul>
            </div>
        );
    }
}

export default Side;