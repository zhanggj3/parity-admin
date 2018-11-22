import React, { Component } from 'react';
import { Menu, Dropdown, Icon, Row, Col, Drawer } from 'antd';
import MobileSide from "../MobileSide";
import {getStorage, setStorage} from '../../utils/storage';
import {formatterTo0x,formatAmount} from '../../utils/0xExchange';
import web3 from '../../utils/web3';
import async from 'async';
import { FormattedMessage } from 'react-intl';
import './index.css';


class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            menuState:false,
            accountList:[],
            defaultName:'null',
            defaultBalance:'0',
            net:'',
            lang:'',
            logo:require("../../image/insee-logo.png"),
            userIcon:require("../../image/insee-icon.png")

        }
    }

    componentDidMount() {
        this.screenChange();
        this.getAccountData();
        let net = localStorage.getItem("net");
        let lang = localStorage.getItem("lang");
        if(net && net !== ''){
            if(lang === "Chinese"){
                if(net === "Mainnet"){
                    this.setState({net:"主网"});
                }else{
                    this.setState({net:"测试网"});
                }
            }else{
                this.setState({net:net});
            }
            
        }else{
            this.setState({net:"Mainnet"});
            setStorage("net","Mainnet");
        }

        if(lang && lang !== ''){
            if(lang === "Chinese"){
                this.setState({lang:"中文"});
            }else{
                this.setState({lang:"English"});
            }
        }else{
            this.setState({lang:"English"});
            setStorage("lang","English");
        }
    }

    componentWillUnmount() {       
        window.removeEventListener('resize',this.onWindowResize);
    } 

    onWindowResize = (e) => {
        if(window.innerWidth > 1000) {
            this.setState({
                menuState: false
            });
        }
    }

    screenChange() {
        window.addEventListener('resize', this.onWindowResize);
    }

    showMenu() {
        this.setState({menuState:true});
    }

    onClose(){
        this.setState({menuState:false});
    }

    getAccounts(){
        let that = this;
        return new Promise((resolve, reject) => {
            let accounts = getStorage("keyStore");
            if(accounts && accounts !== ''){
                accounts = JSON.parse(accounts);
            }else{
                accounts = [];
            }
            that.setState({accounts:accounts});
            resolve(accounts)
        });   
    }

    getAccountData(){
        let that = this;
        async.waterfall([
            function(callback){
                let accountData = [];
                that.getAccounts().then((accounts)=>{
                    async.eachSeries(accounts,function(account,eachCallback){
                        that.getBalance(formatterTo0x(account.address)).then((data) =>{
                            account.balance = data;
                            account.address = formatterTo0x(account.address);
                            accountData.push(account);
                            eachCallback();
                        })
                    },function(err){
                        callback(err,accountData);
                    })
                })
            }],function(err,accountData){
            if(!err){
                let defaultAccount = getStorage("defaultAccount");
                if(defaultAccount && defaultAccount !== ''){
                    defaultAccount = JSON.parse(defaultAccount);
                    that.setState({
                        defaultName:defaultAccount.name,
                        accountList:accountData
                    })
                    that.getBalance(defaultAccount.address).then((data)=>{
                        that.setState({defaultBalance:data});
                    })
                }else{
                    if(accountData && accountData.length>0){
                        defaultAccount = accountData[0];
                        that.setState({
                            defaultName:defaultAccount.name,
                            accountList:accountData
                        })
                        that.getBalance(defaultAccount.address).then((data)=>{
                            that.setState({defaultBalance:data});
                        })
                        setStorage("defaultAccount",JSON.stringify(defaultAccount));
                    }
                }
                // that.setState({accountList:accountData});
            }
        })
    }

    getBalance(account){
        return new Promise((resolve, reject) => {
            web3.appchain.getBalance(account,function(err,balance){
                resolve(balance);
            })
        }); 
    }

    defaultAccount(item){
        this.setState({
            defaultName:item.name,
            defaultBalance:item.balance
        })
        setStorage("defaultAccount",JSON.stringify(item));
        window.location.reload();
    }

    chooseNet(item){
        setStorage("net",item.key);
        window.location.reload();
    }

    chooseLang(item){
        setStorage("lang",item.key);
        window.location.reload();
    }

    render() {
        // const {intl} = this.props;
        const {menuState,accountList,defaultName,defaultBalance,net,lang,logo,userIcon} = this.state;

        let accountArray = accountList && accountList.length>0? accountList.map((accountItem, index) => (
            <Menu.Item key={index} onClick={this.defaultAccount.bind(this,accountItem)}>
                <span>{accountItem.name}</span>
            </Menu.Item>            
        )): (<Menu.Item>Not Found</Menu.Item>);

        const netList = (
            <Menu onClick={this.chooseNet.bind(this)}>
                <Menu.Item key="Mainnet"><FormattedMessage id="net_main"/></Menu.Item>
                <Menu.Item key="Testnet"><FormattedMessage id="net_test"/></Menu.Item>
                {/* <Menu.Item key="Mainnet">Addnet</Menu.Item> */}
            </Menu>
        );
        const langList = (
            <Menu onClick={this.chooseLang.bind(this)}>
                <Menu.Item key="English"><FormattedMessage id="lang_en"/></Menu.Item>
                <Menu.Item key="Chinese"><FormattedMessage id="lang_zh"/></Menu.Item>
            </Menu>
        );

        const accountMenu = (
            <Menu>
                {accountArray}
            </Menu>
          );

        const menuList = menuState === true?(
            <Drawer
                placement="left"
                closable={false}
                onClose={this.onClose.bind(this)}
                visible={menuState}
                width="200px"
            >
                <div className="mobile-side">
					<MobileSide></MobileSide>
                    <Dropdown className="mobile-drop" overlay={netList}>
                        <span className="ant-dropdown-link">
                            <i style={{fontStyle:"normal",float:"left"}}>{net}</i><Icon style={{display:"inline-block",float:"right",marginTop:"2px",fontSize:"20px"}} type="caret-down" />
                        </span>
                    </Dropdown>
                    <Dropdown className="mobile-drop" overlay={langList}>
                        <span className="ant-dropdown-link">
                            <i style={{fontStyle:"normal",float:"left"}}>{lang}</i><Icon style={{display:"inline-block",float:"right",marginTop:"2px",fontSize:"20px"}} type="caret-down" />
                        </span>
                    </Dropdown>
                    <div className="mobile-side-logo">
                        <p style={{width:"30px",marginLeft:"30px",float:"left"}}>
                            <img style={{width:"100%"}} src={logo} alt=""/>
                        </p>
                        <p className="mobile-version">v1.0.0-beta.36</p>
                    </div>
				</div>
            </Drawer>
        ):''
        return (
            <div className="header">
                <Row>
                    <Col span={2} className="mobile-menu" onClick={this.showMenu.bind(this)}>
                        <Icon type="bars" theme="outlined" />
                    </Col>
                    <Col span={22} className="mobile-header">
                        <p className="mobile-title">账户管理</p>
                        <Dropdown className="mobile-account-drop" onClick={this.getAccountData.bind(this)} overlay={accountMenu} trigger={['click']}>
                            <div className="ant-dropdown-link"> 
                                <img className="header-account-img" src={logo} alt=""/>
                            </div>
                        </Dropdown>
                    </Col>
                    <Col span={4} className="header-top-col">
                        <div className="header-top">
                            <p className="header-version">v1.0.0-beta.36</p>
                        </div>
                    </Col>
                    <Col span={20} className="header-second">
                        <Dropdown className="header-drop" overlay={netList}>
                            <span className="ant-dropdown-link">
                                {net} <Icon type="down" />
                            </span>
                        </Dropdown>
                        <Dropdown className="header-drop" overlay={langList}>
                            <span className="ant-dropdown-link">
                                {lang} <Icon type="up" />
                            </span>
                        </Dropdown>
                        <div className="header-account">
                            <Dropdown onClick={this.getAccountData.bind(this)} overlay={accountMenu} trigger={['click']}>
                                <div className="ant-dropdown-link"> 
                                    <img className="header-account-img" src={userIcon} alt=""/>
                                    <div className="header-account-text">
                                        <p>{defaultName || null}</p>
                                        <p>{formatAmount(defaultBalance)} SEE</p>
                                    </div>
                                </div>
                            </Dropdown>
                        </div>
                        
                    </Col>
                </Row>
                {menuList}
            </div>
        );
    }
}

export default Header;