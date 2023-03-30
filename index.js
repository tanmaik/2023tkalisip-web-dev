var express = require('express')
var app = express();

var https = require('https')
var http = require('http')

var hbs = require('hbs')
app.set('view engine', 'hbs')

var cookieParser = require('cookie-parser')
app.use(cookieParser())

var path = require('path')
app.use(express.static(path.join(__dirname, 'static')));

require('./config/config_sql.js')(app)
require('./config/config_cookie.js')(app)

const home = require('./routes/home.js')
app.use(home);

const numberFacts = require('./routes/numberfacts.js');
app.use(numberFacts);

const madlib = require('./routes/madlib.js');
app.use(madlib)

const weather = require('./routes/weather.js');
app.use(weather)

const nba_voting = require('./routes/nba_voting.js')
app.use(nba_voting)

const cookie = require('./routes/cookie.js')
app.use(cookie)

const profile = require('./routes/profile.js')
app.use(profile)

const housevoting = require('./routes/housevoting.js')
app.use(housevoting)

const map = require('./routes/map.js')
app.use(map)

app.use(function (req, res, next) {
  res.status(404).render("404")
})

var listener = app.listen(process.env.PORT || 8080, process.env.HOST || "0.0.0.0", function() {
    console.log("Express server started");
});