/**
 * Componente de autocompletado CIE-10 con SELECCIÓN MÚLTIPLE
 * Usado para alergias, otras enfermedades y condiciones excluyentes en ensayos
 * 
 * Permite seleccionar múltiples enfermedades con código y nombre CIE-10
 */

import { useState, useEffect, useRef } from "react"
import { Input } from "./input"
import { Icons } from "./icons"
import { Badge } from "./badge"
// Usar lista COMPLETA de CIE-10 (14,000+ enfermedades)
import cie10Data from "../../data/cie10-es.json"

interface Cie10Code {
  codigo: string
  nombre: string
}

interface Cie10MultipleAutocompleteProps {
  value: Array<{ codigo: string; nombre: string }> // Array de enfermedades seleccionadas
  onChange: (enfermedades: Array<{ codigo: string; nombre: string }>) => void
  placeholder?: string
  label?: string
  disabled?: boolean
  required?: boolean
  maxSelections?: number // Límite de selecciones (opcional)
}

export function Cie10MultipleAutocomplete({
  value = [], // ← Valor por defecto para evitar undefined
  onChange,
  placeholder = "Buscar enfermedades...",
  label = "Enfermedades",
  disabled = false,
  required = false,
  maxSelections
}: Cie10MultipleAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState<Cie10Code[]>([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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
      // No mostrar enfermedades ya seleccionadas
      const yaSeleccionada = value.some(v => v.codigo === item.codigo)
      if (yaSeleccionada) return false
      
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
    // Verificar límite de selecciones
    if (maxSelections && value.length >= maxSelections) {
      alert(`Solo puedes seleccionar hasta ${maxSelections} enfermedades`)
      return
    }

    // Agregar a la lista
    const nuevasEnfermedades = [...value, { codigo: item.codigo, nombre: item.nombre }]
    onChange(nuevasEnfermedades)
    
    // Limpiar búsqueda
    setSearchTerm("")
    setResults([])
    setShowDropdown(false)
    inputRef.current?.focus()
  }

  // Eliminar una enfermedad seleccionada
  const handleRemove = (codigo: string) => {
    const nuevasEnfermedades = value.filter(v => v.codigo !== codigo)
    onChange(nuevasEnfermedades)
  }

  // Limpiar todas las selecciones
  const handleClearAll = () => {
    onChange([])
    setSearchTerm("")
    setResults([])
    setShowDropdown(false)
    inputRef.current?.focus()
  }

  return (
    <div className="space-y-2" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
          {maxSelections && (
            <span className="text-xs text-gray-500 ml-2">
              (máx. {maxSelections})
            </span>
          )}
        </label>
      )}
      
      {/* Enfermedades seleccionadas */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
          {value.map((enfermedad) => (
            <Badge
              key={enfermedad.codigo}
              className="bg-[#04BFAD] text-white hover:bg-[#024959] transition-colors flex items-center gap-2 px-3 py-1.5"
            >
              <span className="font-mono text-xs font-semibold">{enfermedad.codigo}</span>
              <span className="text-sm">{enfermedad.nombre}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(enfermedad.codigo)}
                  className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                  title="Eliminar"
                >
                  <Icons.X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
          {!disabled && value.length > 1 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs text-red-600 hover:text-red-800 underline"
            >
              Limpiar todo
            </button>
          )}
        </div>
      )}
      
      {/* Input de búsqueda */}
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
            disabled={disabled || (maxSelections ? value.length >= maxSelections : false)}
            className="pr-20"
          />
          
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {loading && (
              <Icons.Loader2 className="h-4 w-4 animate-spin text-gray-400" />
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

      {/* Contador de selecciones */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          {value.length} {value.length === 1 ? 'enfermedad seleccionada' : 'enfermedades seleccionadas'}
        </span>
        {maxSelections && (
          <span>
            {value.length}/{maxSelections}
          </span>
        )}
      </div>

      {/* Ayuda */}
      <p className="text-xs text-gray-500">
        Busca por nombre de enfermedad o código CIE-10. Puedes seleccionar múltiples enfermedades.
      </p>
    </div>
  )
}
