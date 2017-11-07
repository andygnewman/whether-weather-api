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
            temp: item.main.temp
          }
        };
      });
    });
};

const getForecastWeather = (cityIds) => {
  const forecastDates = [];
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
          const temps = []
          list.map((item, index) => {
            const forecastDate = new Date(item.dt_txt);
            if (forecastDate.getHours() === 12) {
              if (!forecastDates.includes(forecastDate.toString())) {
                forecastDates.push(forecastDate.toString());
              }
              temps.push(item.main.temp);
            }
          });
          return {
            location,
            temps
          };
        });
    };
    promises.push(promise());
  });
  return Promise.all(promises)
    .then(forecasts => {
      return {
        forecastDates,
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
        }).temps;
        resultObject.observations.push(current);
      });
      return resultObject;
    });
};
