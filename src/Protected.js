import React, {Component} from 'react';
import {Auth} from "aws-amplify";

class Protected extends Component {
    signOut() {
        Auth.signOut()
            .then(data => console.log(data))
            .catch(err => console.log(err));
    }

    render() {
        return (
            <div>
                <h1>Secure Zone</h1>

                <p>Protected content.</p>

                <button onClick={this.signOut}>Sign Out!</button>
            </div>
        );
    }
}

export default Protected;
