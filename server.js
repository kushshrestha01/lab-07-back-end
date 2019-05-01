'use strict';

require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());

const superagent = require('superagent');

//enviroment variable defined in .env as 3000
const PORT = process.env.PORT || 3000;

console.log(process.env.TEST);

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

app.listen(PORT, () => console.log(`Listening on PORT ${PORT}`));

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

// app.get('/location', (request, response) => {
//   try {
//   //   const queryDate = request.query.data;
//   //   let geocodeURL = `https://maps.googleapis.com/maps/api/geocode/json?address=${queryData}&key=${process.env.GEOCODE_API_KEY}`;
//   //  superagent.get(geocodeURL)


//     let jsonInfo = require('./data/geo.json');
//     let someLocation = new GeoObject(jsonInfo.results[0].address_components[0].long_name, jsonInfo.results[0].formatted_address, jsonInfo.results[0].geometry.location.lat, jsonInfo.results[0].geometry.location.lng);
//     response.send(someLocation);
//   } catch (error) {
//     console.error(error);
//     response.status(500).send('Status: 500. So sorry, something went wrong');
//   }
// });

function GeoObject(query, address, latitude, longitude) {
  this.formatted_query = query;
  this.formatted_address = address;
  this.latitude = latitude;
  this.longitude = longitude;
}

app.get('/weather', (request, response) => {
  try {
    let jsonInfo = require('./data/darksky.json');
    let weatherDates = [];
    weatherDates = jsonInfo.daily.data.map((extractedData) => ({
      forecast: extractedData.summary,
      time: extractedData.time
    }));

    // for (let index = 0; index < jsonInfo.daily.data.length; index++) {
    //   let tempObj = new WeatherObject(jsonInfo.daily.data[index].summary, jsonInfo.daily.data[index].time);
    //   weatherDates.push(tempObj);
    // }

    response.send(weatherDates);
  } catch (error) {
    console.error(error);
    response.status(500).send('Status: 500. So sorry, something went wrong');
  }
});

// function WeatherObject(forecast, time) {
//   this.forecast = forecast;
//   this.time = new Date(time * 1000).toDateString();
// }
