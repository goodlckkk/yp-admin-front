import { useState, useEffect } from 'react';
import api from '../lib/axios-instance';

export interface Commune {
  id: number;
  nombre: string;
  region: string;
  activa: boolean;
}

export interface CommuneOption {
  value: string;
  label: string;
}

export function useCommunes() {
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCommunes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<Commune[]>('/communes');
      setCommunes(response.data);
    } catch (err) {
      setError('Error al cargar las comunas');
      console.error('Error fetching communes:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCommunesByRegion = (regionName: string): CommuneOption[] => {
    if (!regionName || !communes.length) return [];
    
    return communes
      .filter(commune => 
        commune.region.toLowerCase() === regionName.toLowerCase() && 
        commune.activa
      )
      .map(commune => ({
        value: commune.nombre.toLowerCase().replace(/\s+/g, '_'),
        label: commune.nombre
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  };

  const getAllRegions = (): string[] => {
    const uniqueRegions = [...new Set(communes.map(c => c.region))];
    return uniqueRegions.sort();
  };

  useEffect(() => {
    fetchCommunes();
  }, []);

  return {
    communes,
    loading,
    error,
    getCommunesByRegion,
    getAllRegions,
    refetch: fetchCommunes
  };
}