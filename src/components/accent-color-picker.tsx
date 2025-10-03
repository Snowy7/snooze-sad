"use client"

import { ACCENT_COLORS } from "@/contexts/accent-context"
import { Check } from "lucide-react"

interface AccentColorPickerProps {
  value: string
  onChange: (color: string) => void
}

export function AccentColorPicker({ value, onChange }: AccentColorPickerProps) {
  return (
    <div className="grid grid-cols-6 md:grid-cols-11 gap-3">
      {ACCENT_COLORS.map((color) => (
        <button
          key={color.value}
          type="button"
          onClick={() => onChange(color.value)}
          className={`relative h-10 w-10 rounded-lg ${color.class} hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-${color.value}-500`}
          title={color.name}
        >
          {value === color.value && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Check className="h-5 w-5 text-white drop-shadow-lg" strokeWidth={3} />
            </div>
          )}
        </button>
      ))}
    </div>
  )
}

