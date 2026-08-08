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
import './Tab1.css';

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

const Tab1: React.FC = () => {
  const { selectedCity, setSelectedCity } = useCity();
  const { data, loading, error } = useFetchData(selectedCity);

  const weather = data ? mapCurrentToWeatherState(data.current) : null;

  return (
    <IonPage className="weather-theme-page">
      {/* Header sin bordes nativos ni sombras */}
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

          {/* Cabecera del Dashboard */}
          <div className="dashboard-hero">
            <h1 className="dashboard-title">Dashboard Principal</h1>
          </div>

          {loading ? (
            <div className="weather-status-card">
              <IonSpinner name="crescent" color="primary" />
              <IonText className="loading-text">Cargando información del clima...</IonText>
            </div>
          ) : error ? (
            <div className="weather-status-card weather-status-card--error">
              <IonText>{error}</IonText>
            </div>
          ) : weather ? (
            /* Lista en 1 sola columna */
            <div className="weather-single-column">

              {/* Temperatura */}
              <IonCard className="weather-card glass-card">
                <IonCardHeader>
                  <div className="card-header-flex">
                    <div className="card-title-wrapper">
                      <IonCardTitle>Temperatura Actual</IonCardTitle>
                      <span className="card-subtitle">Medición ambiente a 2m</span>
                    </div>
                    <div className="icon-badge badge-temp">
                      <IonIcon icon={thermometerOutline} />
                    </div>
                  </div>
                </IonCardHeader>
                <IonCardContent>
                  <div className="weather-value">{weather.temperature.toFixed(1)}<span>°C</span></div>
                </IonCardContent>
              </IonCard>

              {/* Sensación Térmica */}
              <IonCard className="weather-card glass-card">
                <IonCardHeader>
                  <div className="card-header-flex">
                    <div className="card-title-wrapper">
                      <IonCardTitle>Sensación Térmica</IonCardTitle>
                      <span className="card-subtitle">Percepción de temperatura</span>
                    </div>
                    <div className="icon-badge badge-sens">
                      <IonIcon icon={bodyOutline} />
                    </div>
                  </div>
                </IonCardHeader>
                <IonCardContent>
                  <div className="weather-value">{weather.apparentTemperature.toFixed(1)}<span>°C</span></div>
                </IonCardContent>
              </IonCard>

              {/* Velocidad del Viento */}
              <IonCard className="weather-card glass-card">
                <IonCardHeader>
                  <div className="card-header-flex">
                    <div className="card-title-wrapper">
                      <IonCardTitle>Velocidad del Viento</IonCardTitle>
                      <span className="card-subtitle">Viento a 10m de altura</span>
                    </div>
                    <div className="icon-badge badge-wind">
                      <IonIcon icon={navigateOutline} />
                    </div>
                  </div>
                </IonCardHeader>
                <IonCardContent>
                  <div className="weather-value">{weather.windSpeed.toFixed(1)} <span className="unit">km/h</span></div>
                </IonCardContent>
              </IonCard>

              {/* Humedad */}
              <IonCard className="weather-card glass-card">
                <IonCardHeader>
                  <div className="card-header-flex">
                    <div className="card-title-wrapper">
                      <IonCardTitle>Humedad Relativa</IonCardTitle>
                      <span className="card-subtitle">Porcentaje de agua en aire</span>
                    </div>
                    <div className="icon-badge badge-humidity">
                      <IonIcon icon={waterOutline} />
                    </div>
                  </div>
                </IonCardHeader>
                <IonCardContent>
                  <div className="weather-value">{weather.humidity}<span>%</span></div>
                </IonCardContent>
              </IonCard>

            </div>
          ) : null}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;