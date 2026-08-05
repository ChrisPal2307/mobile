import { useEffect, useState } from 'react';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonPage,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import './Tab1.css';

type WeatherState = {
  temperature: number;
  apparentTemperature: number;
  windSpeed: number;
  humidity: number;
  time: string;
};

const API_URL =
  'https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&hourly=temperature_2m,relative_humidity_2m,weather_code,apparent_temperature,wind_speed_10m&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m';

const Tab1: React.FC = () => {
  const [weather, setWeather] = useState<WeatherState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchWeather = async () => {
      try {
        const response = await fetch(API_URL, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Error ${response.status}`);
        }
        const data = await response.json();
        const current = data.current;
        if (!current) {
          throw new Error('No se encontraron datos actuales');
        }

        setWeather({
          temperature: current.temperature_2m,
          apparentTemperature: current.apparent_temperature,
          windSpeed: current.wind_speed_10m,
          humidity: current.relative_humidity_2m,
          time: current.time,
        });
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        setError(err instanceof Error ? err.message : 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    return () => controller.abort();
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Clima actual</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="tab1-content">
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Clima actual</IonTitle>
          </IonToolbar>
        </IonHeader>

        <div className="weather-page">
          <div className="weather-header">
            <h2>Clima en Berlín</h2>
            <p>Datos actuales desde Open-Meteo</p>
          </div>

          {loading ? (
            <div className="weather-status">
              <IonSpinner name="crescent" />
              <IonText>Cargando información del clima...</IonText>
            </div>
          ) : error ? (
            <div className="weather-status weather-status--error">
              <IonText>{error}</IonText>
            </div>
          ) : weather ? (
            <div className="weather-grid">
              <IonCard className="weather-card weather-card--sunny">
                <IonCardHeader>
                  <IonCardTitle>Temperatura</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <div className="weather-value">{weather.temperature.toFixed(1)}°C</div>
                </IonCardContent>
              </IonCard>

              <IonCard className="weather-card weather-card--soft">
                <IonCardHeader>
                  <IonCardTitle>Temperatura aparente</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <div className="weather-value">{weather.apparentTemperature.toFixed(1)}°C</div>
                </IonCardContent>
              </IonCard>

              <IonCard className="weather-card weather-card--mint">
                <IonCardHeader>
                  <IonCardTitle>Velocidad del viento</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <div className="weather-value">{weather.windSpeed.toFixed(1)} km/h</div>
                </IonCardContent>
              </IonCard>

              <IonCard className="weather-card weather-card--peach">
                <IonCardHeader>
                  <IonCardTitle>Humedad relativa</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <div className="weather-value">{weather.humidity}%</div>
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
