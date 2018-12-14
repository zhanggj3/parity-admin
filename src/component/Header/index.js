import React, { Component } from 'react';
import { Menu, Dropdown, Icon, Row, Col, Drawer } from 'antd';
import MobileSide from "../MobileSide";
import {getStorage, setStorage} from '../../utils/storage';
import {formatterTo0x,formatAmount} from '../../utils/0xExchange';
import web3 from '../../utils/web3';
import async from 'async';
import { FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router';
import blockies from '../../utils/blockies';
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
            userIcon:require("../../image/insee-icon.png"),
            currentIndex:'account',
            srcImg:require("../../image/insee-icon.png"),
            menuImg:require("../../image/menu.svg")
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
                            let source = blockies.create({ seed:formatterTo0x(account.address) ,size: 8,scale: 16}).toDataURL();
                            account.img = source;
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
                        accountList:accountData,
                        srcImg:defaultAccount.img
                    })
                    that.getBalance(defaultAccount.address).then((data)=>{
                        that.setState({defaultBalance:data});
                    })
                }else{
                    if(accountData && accountData.length>0){
                        defaultAccount = accountData[0];
                        that.setState({
                            defaultName:defaultAccount.name,
                            accountList:accountData,
                            srcImg:accountData[0].img
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
            defaultBalance:item.balance,
            srcImg:item.img
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

    getMenuIndex(path) {
        this.setState({currentIndex:path});
    }

    render() {
        // const {intl} = this.props;
        const {menuState,accountList,defaultName,defaultBalance,net,lang,logo,currentIndex,srcImg,menuImg} = this.state;
        const { location } = this.props
        let title;
        switch(location.pathname){
            case '/':
                title="account";
                break;
            case '/contract':
                title="contract";
                break;
            case '/browser':
                title="browser";
                break;
            case '/management':
                title="management";
                break;
            default:
                title="account";
        }
            


        let accountArray = accountList && accountList.length>0? accountList.map((accountItem, index) => (
            <Menu.Item key={index} onClick={this.defaultAccount.bind(this,accountItem)}>
                <img style={{width:"25px",borderRadius:"12px",marginRight:"10px"}} src={accountItem.img} alt=""/>
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
					<MobileSide currentIndex={currentIndex} getMenuIndex={this.getMenuIndex.bind(this)}></MobileSide>
                    <Dropdown className="mobile-drop" overlay={netList}>
                        <span className="ant-dropdown-link">
                            <i style={{fontStyle:"normal",float:"left"}}>{net}</i><Icon type="caret-down" style={{display:"inline-block",float:"right",marginTop:"2px",fontSize:"20px"}}/>
                        </span>
                    </Dropdown>
                    <Dropdown className="mobile-drop" overlay={langList}>
                        <span className="ant-dropdown-link">
                            <i style={{fontStyle:"normal",float:"left"}}>{lang}</i><Icon type="caret-down" style={{display:"inline-block",float:"right",marginTop:"2px",fontSize:"20px"}} />
                        </span>
                    </Dropdown>
                    <div className="mobile-side-logo">
                        <p style={{width:"30px",marginLeft:"20px",float:"left"}}>
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
                        {/* <Icon type="bars" theme="outlined" /> */}
                        <img style={{width:"20px",display:"block",marginTop:"15px",cursor:"pointer"}} src={menuImg} alt="" />
                    </Col>
                    <Col span={22} className="mobile-header">
                        <p className="mobile-title"><FormattedMessage id={title}/></p>
                        <Dropdown className="mobile-account-drop" onClick={this.getAccountData.bind(this)} overlay={accountMenu} trigger={['click']}>
                            <div className="ant-dropdown-link"> 
                                <img className="header-account-img" src={srcImg} alt=""/>
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
                                {net} <Icon type="caret-down" style={{color:"#6753FF"}} />
                            </span>
                        </Dropdown>
                        <Dropdown className="header-drop" overlay={langList}>
                            <span className="ant-dropdown-link">
                                {lang} <Icon type="caret-down" style={{color:"#6753FF"}} />
                            </span>
                        </Dropdown>
                        <div className="header-account">
                            <Dropdown onClick={this.getAccountData.bind(this)} overlay={accountMenu} trigger={['click']}>
                                <div className="ant-dropdown-link"> 
                                    <img className="header-account-img" src={srcImg} alt=""/>
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

export default withRouter(Header);