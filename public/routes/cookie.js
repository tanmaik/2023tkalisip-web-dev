const express = require('express');
const router = express.Router()

router.get('/cookie', function(req, res) {
    var cookie_key = 'count'
    
    if (cookie_key in req.cookies === false) {
        res.cookie(cookie_key, 0)
    }
    
    if ('visited_count' in req.session === false) {
        req.session.visited_count = 0
    } else {
        req.session.visited_count += 1
    }
    
    if (req.session.visited_count > 4 && !('authenticated' in req.session)) {
        res.render('error_login')
    }
    
    if ('authenticated' in req.session) {
        var profile = req.session.profile;
        var sql = "SELECT nickname FROM profiles WHERE username = ?";
        res.app.locals.pool.query(sql, [profile.ion_username], function(error, results, fields){
            if (error) throw error;
            var nickname = results[0].nickname
            console.log(nickname)
            res.render("cookieclickr", {'visited': 'infinity', 'user': ", " + nickname})
        })
    } else {
        res.render("cookieclickr", {'visited': (5 - req.session.visited_count), 'user':''})
    }
})

module.exports = router