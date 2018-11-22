import zhCN from './locales/zh';
import enUS_antd from 'antd/lib/locale-provider/en_US';
import enUS from './locales/en';
import appLocaleData from 'react-intl/locale-data/en';
import appLocaleZHData from 'react-intl/locale-data/zh';

let LANG = localStorage.getItem("lang");
let appLocaleObj;
if(LANG && LANG !== ''){
	if(LANG === "Chinese") {
        appLocaleObj = {
            LOCALE:"zh-CN",
            LANG:zhCN,
            ANTD:null,
            DATA:appLocaleZHData
        }
	}else{
		appLocaleObj = {
            LOCALE:"en-US",
            LANG:enUS,
            ANTD:enUS_antd,
            DATA:appLocaleData
        }
	}
}else{
	appLocaleObj = {
        LOCALE:"en-US",
        LANG:enUS,
        ANTD:enUS_antd,
        DATA:appLocaleData
    }
}

export default appLocaleObj;