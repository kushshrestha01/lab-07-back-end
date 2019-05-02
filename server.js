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
    let weather;
    const queryData = request.query.data.latitude;
    const queryData2 = request.query.data.longitude;
    let weatherURL = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${queryData},${queryData2}`;
    superagent.get(weatherURL)
      .end( (err, weatherResponse) => {
        weather = weatherResponse.body.daily.data.map(element =>{
          return new WeatherObject(element.summary, element.time);
        });
        response.send(weather);
        console.log(weather);
      });
    console.log('here', weather);
  }
  catch(error) {
    console.error(error);
    response.status(500).send('Status: 500. So sorry, something went wrong.');
  }
});


function WeatherObject(forecast, time) {
  this.forecast = forecast;
  this.time = new Date(time * 1000).toDateString();
}


//Lets start eventbrite here

//Following codes have been referenced to class lecture from Michelle.
app.get('/events', getEvents);

function getEvents(request, response){
  try {
    const url = `https://www.eventbriteapi.com/v3/events/search?location.address=${request.query.data.formatted_query}`;

    superagent.get(url)
      .set('Authorization', `Bearer ${process.env.EVENTBRITE_API_KEY}`)
      .then(result =>{
        const events = result.body.events.map(eventData =>{
          const event = new EventObject(eventData);
          return event;
        });
        response.send(events);
      });

  }
  catch (error) {
    console.error(error);
    response.status(500).send('Status: 500. So sorry, something went wrong.');
  }
}



function EventObject(event) {
  this.link = event.url;
  this.name = event.name.text;
  this.event_date = new Date('');
  this.summary = event.summary;
}

//Eventbrite end here


app.listen(PORT, () => console.log(`Listening on PORT ${PORT}`));
