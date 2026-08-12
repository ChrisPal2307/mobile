import {
  IonButton,
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
import { locationOutline } from 'ionicons/icons';
import { useEffect, useMemo, useState } from 'react';
import { useCity } from '../context/CityContext';
import useFetchData from '../hooks/useFetchData';
import type { OpenMeteoResponse } from '../types/DashboardTypes';
import './Tab1.css';
import './Tab3.css';

const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString('es-EC', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatDateShort = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString('es-EC', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatHour = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleTimeString('es-EC', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

type DayGroup = {
  label: string;
  date: string;
  rows: Array<{ time: string; temperature: number; windSpeed: number }>;
};

type WeeklyChart = {
  width: number;
  height: number;
  temperaturePath: string;
  windPath: string;
  minValue: number;
  maxValue: number;
  xTicks: Array<{ x: number; label: string }>;
  yTicks: Array<{ y: number; label: string }>;
};

const WEEK_HOURS = 24 * 7;

const Tab3: React.FC = () => {
  const { selectedCity, setSelectedCity } = useCity();
  const { data, loading, error } = useFetchData(selectedCity);
  const [dayIndex, setDayIndex] = useState(0);

  useEffect(() => {
    setDayIndex(0);
  }, [selectedCity, data]);

  const dayGroups = useMemo<DayGroup[]>(() => {
    if (!data) return [];

    const { time, temperature_2m, wind_speed_10m } = data.hourly;
    const groups: Record<string, DayGroup> = {};

    time.forEach((isoTime, index) => {
      const dayKey = new Date(isoTime).toLocaleDateString('es-EC');
      if (!groups[dayKey]) {
        groups[dayKey] = {
          label: new Date(isoTime).toLocaleDateString('es-EC', { weekday: 'long' }),
          date: formatDateShort(isoTime),
          rows: [],
        };
      }
      if (groups[dayKey].rows.length < 24) {
        groups[dayKey].rows.push({
          time: formatHour(isoTime),
          temperature: temperature_2m[index],
          windSpeed: wind_speed_10m[index],
        });
      }
    });

    return Object.values(groups).slice(0, 7);
  }, [data]);

  const weeklyChart = useMemo<WeeklyChart | null>(() => {
    if (!data) return null;

    const { time, temperature_2m, wind_speed_10m } = data.hourly;
    const count = Math.min(time.length, WEEK_HOURS);
    if (count === 0) return null;

    const points = Array.from({ length: count }, (_, index) => ({
      time: time[index],
      temperature: temperature_2m[index],
      windSpeed: wind_speed_10m[index],
    }));

    const temperatureValues = points.map((point) => point.temperature);
    const windValues = points.map((point) => point.windSpeed);
    const minValue = Math.min(...temperatureValues, ...windValues);
    const maxValue = Math.max(...temperatureValues, ...windValues);

    const width = Math.max(1000, count * 24);
    const height = 260;
    const padding = 40;
    const xStep = count > 1 ? (width - padding * 2) / (count - 1) : 0;
    const valueRange = maxValue - minValue || 1;

    const yScale = (value: number) =>
      height - padding - ((value - minValue) / valueRange) * (height - padding * 2);

    const temperaturePath = points
      .map((point, index) => `${padding + index * xStep},${yScale(point.temperature)}`)
      .join(' ');
    const windPath = points
      .map((point, index) => `${padding + index * xStep},${yScale(point.windSpeed)}`)
      .join(' ');

    const xTicks = points.reduce<Array<{ x: number; label: string }>>((ticks, point, index) => {
      const timeObj = new Date(point.time);
      if (timeObj.getHours() === 0) {
        ticks.push({ x: padding + index * xStep, label: timeObj.toLocaleDateString('es-EC', { day: '2-digit', month: '2-digit' }) });
      }
      return ticks;
    }, []);

    if (xTicks.length === 0) {
      xTicks.push({ x: padding, label: new Date(time[0]).toLocaleDateString('es-EC', { day: '2-digit', month: '2-digit' }) });
    }

    const yTickCount = 5;
    const yTicks = Array.from({ length: yTickCount }, (_, index) => {
      const value = minValue + ((maxValue - minValue) / (yTickCount - 1)) * index;
      const y = yScale(value);
      return { y, label: `${value.toFixed(0)}` };
    });

    return { width, height, temperaturePath, windPath, minValue, maxValue, xTicks, yTicks };
  }, [data]);

  const currentDay = dayGroups[dayIndex];
  const totalDays = dayGroups.length;
  const canGoPrev = dayIndex > 0;
  const canGoNext = dayIndex < totalDays - 1;

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
              <IonSelectOption value="Guayaquil">Guayaquil</IonSelectOption>
              <IonSelectOption value="Quito">Quito</IonSelectOption>
              <IonSelectOption value="Manta">Manta</IonSelectOption>
              <IonSelectOption value="Cuenca">Cuenca</IonSelectOption>
            </IonSelect>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="tab3-content">
        <div className="weather-container">
          <div className="dashboard-hero">
            <h1 className="dashboard-title">Resumen Semanal</h1>
            <p className="dashboard-subtitle">Hora, fecha, temperatura y viento en una sola vista.</p>
          </div>

          {loading ? (
            <div className="weather-status-card">
              <IonSpinner name="crescent" color="primary" />
              <IonText className="loading-text">Cargando información semanal...</IonText>
            </div>
          ) : error ? (
            <div className="weather-status-card weather-status-card--error">
              <IonText>{error}</IonText>
            </div>
          ) : data ? (
            <>
              <IonCard className="weather-card glass-card">
                <IonCardHeader>
                  <div className="card-header-flex">
                    <div className="card-title-wrapper">
                      <IonCardTitle>Gráfico Semanal</IonCardTitle>
                      <span className="card-subtitle">Temperatura y velocidad del viento por hora</span>
                    </div>
                  </div>
                </IonCardHeader>
                <IonCardContent>
                  <div className="chart-scroll-horizontal">
                    <div className="chart-wrapper">
                      <svg viewBox={`0 0 ${weeklyChart?.width ?? 0} ${weeklyChart?.height ?? 0}`} className="weather-chart" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.9" />
                            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.2" />
                          </linearGradient>
                        </defs>
                        <rect x="0" y="0" width={weeklyChart?.width} height={weeklyChart?.height} fill="rgba(255,255,255,0.92)" rx="18" />
                        {weeklyChart && (
                          <>
                            {weeklyChart.yTicks.map((tick, index) => (
                              <g key={`y-${index}`}>
                                <line x1="40" y1={tick.y} x2={weeklyChart.width - 20} y2={tick.y} stroke="rgba(15,23,42,0.08)" />
                                <text x="28" y={tick.y + 5} textAnchor="end" fill="#0c4a6e" fontSize="20" fontWeight="600">
                                  {tick.label}
                                </text>
                              </g>
                            ))}
                            <polyline points={weeklyChart.temperaturePath} fill="none" stroke="#0ea5e9" strokeWidth="2.5" />
                            <polyline points={weeklyChart.windPath} fill="none" stroke="#f59e0b" strokeWidth="2.5" />
                            {weeklyChart.xTicks.map((tick) => (
                              <g key={tick.label}>
                                <line x1={tick.x} y1={weeklyChart.height - 38} x2={tick.x} y2={weeklyChart.height - 30} stroke="rgba(15,23,42,0.2)" />
                                <text x={tick.x} y={weeklyChart.height - 12} textAnchor="middle" fill="#0c4a6e" fontSize="20" fontWeight="600">
                                  {tick.label}
                                </text>
                              </g>
                            ))}
                          </>
                        )}
                      </svg>
                    </div>
                  </div>
                  <div className="chart-legend">
                    <span><span className="legend-dot legend-temp" />Temperatura</span>
                    <span><span className="legend-dot legend-wind" />Velocidad del Viento</span>
                  </div>
                </IonCardContent>
              </IonCard>

              <IonCard className="weather-card glass-card">
                <IonCardHeader>
                  <div className="card-header-flex">
                    <div className="card-title-wrapper">
                      <IonCardTitle>Clima del Día</IonCardTitle>
                      <span className="card-subtitle">Hora, temperatura y viento</span>
                    </div>
                  </div>
                </IonCardHeader>
                <IonCardContent>
                  <div className="week-nav">
                    <div className="week-label">
                      {currentDay ? `${currentDay.label} • ${currentDay.date}` : 'Selecciona un día'}
                    </div>
                    <div className="week-actions">
                      <IonButton fill="outline" size="small" disabled={!canGoPrev} onClick={() => setDayIndex((prev) => Math.max(0, prev - 1))}>
                        Anterior
                      </IonButton>
                      <IonButton fill="outline" size="small" disabled={!canGoNext} onClick={() => setDayIndex((prev) => Math.min(totalDays - 1, prev + 1))}>
                        Siguiente
                      </IonButton>
                    </div>
                  </div>

                  <div className="table-scroll">
                    <table className="weather-table">
                      <thead>
                        <tr>
                          <th>Hora</th>
                          <th>Temperatura</th>
                          <th>Viento</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentDay && currentDay.rows.length > 0 ? (
                          currentDay.rows.map((row, index) => (
                            <tr key={`${currentDay.date}-${row.time}-${index}`}>
                              <td>{row.time}</td>
                              <td>{row.temperature.toFixed(1)}°C</td>
                              <td>{row.windSpeed.toFixed(1)} km/h</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="no-data-text">
                              No hay datos de clima disponibles para este día.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </IonCardContent>
              </IonCard>
            </>
          ) : (
            <div className="weather-status-card">
              <IonText>No se encontraron datos de clima.</IonText>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab3;
