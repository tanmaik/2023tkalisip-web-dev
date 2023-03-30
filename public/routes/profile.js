const express = require('express')
const router = express.Router()

router.get('/myprofile', function(req, res) {
    if(!('authenticated' in req.session)) {
        res.redirect("https://user.tjhsst.edu/2023tkalisip")
    }
    var profile = req.session.profile;
    var sql = "SELECT nickname FROM profiles WHERE username = ?";
    res.app.locals.pool.query(sql, [profile.ion_username], function(error, results, fields){
        if (error) throw error;
        var nickname = results[0].nickname
        console.log(nickname)
        var params = {
            'full_name': profile.full_name,
            'nickname': nickname,
            'email': profile.emails,
            'grade': profile.grade.name,
            'phones': profile.phones,
        }
        res.render('profile', params)
    }) 
})

router.get('/changed_nickname', function(req, res) {
    var new_nickname = req.query.f_nickname;
    var sql = "UPDATE profiles SET nickname=\"" + new_nickname + "\" WHERE username = \"" + req.session.profile.ion_username + "\";";
    res.app.locals.pool.query(sql, function(error, results, fields){
        if (error) throw error;
        res.redirect('https://user.tjhsst.edu/2023tkalisip/myprofile');
    }) 
})


module.exports = router