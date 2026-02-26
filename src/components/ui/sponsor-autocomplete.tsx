/**
 * Componente de Autocompletado para Sponsors
 * 
 * Permite buscar sponsors existentes y crear nuevos on-the-fly.
 * 
 * Características:
 * - Búsqueda en tiempo real mientras escribes
 * - Debounce para evitar requests excesivos
 * - Opción de crear sponsor nuevo si no existe
 * - Muestra tipo de sponsor (SPONSOR/CRO)
 * - Manejo de estados de carga y error
 */

import { useState, useEffect, useRef } from 'react';
import { Input } from './input';
import { Label } from './label';
import { Button } from './button';
import { searchSponsors } from '../../lib/api';
import type { Sponsor } from '../../lib/api';

interface SponsorAutocompleteProps {
  value: string; // ID del sponsor seleccionado
  initialName?: string; // Nombre inicial del sponsor (para modo edición)
  initialType?: 'SPONSOR' | 'CRO'; // Tipo inicial del sponsor (para modo edición)
  onSelect: (sponsorId: string, sponsorName: string) => void;
  onAddNew?: () => void; // Callback para abrir modal de agregar
  disabled?: boolean;
  label?: string;
  placeholder?: string;
  error?: string; // Mensaje de error
  hasError?: boolean; // Si tiene error
}

export function SponsorAutocomplete({
  value,
  initialName,
  initialType,
  onSelect,
  onAddNew,
  disabled = false,
  label = 'Sponsor / Patrocinador',
  placeholder = 'Buscar o crear sponsor...',
  error,
  hasError = false,
}: SponsorAutocompleteProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<Sponsor[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
  
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Cargar datos iniciales cuando se proporciona (modo edición)
  useEffect(() => {
    if (initialName && value) {
      setInputValue(initialName);
      setSelectedSponsor({
        id: value,
        name: initialName,
        sponsor_type: initialType || 'SPONSOR',
      } as Sponsor);
    }
  }, [initialName, initialType, value]);

  // Cerrar sugerencias al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Buscar sponsors con debounce
  const handleSearch = async (query: string) => {
    if (query.trim().length === 0) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const results = await searchSponsors(query);
      setSuggestions(results);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error al buscar sponsors:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSelectedSponsor(null);
    onSelect('', ''); // Limpiar selección

    // Cancelar búsqueda anterior
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Buscar después de 300ms de inactividad
    debounceTimer.current = setTimeout(() => {
      handleSearch(newValue);
    }, 300);
  };

  const handleSelectSponsor = (sponsor: Sponsor) => {
    setSelectedSponsor(sponsor);
    setInputValue(sponsor.name);
    setShowSuggestions(false);
    onSelect(sponsor.id, sponsor.name);
  };

  const handleCreateNew = () => {
    setShowSuggestions(false);
    if (onAddNew) {
      onAddNew();
    }
  };

  const handleFocus = () => {
    if (inputValue.trim().length > 0 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      {label && <Label htmlFor="sponsor-input" className={hasError ? "text-red-500" : ""}>{label}</Label>}
      
      <div className="relative mt-1">
        <Input
          id="sponsor-input"
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          className={hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : (selectedSponsor ? 'border-green-500' : '')}
        />
        
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-[#04BFAD] border-t-transparent rounded-full" />
          </div>
        )}
      </div>

      {/* Sugerencias */}
      {showSuggestions && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.length > 0 ? (
            <>
              <div className="p-2 text-xs text-gray-500 border-b">
                {suggestions.length} {suggestions.length === 1 ? 'resultado' : 'resultados'}
              </div>
              {suggestions.map((sponsor) => (
                <button
                  key={sponsor.id}
                  type="button"
                  onClick={() => handleSelectSponsor(sponsor)}
                  className="w-full px-4 py-2 text-left hover:bg-[#A7F2EB]/20 transition-colors flex items-center justify-between"
                >
                  <span className="font-medium text-gray-900">{sponsor.name}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    sponsor.sponsor_type === 'CRO' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {sponsor.sponsor_type === 'CRO' ? 'CRO' : 'Sponsor'}
                  </span>
                </button>
              ))}
            </>
          ) : (
            <div className="p-4 text-center">
              <p className="text-sm text-gray-500 mb-3">
                No se encontró ningún sponsor
              </p>
              <Button
                type="button"
                onClick={handleCreateNew}
                size="sm"
                className="bg-[#04BFAD] hover:bg-[#024959] text-white"
              >
                + Agregar Nuevo Sponsor
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Indicador de sponsor seleccionado */}
      {selectedSponsor && !hasError && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-green-700 text-sm">✓ Seleccionado:</span>
            <span className="font-medium text-gray-900">{selectedSponsor.name}</span>
            <span className={`text-xs px-2 py-1 rounded ${
              selectedSponsor.sponsor_type === 'CRO' 
                ? 'bg-purple-100 text-purple-700' 
                : 'bg-blue-100 text-blue-700'
            }`}>
              {selectedSponsor.sponsor_type === 'CRO' ? 'CRO' : 'Sponsor'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedSponsor(null);
              setInputValue('');
              onSelect('', '');
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      )}

      {!hasError && (
        <p className="text-sm text-gray-500 mt-1">
          Escribe para buscar sponsors existentes o crear uno nuevo
        </p>
      )}
      {hasError && error && (
        <p className="text-sm text-red-500 font-medium mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
