/**
 * Componente de autocompletado para códigos CIE-10
 * 
 * Permite buscar y seleccionar códigos CIE-10 (Clasificación Internacional de Enfermedades)
 * con búsqueda en tiempo real y visualización de resultados.
 * 
 * Características:
 * - Búsqueda por código o descripción
 * - Debounce para optimizar peticiones
 * - Selección múltiple
 * - Visualización de códigos seleccionados
 */

import { useState, useEffect, useRef } from "react"
import { Input } from "./input"
import { Badge } from "./badge"
import { Icons } from "./icons"
import cie10Data from "../../data/cie10-es.json"

interface Cie10Code {
  codigo: string
  nombre: string
}

interface Cie10AutocompleteProps {
  selectedCodes: string[]
  onCodesChange: (codes: string[]) => void
  placeholder?: string
  label?: string
  disabled?: boolean
}

export function Cie10Autocomplete({
  selectedCodes,
  onCodesChange,
  placeholder = "Buscar por código o enfermedad...",
  label = "Códigos CIE-10",
  disabled = false
}: Cie10AutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState<Cie10Code[]>([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedDetails, setSelectedDetails] = useState<Cie10Code[]>([])
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

  // Buscar códigos CIE-10 con debounce (búsqueda local)
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

  // Cargar detalles de códigos seleccionados (búsqueda local)
  useEffect(() => {
    if (selectedCodes.length === 0) {
      setSelectedDetails([])
      return
    }

    const details = selectedCodes
      .map(codigo => cie10Data.find(item => item.codigo === codigo))
      .filter((item): item is Cie10Code => item !== undefined)
    
    setSelectedDetails(details)
  }, [selectedCodes])

  const handleSelectCode = (code: Cie10Code) => {
    if (!selectedCodes.includes(code.codigo)) {
      onCodesChange([...selectedCodes, code.codigo])
    }
    setSearchTerm("")
    setShowDropdown(false)
    inputRef.current?.focus()
  }

  const handleRemoveCode = (codigo: string) => {
    onCodesChange(selectedCodes.filter(c => c !== codigo))
  }

  return (
    <div className="space-y-3">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {/* Input de búsqueda */}
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <Input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
                disabled={selectedCodes.includes(code.codigo)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                  selectedCodes.includes(code.codigo)
                    ? "opacity-50 cursor-not-allowed bg-gray-50"
                    : "cursor-pointer"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="font-mono text-sm font-semibold text-[#024959] min-w-[60px]">
                    {code.codigo}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{code.nombre}</p>
                  </div>
                  {selectedCodes.includes(code.codigo) && (
                    <Icons.Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Mensaje cuando no hay resultados */}
        {showDropdown && !loading && searchTerm.length >= 2 && results.length === 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500 text-sm">
            No se encontraron códigos CIE-10 para "{searchTerm}"
          </div>
        )}
      </div>

      {/* Códigos seleccionados */}
      {selectedDetails.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-600 font-medium">
            Códigos seleccionados ({selectedDetails.length}):
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedDetails.map((code) => (
              <Badge
                key={code.codigo}
                className="bg-[#024959] text-white hover:bg-[#024959]/90 pr-1 pl-3 py-1.5 text-sm"
              >
                <span className="font-mono font-semibold">{code.codigo}</span>
                <span className="mx-2">-</span>
                <span className="max-w-[200px] truncate">{code.nombre}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCode(code.codigo)}
                  disabled={disabled}
                  className="ml-2 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                  aria-label={`Eliminar ${code.codigo}`}
                >
                  <Icons.X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Ayuda */}
      <p className="text-xs text-gray-500">
        💡 Escribe al menos 2 caracteres para buscar. Puedes buscar por código (ej: "E11") o por enfermedad (ej: "diabetes").
      </p>
    </div>
  )
}
