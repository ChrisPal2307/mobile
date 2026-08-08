import './Tab2.css';
import WeatherCalendarUI from '../components/WeatherCalendarUI';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
  IonToolbar,
} from '@ionic/react';
import { bodyOutline, locationOutline, navigateOutline, thermometerOutline, waterOutline } from 'ionicons/icons';
import { useCity } from '../context/CityContext';
import useFetchData from '../hooks/useFetchData';
import type { OpenMeteoCurrentWeather } from '../types/DashboardTypes';

const CITY_NAMES = ['Guayaquil', 'Quito', 'Manta', 'Cuenca'] as const;



type WeatherState = {
  temperature: number;
  apparentTemperature: number;
  windSpeed: number;
  humidity: number;
  time: string;
};

const mapCurrentToWeatherState = (
  current: OpenMeteoCurrentWeather,
): WeatherState => ({
  temperature: current.temperature_2m,
  apparentTemperature: current.apparent_temperature,
  windSpeed: current.wind_speed_10m,
  humidity: current.relative_humidity_2m,
  time: current.time,
});


const Tab2: React.FC = () => {
  const { selectedCity, setSelectedCity } = useCity();
  const { data, loading, error } = useFetchData(selectedCity);

  const weather = data ? mapCurrentToWeatherState(data.current) : null;
  return (
    <IonPage className="weather-theme-page">
      <IonHeader className="glass-header ion-no-border">
        <IonToolbar className="custom-toolbar">
          <div slot="start" className="app-title-text">
            Clima
          </div>

          <div slot="end" className="header-select-inline">
            <IonIcon icon={locationOutline} className="header-city-icon" />
            <IonSelect
              value={selectedCity}
              interface="popover"
              placeholder="Seleccionar"
              className="header-city-select"
              onIonChange={(event) => setSelectedCity(event.detail.value)}
            >
              {CITY_NAMES.map((city) => (
                <IonSelectOption key={city} value={city}>
                  {city}
                </IonSelectOption>
              ))}
            </IonSelect>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="tab1-content">
        <div className="weather-container">

          {data?.hourly?.time ? (
            <WeatherCalendarUI time={data.hourly.time} weatherCode={data.hourly.weather_code} />
          ) : null}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
