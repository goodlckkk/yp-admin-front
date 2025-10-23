import type React from "react"

interface AvatarProps {
  children: React.ReactNode
  className?: string
}

export function Avatar({ children, className = "" }: AvatarProps) {
  return (
    <div className={`relative inline-flex items-center justify-center overflow-hidden rounded-full ${className}`}>
      {children}
    </div>
  )
}

export function AvatarFallback({ children, className = "" }: AvatarProps) {
  return (
    <div
      className={`flex items-center justify-center w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold ${className}`}
    >
      {children}
    </div>
  )
}
