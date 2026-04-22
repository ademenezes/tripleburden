'use client';

import { useEffect, useState } from 'react';
import { BASE_PATH } from '../dashboard/constants';
import type { CountryStats } from '../dashboard/types';

export function useCountries() {
  const [countries, setCountries] = useState<CountryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${BASE_PATH}/data/countries.json`)
      .then((r) => r.json())
      .then((data: CountryStats[]) => {
        if (cancelled) return;
        setCountries(data);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Failed to load countries:', err);
        setError('Failed to load country data.');
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { countries, loading, error };
}
