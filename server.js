'use strict';

require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());

const superagent = require('superagent');

//enviroment variable defined in .env as 3000
const PORT = process.env.PORT || 3000;


//if front end is in same directory, front end is in public file and following line is needed
//app.use(express.static('./public'));

app.get('/isitworking', (request, response) => {
  response.send('yes');
});

app.get('/TEST', (request, response) => {
  try {
    let testData = require('./data/geo.json');
    response.send(testData);
  } catch (error) {
    console.log('there was en error');
    response.status(500).send('sorry, error');
  }
});


//Following codes have been referenced to Michelle's class lecture:
app.get('/location', (request, response) => {
  try {
    const queryData = request.query.data;
    let geocodeURL = `https://maps.googleapis.com/maps/api/geocode/json?address=${queryData}&key=${process.env.GEOCODE_API_KEY}`;
    
    superagent.get(geocodeURL)
      .end( (err, googleMapsApiResponse) => {
        const location = new Location(queryData, googleMapsApiResponse.body);
        response.send(location);
      });
  }
  catch(error) {
    console.error(error);
    response.status(500).send('Status: 500. So sorry, something went wrong.');
  }
});


function Location(query, res) {
  this.search_query = query;
  this.formatted_query = res.results[0].formatted_address;
  this.latitude = res.results[0].geometry.location.lat;
  this.longitude = res.results[0].geometry.location.lng;
}


app.get('/weather', (request, response) => {
  try {
    let jsonInfo = require('./data/darksky.json');
    let weatherDates = [];
    weatherDates = jsonInfo.daily.data.map((extractedData) => {
      let forecast= extractedData.summary;
      let time =  extractedData.time;
      return new WeatherObject(forecast, time);
    });



    response.send(weatherDates);
  } catch (error) {
    console.error(error);
    response.status(500).send('Status: 500. So sorry, something went wrong');
  }
});

function WeatherObject(forecast, time) {
  this.forecast = forecast;
  this.time = new Date(time * 1000).toDateString();
}


app.listen(PORT, () => console.log(`Listening on PORT ${PORT}`));
