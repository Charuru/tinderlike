var express = require('express');
var app = express();
var tinder = require('tinder/tinder');
var settings = {
    'facebook_token': '', // Facebook Authorization Token
    'facebook_id': ### // Facebook User ID
};

var client = new tinder.Tinder(settings['facebook_token'], settings['facebook_id']);
// https://www.facebook.com/dialog/oauth?client_id=464891386855067&redirect_uri=https://www.facebook.com/connect/login_success.html&scope=basic_info,email,public_profile,user_about_me,user_activities,user_birthday,user_education_history,user_friends,user_interests,user_likes,user_location,user_photos,user_relationship_details&response_type=token


function likeUser() {
    // Authenticate
    if(client.isLoggedIn() === false) {
        console.log('[LOG] Logging in...');
        client.login(function(err, res, body) {
            if(err) {
                throw '[ERROR] Error logging in: '+ err;
            }

            if(!body || !body['user']) {
                throw '[ERROR] Error logging in.';
            }

            console.log('[LOG] Welcome back, '+ body.user.full_name);

            setTimeout(likeUser, 2000);
        });

    // Queue Users
    } else if(client.getUsers().length === 0) {
        console.log('[LOG] Fetching new user list');
        client.loadUsers(function(err, res, body) {
            if(err) {
                throw '[ERROR] Unable to fetch new users: '+ err;
            }

            setTimeout(likeUser, 2000);
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

            setTimeout(likeUser, 2000);
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
app.listen(8080);
