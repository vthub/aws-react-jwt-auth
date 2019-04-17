'use strict';
let jwt = require('jsonwebtoken');
let jwkToPem = require('jwk-to-pem');

// Configure Userpool ID
let userPoolId = "{{USER-POOL-ID}}";

// Copy from From https://cognito-idp.us-east-2.amazonaws.com/{{USER-POOL-ID}}/.well-known/jwks.json
let JWKS = '...';

let region = 'us-east-2';
let iss = 'https://cognito-idp.' + region + '.amazonaws.com/' + userPoolId;
let pems;

pems = {};
var keys = JSON.parse(JWKS).keys;
for (var i = 0; i < keys.length; i++) {
    //Convert each key to PEM
    var key_id = keys[i].kid;
    var modulus = keys[i].n;
    var exponent = keys[i].e;
    var key_type = keys[i].kty;
    var jwk = {kty: key_type, n: modulus, e: exponent};
    var pem = jwkToPem(jwk);
    pems[key_id] = pem;
}

function parseCookies(headers) {
    const parsedCookie = {};
    if (headers.cookie) {
        headers.cookie[0].value.split(';').forEach((cookie) => {
            if (cookie) {
                const parts = cookie.split('=');
                parsedCookie[parts[0].trim()] = parts[1].trim();
            }
        });
    }
    return parsedCookie;
}

const response401 = {
        status: '401',
        statusDescription: 'Unauthorized'
    }
;

exports.handler = (event, context, callback) => {

    const cfrequest = event.Records[0].cf.request;
    if (!cfrequest.uri.startsWith("/static/js/protected")) {
        // Request is not for protected content. Pass through
        callback(null, cfrequest);
        return true;
    }

    const headers = cfrequest.headers;

    let accessToken = null;
    if (headers.cookie) {
        let cookies = parseCookies(headers);
        for (let property in cookies) {
            if (cookies.hasOwnProperty(property) && property.includes("accessToken")) {
                accessToken = cookies[property];
            }
        }
    }

    //Fail if no authorization header found
    if (accessToken === null) {
        callback(null, response401);
        return false;
    }

    let jwtToken = accessToken;

    //Fail if the token is not jwt
    let decodedJwt = jwt.decode(jwtToken, {complete: true});
    if (!decodedJwt) {
        callback(null, response401);
        return false;
    }

    //Fail if token is not from your UserPool
    if (decodedJwt.payload.iss !== iss) {
        callback(null, response401);
        return false;
    }

    //Reject the jwt if it's not an 'Access Token'
    if (decodedJwt.payload.token_use !== 'access') {
        callback(null, response401);
        return false;
    }

    //Get the kid from the token and retrieve corresponding PEM
    let kid = decodedJwt.header.kid;
    let pem = pems[kid];
    if (!pem) {
        callback(null, response401);
        return false;
    }

    //Verify the signature of the JWT token to ensure it's really coming from your User Pool
    jwt.verify(jwtToken, pem, {issuer: iss}, function (err, payload) {
        if (err) {
            callback(null, response401);
            return false;
        } else {
            //Valid token.
            console.log('Successful verification');
            //remove authorization header
            delete cfrequest.headers.cookie;
            //CloudFront can proceed to fetch the content from origin
            callback(null, cfrequest);
            return true;
        }
    });
};




