require('dotenv').config();
const express = require('express');
const getWeather = require('./src/get-weather');

const port = process.env.PORT || 3000;


const app = express();

app.get('/', (req, res) => {
  return getWeather(req)
  .then(weather => res.json({msg: weather}));
})

app.listen(port, () => console.log(`App listening on port ${port}, yippeeee`));
