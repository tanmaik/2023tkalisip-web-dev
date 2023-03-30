const express = require('express');
const router = express.Router()


router.get('/nba_voting', function(req,res){

    var sql = "SELECT player,num_votes,display_form FROM nba_voting";
    
    res.app.locals.pool.query(sql, function(error, results, fields){
        if (error) throw error;
        results[0].percentage = parseFloat(((results[0].num_votes) / (results[0].num_votes + results[1].num_votes) )* 100)
        results[1].percentage = parseFloat(((results[1].num_votes) / (results[0].num_votes + results[1].num_votes) )* 100)
        res.render('mainvoting', {'player_data':results});
    }) 
    
})

router.get('/nba_voting/:player', function(req,res){

    var name = req.params.player;
    var sql = "UPDATE nba_voting SET num_votes=num_votes+1 WHERE player = ?";
    
    res.app.locals.pool.query(sql, [name], function(error, results, fields){
        if (error) throw error;
        res.redirect('https://user.tjhsst.edu/2023tkalisip/nba_voting');
    }) 
})

module.exports = router