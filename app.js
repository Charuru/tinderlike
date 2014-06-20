var express = require('express');
var app = express();
var tinder = require('tinder/tinder');
var settings = {
    "facebook_token": "####",
    "facebook_id": "####"
};

var client = new tinder.Tinder(settings['facebook_token'], settings['facebook_id']);

function likeUser() {
    // Authenticate
    if(client.isLoggedIn() === false) {
        console.log('[LOG] Logging in...');
        client.login(function(err, res, body) {
            if(err) {
                throw '[ERROR] Error logging in: '+ err;
            }

            console.log('[LOG] Welcome back, '+ body.user.full_name);

            setTimeout(likeUser, 10000);
        });

    // Queue Users
    } else if(client.getUsers().length === 0) {
        console.log('[LOG] Fetching new user list');
        client.loadUsers(function(err, res, body) {
            if(err) {
                throw '[ERROR] Unable to fetch new users: '+ err;
            }

            setTimeout(likeUser, 10000);
        });

    // Like User
    } else {
        var user = client.getNextUser();
        console.log('[LOG] Attemping to like user: '+ user.name +' ('+ user._id +')');
        client.likeUser(user, function(err, res, body) {
            if(err) {
                console.log('[LOG] Error liking user');
            } else {
                console.log('[LOG] Liked user: '+ user.name +' ('+ user._id +')');
                if(body.match === true) {
                    console.log('# ITS A MATCH #');
                }
            }

            setTimeout(likeUser, 60000);
        });
    }
}

console.log('[LOG] Script started.');
likeUser();

app.set('view engine', 'jade');
app.get('/', function(req, res) {
    res.render('index', { 
        'user': client.getLastLikedUser(),
        'queue': client.getUsers().length
    });
});
app.listen(80);