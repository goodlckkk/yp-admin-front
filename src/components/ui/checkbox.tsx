"use client"

import type React from "react"
import { Icons } from "./Icons"

interface CheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: React.ReactNode
  id?: string
  className?: string
}

export function Checkbox({ checked, onChange, label, id, className = "" }: CheckboxProps) {
  return (
    <div className={`flex items-start ${className}`}>
      <button
        type="button"
        id={id}
        onClick={() => onChange(!checked)}
        className={`flex-shrink-0 w-5 h-5 rounded border-2 transition-all ${
          checked ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300 hover:border-gray-400"
        }`}
      >
        {checked && <Icons.Check className="w-full h-full text-white" />}
      </button>
      {label && (
        <label
          htmlFor={id}
          className="ml-2 text-sm text-gray-700 cursor-pointer select-none"
          onClick={() => onChange(!checked)}
        >
          {label}
        </label>
      )}
    </div>
  )
}
