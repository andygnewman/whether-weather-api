const fetch = require('node-fetch');

const host = 'api.openweathermap.org';
const appid = process.env.APPID;

const defaultCities = {
  dublin: 2964574,
  liverpool: 2644210,
  birmingham: 2655603
};

const getCurrentWeather = (cityIds = Object.values(defaultCities)) => {
  const cityIdsString = cityIds.join(',');
  const id = `id=${cityIdsString}`;
  const units = 'units=metric';
  const auth = `appid=${appid}`;
  const url = `http://${host}/data/2.5/group?${id}&${units}&${auth}`;
  const method = 'POST';
  return fetch(url, {method})
    .then(response => response.json());
};


module.exports = (req) => {
  return getCurrentWeather();
};
