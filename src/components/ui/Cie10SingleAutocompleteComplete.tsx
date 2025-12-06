/**
 * Componente de autocompletado CIE-10 con lista COMPLETA (14,000 enfermedades)
 * Usado SOLO en el dashboard para edición de pacientes por el admin
 */

import { useState, useEffect, useRef } from "react"
import { Input } from "./input"
import { Icons } from "./icons"
// Usar lista COMPLETA de CIE-10 (14,000+ enfermedades)
import cie10Data from "../../data/cie10-es.json"

interface Cie10Code {
  codigo: string
  nombre: string
}

interface Cie10SingleAutocompleteCompleteProps {
  value: string // Nombre de la enfermedad seleccionada
  selectedCode: string // Código CIE-10 seleccionado
  onChange: (nombre: string, codigo: string) => void
  placeholder?: string
  label?: string
  disabled?: boolean
  required?: boolean
}

export function Cie10SingleAutocompleteComplete({
  value,
  selectedCode,
  onChange,
  placeholder = "Buscar enfermedad...",
  label = "Condición Principal",
  disabled = false,
  required = false
}: Cie10SingleAutocompleteCompleteProps) {
  const [searchTerm, setSearchTerm] = useState(value)
  const [results, setResults] = useState<Cie10Code[]>([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sincronizar searchTerm con value cuando cambia externamente
  useEffect(() => {
    setSearchTerm(value)
  }, [value])

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Buscar enfermedades
  const handleSearch = (term: string) => {
    setSearchTerm(term)
    
    if (term.length < 2) {
      setResults([])
      setShowDropdown(false)
      return
    }

    setLoading(true)
    
    // Buscar por nombre o código
    const searchLower = term.toLowerCase()
    const filtered = cie10Data.filter((item: Cie10Code) => {
      const nombreMatch = item.nombre.toLowerCase().includes(searchLower)
      const codigoMatch = item.codigo.toLowerCase().includes(searchLower)
      return nombreMatch || codigoMatch
    })

    // Limitar resultados a 50 para mejor rendimiento
    setResults(filtered.slice(0, 50))
    setShowDropdown(true)
    setLoading(false)
  }

  // Seleccionar una enfermedad
  const handleSelect = (item: Cie10Code) => {
    setSearchTerm(item.nombre)
    onChange(item.nombre, item.codigo)
    setShowDropdown(false)
  }

  // Limpiar selección
  const handleClear = () => {
    setSearchTerm("")
    onChange("", "")
    setResults([])
    setShowDropdown(false)
    inputRef.current?.focus()
  }

  return (
    <div className="space-y-2" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        <div className="relative">
          <Input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => {
              if (searchTerm.length >= 2) {
                handleSearch(searchTerm)
              }
            }}
            placeholder={placeholder}
            disabled={disabled}
            className="pr-20"
          />
          
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {loading && (
              <Icons.Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            )}
            {searchTerm && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                title="Limpiar"
              >
                <Icons.X className="h-4 w-4 text-gray-400" />
              </button>
            )}
            <Icons.Search className="h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Dropdown de resultados */}
        {showDropdown && results.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {results.map((item, index) => (
              <button
                key={`${item.codigo}-${index}`}
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full px-4 py-2 text-left hover:bg-[#A7F2EB]/20 transition-colors border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm text-gray-900 flex-1">
                    {item.nombre}
                  </span>
                  <span className="text-xs font-mono font-semibold text-[#04BFAD] whitespace-nowrap">
                    {item.codigo}
                  </span>
                </div>
              </button>
            ))}
            
            {results.length === 50 && (
              <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 border-t">
                Mostrando primeros 50 resultados. Refina tu búsqueda para ver más.
              </div>
            )}
          </div>
        )}

        {/* Mensaje cuando no hay resultados */}
        {showDropdown && searchTerm.length >= 2 && results.length === 0 && !loading && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4">
            <p className="text-sm text-gray-500 text-center">
              No se encontraron resultados para "{searchTerm}"
            </p>
          </div>
        )}
      </div>

      {/* Mostrar código seleccionado */}
      {selectedCode && (
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span className="font-medium">Código CIE-10:</span>
          <span className="font-mono font-semibold text-[#04BFAD]">{selectedCode}</span>
        </div>
      )}

      {/* Ayuda */}
      <p className="text-xs text-gray-500">
        Busca por nombre de enfermedad o código CIE-10. Lista completa de 14,000+ enfermedades.
      </p>
    </div>
  )
}
