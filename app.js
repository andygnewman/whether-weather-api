require('dotenv').config();
const express = require('express');
const getWeather = require('./src/get-weather');
const redis = require('redis');
const redisURL = process.env.REDIS_URL;

const port = process.env.PORT || 3000;

const app = express();
const client = redis.createClient(redisURL);

const getCityIds = (req) => {
  const defaultCities = {
    dublin: 2964574,
    liverpool: 2644210,
    birmingham: 2655603
  };
  return (req.query.ids && req.query.ids.split(','))|| Object.values(defaultCities);
}

const checkCache = (req, res, next) => {
  client.get(getCityIds(req).join(':'), (err, weather) => {
    if (err) throw err;
    if (weather != null) {
        res.json({weather: JSON.parse(weather), cache: true});
    } else {
        next();
    }
  });
};

app.get('/', checkCache, (req, res) => {
  const cityIds = getCityIds(req);
  return getWeather(cityIds)
  .then(weather => {
    client.set(cityIds.join(':'), JSON.stringify(weather), 'EX', 60 * 15);
    res.json({weather, cache: false});
  });
})

app.listen(port, () => console.log(`App listening on port ${port}, yippeeee`));
