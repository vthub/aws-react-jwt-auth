import React, {Component} from 'react';
import {Link, Route, HashRouter} from 'react-router-dom';
import './App.css';
import Public from "./Public";
import asyncComponent from "./AsyncComponent";
import {withAuthenticator} from 'aws-amplify-react';

const AsyncProtected = asyncComponent(() => import(/* webpackChunkName: "protected/a" */ "./Protected"));

class App extends Component {
    render() {
        return (
            <div className="App">
                <h1>React Authentication with JWT and AWS Cognito!</h1>
                <HashRouter>
                    <div>
                        <Link to="/">Public</Link>, <Link to="/protected">Protected</Link>
                        <Route path="/" exact component={Public}/>
                        <Route path="/protected" component={withAuthenticator(AsyncProtected)}/>
                    </div>
                </HashRouter>
            </div>
        );
    }
}

export default App;
