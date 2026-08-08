export interface OpenMeteoCurrentWeather {
  temperature_2m: number;
  apparent_temperature: number;
  relative_humidity_2m: number;
  wind_speed_10m: number;
  time: string;
}

export interface OpenMeteoHourlyWeather {
  time: string[];
  weather_code?: number[];
}

export interface OpenMeteoResponse {
  current: OpenMeteoCurrentWeather;
  hourly: OpenMeteoHourlyWeather;
}
