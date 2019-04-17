import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {Auth} from "aws-amplify";

ReactDOM.render(<App />, document.getElementById('root'));

Auth.configure({
    region: 'us-east-2',
    userPoolId: '{{USER-POOL-ID}}',
    userPoolWebClientId: '{{APP-CLIENT-ID}}',
    cookieStorage: {
        domain: '{{CLOUDFRONT-DOMAIN}}',
        path: '/',
        expires: 1,
        secure: true
    },
});

serviceWorker.unregister();
