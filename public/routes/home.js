const express = require('express')
const router = express.Router();

const {  AuthorizationCode  } = require('simple-oauth2');

const https = require('https')

var ion_client_id = 'tgN8b2NvVfSyH6F5RsdzdwCcSSGNRgp4fukWjSr5'
var ion_client_secret = 'FSjCI89T22B7B7QdaqMdILd0XoXWp1GfvjeE72FUDG9juEAs30QQqeBn0JMVfaC9eF2NPxIzd3zXb1M54S51jjbLIVQtuNqIq0sNXhB642Rq8cGm8PwTHFdeJgYKjRtv'
var ion_redirect_uri = 'https://user.tjhsst.edu/2023tkalisip/login_worker'

var client = new AuthorizationCode({
    client: {
        id: ion_client_id,
        secret: ion_client_secret
    },
    auth: {
        tokenHost: 'https://ion.tjhsst.edu/oauth/',
        authorizePath: 'https://ion.tjhsst.edu/oauth/authorize',
        tokenPath: 'https://ion.tjhsst.edu/oauth/token'
    }
})

var authorizationUri = client.authorizeURL({
    scope: "read",
    redirect_uri: ion_redirect_uri
})

function checkAuthentication(req, res, next) {
    if ('authenticated' in req.session) {
        next()
    }
    else {
        res.render('unverified', {'login_link' : authorizationUri})
    }
}

function getUserName(req, res, next) {
    var access_token = req.session.token.access_token;
    var profile_url = 'https://ion.tjhsst.edu/api/profile?format=json&access_token=' + access_token;
    
    https.get(profile_url, function(response) {
        var rawData = '';
        response.on('data', function(chunk) {
            rawData += chunk;
        })
        
        response.on('end', function() {
            res.locals.profile = JSON.parse(rawData);
            req.session.profile = res.locals.profile;
            var profile = req.session.profile;
            
            var sql = "SELECT nickname FROM profiles WHERE username = ?";
            res.app.locals.pool.query(sql, [profile.ion_username], function(error, results, fields){
                if (error) throw error;
                console.log(results)
                var nickname = results[0]
                if (nickname === undefined) {
                    console.log('doesnt exist')
                    var sql = "INSERT INTO profiles (username, nickname) VALUES (?,\"" + profile.ion_username + "\");"
                    res.app.locals.pool.query(sql, [profile.ion_username], function(error1, results1, fields1){
                        if (error1) throw error1;
                        next()
                     })
                }
                else {
                    next()
                }
            }) 
            next();
        })
    }).on('error', function(err) {
        next(err);
    })
}


router.get('/', [checkAuthentication, getUserName], function(req, res){
    var profile = res.locals.profile;
    var first_name = profile.first_name;
    res.render('home', {'username':profile.first_name});
});

async function convertCodeToToken(req, res, next) {
    var theCode = req.query.code;
    
    var options = {
        'code': theCode,
        'redirect_uri': ion_redirect_uri,
        'scope': 'read'
    };
    
    try {
        var accessToken = await client.getToken(options);
        res.locals.token = accessToken.token;
        next()
    }
    catch (error) {
        console.log('Access Token Error', error.message);
        res.send(502);
    }
}

router.get('/login_worker', [convertCodeToToken], function(req, res) {
    req.session.authenticated = true;
    req.session.token = res.locals.token;
    
    res.redirect('https://user.tjhsst.edu/2023tkalisip')
})

router.get('/logout', function(req, res) {
    delete req.session.authenticated;
    delete req.session.profile;
    res.redirect("https://user.tjhsst.edu/2023tkalisip")
})

module.exports = router;
