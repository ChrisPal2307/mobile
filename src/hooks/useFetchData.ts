import { useEffect, useState } from 'react';
import type { OpenMeteoResponse } from '../types/DashboardTypes';

const CITYCOORDS: Record<string, { latitude: number; longitude: number }> = {
  Guayaquil: { latitude: -2.1962, longitude: -79.8862 },
  Quito: { latitude: -0.1807, longitude: -78.4678 },
  Manta: { latitude: -0.9471, longitude: -80.7089 },
  Cuenca: { latitude: -2.9006, longitude: -79.0045 },
};

const buildUrl = (latitude: number, longitude: number): string =>
  `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,wind_speed_10m,weather_code&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m`;

export default function useFetchData(
  selectedOption: string | null,
): { data: OpenMeteoResponse | null; loading: boolean; error: string | null } {
  const [data, setData] = useState<OpenMeteoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cityConfig = selectedOption ? CITYCOORDS[selectedOption] : CITYCOORDS.Guayaquil;
  const url = buildUrl(cityConfig.latitude, cityConfig.longitude);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Error ${response.status}`);
        }

        const jsonData: OpenMeteoResponse = await response.json();
        setData(jsonData);
      } catch (fetchError) {
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          return;
        }
        setError(fetchError instanceof Error ? fetchError.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => controller.abort();
  }, [url]);

  return { data, loading, error };
}
