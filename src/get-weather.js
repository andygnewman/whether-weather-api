const fetch = require('node-fetch');

const HOST = 'api.openweathermap.org';
const APPID = process.env.APPID;
const AUTH = `appid=${APPID}`;
const UNITS = 'units=metric';
const METHOD = 'POST';

const getCurrentWeather = (cityIds) => {
  const cityIdsString = cityIds.join(',');
  const id = `id=${cityIdsString}`;
  const url = `http://${HOST}/data/2.5/group?${id}&${UNITS}&${AUTH}`;
  return fetch(url, {method: METHOD})
    .then(response => response.json())
    .then(response => {
      const list = response.list;
      return list.map(item => {
        return {
          location: item.name,
          current: {
            temp: item.main.temp,
            rain: (item.rain && item.rain["3h"]) || 0,
            wind: (item.wind && item.wind.speed) || 0
          }
        };
      });
    });
};

const getForecastWeather = (cityIds) => {
  const promises = [];
  cityIds.map(city => {
    const promise = () => {
      const url = `http://${HOST}/data/2.5/forecast?id=${city}&${UNITS}&${AUTH}`;
      return fetch(url, {method: METHOD})
        .then(response => {
          return response.json();
        })
        .then(response => {
          const list = response.list;
          const location = response.city.name;
          return list.reduce((acc, item) => {
            const forecastDate = new Date(item.dt_txt);
            const date = `${forecastDate.getDate()}/${('0'+(forecastDate.getMonth() + 1)).slice(-2)}`;
            if (!acc[date]) {
              acc[date] = {
                temp: false,
                wind: 0,
                precip: 0
              }
            }
            if (!acc[date].temp || item.main.temp > acc[date].temp) {
              acc[date].temp = item.main.temp;
            }
            if (item.wind && item.wind.speed > acc[date].wind) {
              acc[date].wind = item.wind.speed;
            }
            if (item.rain && item.rain["3h"]) acc[date].precip += item.rain["3h"];
            if (item.snow && item.snow["3h"]) acc[date].precip += item.snow["3h"];
            return acc;
          }, { location });
        });
    };
    promises.push(promise());
  });
  return Promise.all(promises)
    .then(forecasts => {
      return {
        forecasts
      }
    });
};

module.exports = (cityIds) => {
  const promises = [getCurrentWeather(cityIds), getForecastWeather(cityIds)];
  return Promise.all(promises)
    .then(weather => {
      const [currentWeather, forecastWeather] = weather;
      const resultObject = {};
      resultObject.forecastDates = forecastWeather.forecastDates;
      resultObject.observations = [];
      currentWeather.map(current => {
        current.forecasts = forecastWeather.forecasts.find(forecast => {
          return forecast.location === current.location
        });
        resultObject.observations.push(current);
      });
      return resultObject;
    });
};
