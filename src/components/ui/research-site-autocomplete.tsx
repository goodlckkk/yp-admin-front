/**
 * Componente de Autocomplete para Sitios de Investigación
 * 
 * Permite buscar y seleccionar sitios de investigación existentes.
 * Si no se encuentra el sitio deseado, muestra un botón para agregar uno nuevo.
 */

import { useState, useEffect, useRef } from 'react';
import { Label } from './label';
import { Input } from './input';
import { Button } from './button';
import { searchResearchSites } from '../../lib/api';

interface ResearchSiteAutocompleteProps {
  value: string; // ID del sitio seleccionado
  initialName?: string; // Nombre inicial del sitio (para modo edición)
  onSelect: (siteId: string, siteName: string) => void;
  onAddNew?: () => void; // Callback para abrir modal de agregar
  disabled?: boolean;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string; // Mensaje de error
  hasError?: boolean; // Si tiene error
}

export function ResearchSiteAutocomplete({
  value,
  initialName,
  onSelect,
  onAddNew,
  disabled = false,
  label = "Sitio de Investigación",
  placeholder = "Buscar institución...",
  required = false,
  error,
  hasError = false,
}: ResearchSiteAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedSite, setSelectedSite] = useState<any | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Cargar nombre inicial cuando se proporciona (modo edición)
  useEffect(() => {
    if (initialName && value) {
      setSearchTerm(initialName);
      setSelectedSite({
        id: value,
        nombre: initialName,
      });
    }
  }, [initialName, value]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Buscar sitios con debounce
  const handleSearch = async (query: string) => {
    if (query.trim().length === 0) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const sites = await searchResearchSites(query);
      setResults(sites);
      setShowResults(true);
    } catch (error) {
      console.error('Error al buscar sitios:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelect = (site: any) => {
    setSelectedSite(site);
    setSearchTerm(site.nombre);
    setShowResults(false);
    onSelect(site.id, site.nombre);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setSelectedSite(null);
    onSelect('', '');

    // Cancelar búsqueda anterior
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Buscar después de 300ms de inactividad
    debounceTimer.current = setTimeout(() => {
      handleSearch(newValue);
    }, 300);
  };

  const handleFocus = () => {
    if (searchTerm.trim().length > 0 && results.length > 0) {
      setShowResults(true);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      {label && <Label htmlFor="research-site-search" className={hasError ? "text-red-500" : ""}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>}
      
      <div className="relative mt-1">
        <Input
          id="research-site-search"
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          className={hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : (selectedSite ? 'border-green-500' : '')}
        />
        
        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-[#04BFAD] border-t-transparent rounded-full"></div>
          </div>
        )}

        {/* Sugerencias */}
        {showResults && !disabled && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {results.length > 0 ? (
              <>
                <div className="p-2 text-xs text-gray-500 border-b">
                  {results.length} {results.length === 1 ? 'resultado' : 'resultados'}
                </div>
                {results.map((site) => (
                  <button
                    key={site.id}
                    type="button"
                    onClick={() => handleSelect(site)}
                    className="w-full px-4 py-2 text-left hover:bg-[#A7F2EB]/20 transition-colors"
                  >
                    <div className="font-medium text-gray-900">{site.nombre}</div>
                    {(site.ciudad || site.region) && (
                      <div className="text-sm text-gray-600">
                        {[site.ciudad, site.region].filter(Boolean).join(', ')}
                      </div>
                    )}
                  </button>
                ))}
              </>
            ) : (
              <div className="p-4 text-center">
                <p className="text-sm text-gray-500 mb-3">
                  No se encontró ninguna institución
                </p>
                {onAddNew && (
                  <Button
                    type="button"
                    onClick={() => {
                      setShowResults(false);
                      onAddNew();
                    }}
                    size="sm"
                    className="bg-[#04BFAD] hover:bg-[#024959] text-white"
                  >
                    + Agregar Nueva Institución
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Indicador de sitio seleccionado */}
      {selectedSite && !hasError && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-green-700 text-sm">✓ Seleccionado:</span>
            <span className="font-medium text-gray-900">{selectedSite.nombre}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedSite(null);
              setSearchTerm('');
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
          Escribe para buscar instituciones existentes o crear una nueva
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
