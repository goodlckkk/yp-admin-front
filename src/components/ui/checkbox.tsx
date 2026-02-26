"use client"

import type React from "react"
import { Icons } from "./icons"

interface CheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: React.ReactNode
  id?: string
  className?: string
  disabled?: boolean
}

export function Checkbox({ checked, onChange, label, id, className = "", disabled = false }: CheckboxProps) {
  return (
    <div className={`flex items-start ${className} ${disabled ? 'opacity-60' : ''}`}>
      <button
        type="button"
        id={id}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`flex-shrink-0 w-5 h-5 rounded border-2 transition-all ${
          checked ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300 hover:border-gray-400"
        } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {checked && <Icons.Check className="w-full h-full text-white" />}
      </button>
      {label && (
        <label
          htmlFor={id}
          className={`ml-2 text-sm text-gray-700 select-none ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          onClick={() => !disabled && onChange(!checked)}
        >
          {label}
        </label>
      )}
    </div>
  )
}
