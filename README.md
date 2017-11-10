# whether-weather-api
API for [Whether Weather Better App](https://github.com/andygnewman/whether-weather-better)

I built this as my first example of integrating a redis cache to provide a way of storing slow changing API responses for a fixed period between querying the API again.

This queries the (https://openweathermap.org/api) for weather data and consolidates the data into what is required for the Whether Weather Better App.

So once the data has been retrieved from the API and manipulated it is stored in the cache for 15mins, during which time if that data is requested again, it is served from the cache. Once the 15 mins is up, the data is expunged from the cache and when a request is received the original API will be queried.
