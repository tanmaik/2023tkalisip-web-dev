const express = require('express')
const router = express.Router();

router.get('/map', function(req, res) {
    res.render('map')
})

module.exports = router;