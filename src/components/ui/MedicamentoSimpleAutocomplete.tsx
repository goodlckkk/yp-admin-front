/**
 * Componente de Autocomplete Simple para Medicamentos
 * 
 * CARACTERÍSTICAS:
 * - Autocomplete con 300+ medicamentos más comunes en Chile
 * - Permite agregar medicamentos personalizados (texto libre)
 * - Selección múltiple con badges
 * - SOLO NOMBRES (sin dosis ni frecuencia)
 * 
 * EJEMPLO DE USO:
 * <MedicamentoSimpleAutocomplete
 *   label="Medicamentos Actuales"
 *   value={medicamentos}
 *   onChange={(meds) => setMedicamentos(meds)}
 * />
 */

import { useState, useEffect, useRef } from 'react';
import { Label } from './label';
import { Input } from './input';
import { Button } from './button';
import medicamentosData from '../../data/medicamentos-chile.json';

interface MedicamentoSimpleAutocompleteProps {
  label?: string;
  value: string[];
  onChange: (medicamentos: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  maxSelections?: number;
}

export function MedicamentoSimpleAutocomplete({
  label = 'Medicamentos',
  value = [],
  onChange,
  placeholder = 'Buscar medicamento o escribir uno personalizado...',
  disabled = false,
  maxSelections,
}: MedicamentoSimpleAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Filtrar medicamentos según búsqueda
  const filteredMedicamentos = searchTerm.trim()
    ? medicamentosData.filter((med) =>
        med.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Cerrar sugerencias al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Agregar medicamento (desde autocomplete o personalizado)
  const agregarMedicamento = (nombreMed: string) => {
    if (!nombreMed.trim()) return;

    // Verificar si ya existe
    const yaExiste = value.some(
      (m) => m.toLowerCase() === nombreMed.toLowerCase()
    );

    if (yaExiste) {
      alert('Este medicamento ya está agregado');
      return;
    }

    // Verificar límite de selecciones
    if (maxSelections && value.length >= maxSelections) {
      alert(`Solo puedes agregar hasta ${maxSelections} medicamentos`);
      return;
    }

    onChange([...value, nombreMed]);

    // Limpiar campos
    setSearchTerm('');
    setShowSuggestions(false);
    setHighlightedIndex(-1);
  };

  // Eliminar medicamento
  const eliminarMedicamento = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  // Limpiar todos
  const limpiarTodo = () => {
    onChange([]);
  };

  // Manejar teclas
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || filteredMedicamentos.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        // Agregar como medicamento personalizado
        agregarMedicamento(searchTerm);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredMedicamentos.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          agregarMedicamento(filteredMedicamentos[highlightedIndex].nombre);
        } else {
          // Agregar como personalizado
          agregarMedicamento(searchTerm);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}

      {/* Campo de búsqueda */}
      <div className="space-y-2">
        <div className="relative">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(true);
                setHighlightedIndex(-1);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className="flex-1"
            />
            <Button
              type="button"
              onClick={() => agregarMedicamento(searchTerm)}
              disabled={disabled || !searchTerm.trim()}
            >
              Agregar
            </Button>
          </div>

          {/* Sugerencias de autocomplete */}
          {showSuggestions && filteredMedicamentos.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
            >
              {filteredMedicamentos.slice(0, 50).map((med, index) => (
                <div
                  key={index}
                  className={`px-3 py-2 cursor-pointer hover:bg-blue-50 ${
                    index === highlightedIndex ? 'bg-blue-100' : ''
                  }`}
                  onClick={() => agregarMedicamento(med.nombre)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <div className="font-medium text-gray-900">{med.nombre}</div>
                  <div className="text-xs text-gray-500">
                    {med.categoria}
                    {med.presentaciones && med.presentaciones.length > 0 && (
                      <span className="ml-2">
                        • {med.presentaciones.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Mensaje si no hay resultados */}
          {showSuggestions &&
            searchTerm.trim() &&
            filteredMedicamentos.length === 0 && (
              <div
                ref={suggestionsRef}
                className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-3"
              >
                <p className="text-sm text-gray-600">
                  No se encontró en la lista. Presiona <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Enter</kbd> o haz clic en "Agregar" para agregar "{searchTerm}" como medicamento personalizado.
                </p>
              </div>
            )}
        </div>
      </div>

      {/* Medicamentos seleccionados */}
      {value.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Medicamentos agregados ({value.length}
              {maxSelections && `/${maxSelections}`})
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={limpiarTodo}
              disabled={disabled}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Limpiar todo
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {value.map((med, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-200"
              >
                <span className="font-medium">{med}</span>
                <button
                  type="button"
                  onClick={() => eliminarMedicamento(index)}
                  disabled={disabled}
                  className="hover:text-red-600 transition-colors"
                  title="Eliminar medicamento"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ayuda */}
      <p className="text-xs text-gray-500">
        💡 Busca en la lista de medicamentos comunes o escribe uno personalizado
      </p>
    </div>
  );
}
