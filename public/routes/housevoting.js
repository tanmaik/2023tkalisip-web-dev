const express = require('express');
const router = express.Router({ strict: true })

// find_total_house_points(house_name)
// view_members_of_house(house_name)

router.get('/housevoting', function(req, res) {
    var sql = 'select u_id, player_name from virtual_users;'
    res.app.locals.pool.query(sql, function(error, results, fields) {
        console.log(results)
         res.render('housevoting', {'all_players': results})
    })
       
})
router.get('/addPoints', function(req, res) {
    if ('profile' in req.session) {
        var sql = 'INSERT INTO house_ledgers (awarder, recipient, amt) VALUES (?, ?, ?);'
        res.app.locals.pool.query(sql, [req.session.profile.ion_username, req.query.play, req.query.points], function(error, results, fields) {
            res.redirect("https://user.tjhsst.edu/2023tkalisip/housevoting")
        })
    }
    else {
        var sql = 'INSERT INTO house_ledgers (awarder, recipient, amt) VALUES (?, ?, ?);'
        res.app.locals.pool.query(sql, [null, req.query.play, req.query.points], function(error, results, fields) {
            res.redirect("https://user.tjhsst.edu/2023tkalisip/housevoting")
        })
    }
})

router.get('/addPlayer', function(req, res) {
    var sql = 'SELECT max(u_id) FROM virtual_users;'
    res.app.locals.pool.query(sql, function(error, results, fields) {
        var sql1 = 'INSERT INTO virtual_users (u_id, player_name, u_house) VALUES (?, ?, ?);'
        res.app.locals.pool.query(sql1,[(parseInt(results[0]['max(u_id)'])+1), req.query.play, req.query.house], function(error, results, fields){
            res.redirect("https://user.tjhsst.edu/2023tkalisip/housevoting")
        })
    }) 
})

router.get('/house_voting_worker', function(req,res){
    var house_chx;
    var total;
    if ('house' in req.query === false) {
        return res.send('On the wrong page?')
    } else {
        house_chx = req.query.house;
    }
    // console.log(house_chx)
    var sql = 'SELECT player_name FROM virtual_users JOIN virtual_houses ON virtual_users.u_house = virtual_houses.h_id WHERE h_name=?;';
    res.app.locals.pool.query(sql,[house_chx],function(error, results, fields){
        var sql1 ='select sum(amt) from house_ledgers JOIN virtual_users ON house_ledgers.recipient = virtual_users.u_id WHERE player_name IN (SELECT player_name FROM virtual_users JOIN virtual_houses ON virtual_users.u_house = virtual_houses.h_id WHERE h_name=?);'
        var results1 = results;
        res.app.locals.pool.query(sql1, [house_chx], function(error, results, fields) {
            // console.log(results1)
            // console.log(results[0])
            if (results[0]['sum(amt)'] === null) {
                results[0]['sum(amt)'] = 0;
            }
            res.render('housevoting_data',{'results':results1, 'total':results[0]['sum(amt)']})
        })
                    
    })
})

router.get('/individual_points/:player', function(req, res) {
    var player = req.params.player;
    var sql = 'select sum(amt) from house_ledgers JOIN virtual_users ON house_ledgers.recipient = virtual_users.u_id WHERE player_name=?';
    res.app.locals.pool.query(sql, [player], function(error, results, fields) {
        if (results[0]['sum(amt)'] === null) {
                results[0]['sum(amt)'] = 0;
        }
        res.send(player + " has " + results[0]['sum(amt)'] + " points.")
    })
})

module.exports = router;
