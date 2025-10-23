interface ProgressProps {
  value: number
  max?: number
  className?: string
}

export function Progress({ value, max = 100, className = "" }: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 overflow-hidden ${className}`}>
      <div
        className="bg-blue-600 h-full transition-all duration-500 ease-out rounded-full"
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}
