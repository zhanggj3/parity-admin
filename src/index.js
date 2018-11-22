import React from 'react';
import ReactDOM from 'react-dom';
import {Route,HashRouter,Switch} from 'react-router-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { LocaleProvider } from 'antd';
import { addLocaleData,IntlProvider } from 'react-intl';
import appLocale from './lang';
import 'antd/dist/antd.css';
import './index.css';


addLocaleData(appLocale.DATA);

ReactDOM.render(
    <LocaleProvider locale={appLocale.ANTD}>
        <IntlProvider locale={appLocale.LOCALE} messages={appLocale.LANG}>
            {/* <App /> */}
            <HashRouter>
                <Switch>
                    <Route path="/" component={App} />
                </Switch>
            </HashRouter>
        </IntlProvider>
    </LocaleProvider>, 
    document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
