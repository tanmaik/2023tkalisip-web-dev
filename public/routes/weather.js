var https = require("https");
const express = require("express");
const router = express.Router({ strict: true })

router.get('/weather_form', function(req, res) {
    res.render('coordinate_form')
});


router.get(
  "/getweather",
  function fetchForecast(req, res, next) {
    lat = req.query.lat
    long = req.query.long
    let url = "https://api.weather.gov/points/" + lat + "," + long;
    var options = {
      headers: {
        "User-Agent": "request",
      },
    };
    https
      .get(url, options, function (response) {
        var rawData = "";
        response.on("data", function (chunk) {
          rawData += chunk;
        });
        response.on("end", function () {
          obj = JSON.parse(rawData);
          try { 
            console.log(obj["properties"]["forecastHourly"])
          }
          catch (error) {
              res.send("Please pick valid coordinates.")
          }
          https
            .get(
              obj["properties"]["forecastHourly"],
              options,
              function (response) {
                var rawData = "";
                response.on("data", function (chunk) {
                  rawData += chunk;
                });

                response.on("end", function () {
                  obj = JSON.parse(rawData);
                  res.locals.forecast = obj["properties"]["periods"];
                  next();
                });
              }
            )
            .on("error", function (e) {
              console.error(e);
            });
        });
      })
      .on("error", function (e) {
        console.error(e);
      });
  },
  function (req, res, next) {
    var previous_forecast = res.locals.forecast;
    var weather_info = []
    var i = 0;
    while (i < 5) {
      forecast_hour = previous_forecast[i];
      time = forecast_hour["startTime"].substring(11, 13)
      if (parseInt(time) > 12) {
            minus = parseInt(time) - 12
            time = minus + "PM"
      } else if (parseInt(time) == 12) {
        time += "PM"
          
     }else {
            time += "AM"
      }
      console.log(time)
      var to_push = {
        time: time,
        temp: forecast_hour["temperature"],
        wind: forecast_hour["windSpeed"] + " " + forecast_hour["windDirection"],
        icon: forecast_hour["icon"],
      };
      weather_info.push(to_push);
  
      i += 1;
    }
    var params = {
        data: weather_info
    }

    res.render("weather_view", params);
  }
);

module.exports = router;