/**
 * Componente de autocompletado para selección ÚNICA de código CIE-10
 * Usado para "Condición Principal" en el formulario de pacientes
 */

import { useState, useEffect, useRef } from "react"
import { Input } from "./input"
import { Icons } from "./icons"
import cie10Data from "../../data/cie10-es.json"

interface Cie10Code {
  codigo: string
  nombre: string
}

interface Cie10SingleAutocompleteProps {
  value: string // Nombre de la enfermedad seleccionada
  selectedCode: string // Código CIE-10 seleccionado
  onChange: (nombre: string, codigo: string) => void
  placeholder?: string
  label?: string
  disabled?: boolean
  required?: boolean
}

export function Cie10SingleAutocomplete({
  value,
  selectedCode,
  onChange,
  placeholder = "Buscar enfermedad...",
  label = "Condición Principal",
  disabled = false,
  required = false
}: Cie10SingleAutocompleteProps) {
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

  // Buscar códigos CIE-10 con debounce
  useEffect(() => {
    if (searchTerm.length < 2) {
      setResults([])
      setShowDropdown(false)
      return
    }

    const timer = setTimeout(() => {
      setLoading(true)
      try {
        const query = searchTerm.toLowerCase()
        const filtered = cie10Data.filter((item) => {
          const codigoMatch = item.codigo.toLowerCase().includes(query)
          const nombreMatch = item.nombre.toLowerCase().includes(query)
          return codigoMatch || nombreMatch
        }).slice(0, 10) // Limitar a 10 resultados
        
        setResults(filtered)
        setShowDropdown(filtered.length > 0)
      } catch (error) {
        console.error("Error buscando códigos CIE-10:", error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300) // Debounce de 300ms

    return () => clearTimeout(timer)
  }, [searchTerm])

  const handleSelectCode = (code: Cie10Code) => {
    onChange(code.nombre, code.codigo)
    setSearchTerm(code.nombre)
    setShowDropdown(false)
    inputRef.current?.blur()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchTerm(newValue)
    // Si el usuario borra todo, limpiar también el código
    if (newValue === "") {
      onChange("", "")
    }
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Input de búsqueda */}
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <Input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={disabled}
            className="pr-10"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {loading ? (
              <Icons.Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            ) : (
              <Icons.Search className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>

        {/* Dropdown de resultados */}
        {showDropdown && results.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {results.map((code) => (
              <button
                key={code.codigo}
                type="button"
                onClick={() => handleSelectCode(code)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-gray-900 flex-1">{code.nombre}</p>
                  {selectedCode === code.codigo && (
                    <Icons.Check className="w-4 h-4 text-green-600 shrink-0" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Mensaje cuando no hay resultados */}
        {showDropdown && !loading && searchTerm.length >= 2 && results.length === 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500 text-sm">
            No se encontraron enfermedades para "{searchTerm}"
          </div>
        )}
      </div>

      {/* Mostrar código seleccionado */}
      {selectedCode && (
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Icons.Check className="w-3 h-3 text-green-600" />
          <span>Código CIE-10: <span className="font-mono font-semibold">{selectedCode}</span></span>
        </div>
      )}

      {/* Ayuda */}
      <p className="text-xs text-gray-500">
        💡 Escribe al menos 2 caracteres para buscar. Puedes buscar por código (ej: "E11") o por enfermedad (ej: "diabetes").
      </p>
    </div>
  )
}
