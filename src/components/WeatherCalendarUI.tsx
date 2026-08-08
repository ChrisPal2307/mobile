import {
  IonCard,
  IonCardContent,
  IonCol,
  IonGrid,
  IonImg,
  IonRow,
  IonText,
} from '@ionic/react';
import soleado from '../assets/clima/soleado.png';
import nublado from '../assets/clima/nublado.png';
import lluvia from '../assets/clima/lluvia.png';
import nieve from '../assets/clima/nieve.png';
import tormenta from '../assets/clima/tormenta.png';

interface WeatherCalendarInfo {
  time: string[];
  temperature?: number[];
  weatherCode?: number[];
}

function getWeatherIcon(code?: number) {
  if (code === undefined) {
    return nublado;
  }

  if ([0, 1, 2].includes(code)) {
    return soleado;
  }

  if ([3, 45, 48].includes(code)) {
    return nublado;
  }

  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
    return lluvia;
  }

  if ([71, 73, 75, 77].includes(code)) {
    return nieve;
  }

  if ([95, 96, 99].includes(code)) {
    return tormenta;
  }

  return nublado;
}

function getWeatherName(code?: number) {
  if (code === undefined) return 'Desconocido';
  if ([0, 1, 2].includes(code)) return 'Soleado';
  if ([3, 45, 48].includes(code)) return 'Nublado';
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return 'Lluvia';
  if ([71, 73, 75, 77].includes(code)) return 'Nieve';
  if ([95, 96, 99].includes(code)) return 'Tormenta';
  return 'Desconocido';
}

export default function WeatherCalendarUI({ time, weatherCode }: WeatherCalendarInfo) {
  if (!time.length) {
    return null;
  }

  const today = new Date(time[0]).toISOString().split('T')[0];

  const allEntries = time
    .map((value, index) => ({
      originalTime: value,
      dateIso: value.split('T')[0],
      // Extract hour:minute directly from ISO string to avoid timezone shifts
      timeLabel: value.includes('T') ? value.split('T')[1].slice(0,5) : new Date(value).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' }),
      dateLabel: new Date(value).toLocaleDateString('es-EC', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
      }),
      weatherCode: weatherCode?.[index],
    }));

  const todayEntries = allEntries.filter((entry) => entry.dateIso === today);

  const entriesForDay = todayEntries.length ? todayEntries : allEntries;

  // Select hours starting at 06:00, step 3h until 21:00 -> [6,9,12,15,18,21]
  const desiredHours = [6, 9, 12, 15, 18, 21];

  const selected = entriesForDay
    .filter((entry) => {
      const hourStr = entry.originalTime.includes('T') ? entry.originalTime.split('T')[1].slice(0,2) : String(new Date(entry.originalTime).getHours()).padStart(2, '0');
      const hour = Number(hourStr);
      return desiredHours.includes(hour);
    })
    .sort((a, b) => new Date(a.originalTime).getTime() - new Date(b.originalTime).getTime());

  // Fallback: if no matching hours found, pick first two entries
  if (selected.length === 0) {
    const fallback = entriesForDay.slice(0, 2);
    selected.push(...fallback);
  }

  return (
  <div style={{ width: '100%', marginTop: '8px' }}>
    <IonGrid style={{ padding: 0 }}>
      <IonRow style={{ alignItems: 'stretch', justifyContent: 'center' }}>
        {selected.map((entry) => (
          <IonCol size="6" key={entry.originalTime}>
            <IonCard
              style={{
                width: '100%',
                minHeight: '180px',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxSizing: 'border-box',
                padding: '8px',
                margin: '0', // Asegura que los márgenes del card no rompan la grilla
              }}
            >
              <IonCardContent
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  height: '100%',
                  padding: '12px',
                  textAlign: 'center',
                }}
              >
                <IonImg
                  src={getWeatherIcon(entry.weatherCode)}
                  alt="Icono del clima"
                  style={{ width: '72px', height: '72px', objectFit: 'contain', marginBottom: '8px' }}
                />

                <IonText color="dark">
                  <h6 style={{ fontWeight: 600, margin: '4px 0 0' }}>
                    {getWeatherName(entry.weatherCode)}
                  </h6>
                </IonText>

                <div style={{ marginTop: '8px' }}>
                  <IonText color="medium">
                    <p style={{ margin: 0, fontSize: '0.95rem' }}>{entry.dateLabel}</p>
                  </IonText>
                  <IonText color="medium">
                    <p style={{ margin: '2px 0 0', fontSize: '0.85rem' }}>{entry.timeLabel}</p>
                  </IonText>
                </div>
              </IonCardContent>
            </IonCard>
          </IonCol>
        ))}
      </IonRow>
    </IonGrid>
  </div>
);


}
