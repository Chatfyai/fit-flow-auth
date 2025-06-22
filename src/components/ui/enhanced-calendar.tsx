import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

interface CalendarProps {
  selectedDate?: Date
  onDateSelect?: (date: Date) => void
  availableDates?: Date[]
  className?: string
  minDate?: Date
  maxDate?: Date
}

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

export const EnhancedCalendar: React.FC<CalendarProps> = ({
  selectedDate,
  onDateSelect,
  availableDates = [],
  className,
  minDate,
  maxDate
}) => {
  const [currentMonth, setCurrentMonth] = React.useState(
    selectedDate ? new Date(selectedDate.getFullYear(), selectedDate.getMonth()) : new Date()
  )

  const isDateAvailable = (date: Date) => {
    if (minDate && date < minDate) return false
    if (maxDate && date > maxDate) return false
    
    if (availableDates.length === 0) return true
    
    return availableDates.some(availableDate => 
      availableDate.toDateString() === date.toDateString()
    )
  }

  const isDateSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString()
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    
    // Ajustar para começar no domingo da semana
    startDate.setDate(startDate.getDate() - startDate.getDay())

    const days = []
    const endDate = new Date(lastDay)
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()))

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      days.push(new Date(date))
    }

    return days
  }

  const handleDateClick = (date: Date) => {
    if (isDateAvailable(date)) {
      onDateSelect?.(date)
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1)
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1)
      }
      return newMonth
    })
  }

  const days = getDaysInMonth()

  return (
    <div className={cn("bg-white rounded-2xl shadow-lg border border-gray-100 p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigateMonth('prev')}
          className="hover:bg-gray-100 rounded-xl"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <h2 className="text-xl font-semibold text-gray-900">
          {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigateMonth('next')}
          className="hover:bg-gray-100 rounded-xl"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {DAYS_OF_WEEK.map(day => (
          <div
            key={day}
            className="h-10 flex items-center justify-center text-sm font-medium text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="calendar-grid">
        {days.map((date, index) => {
          const isCurrentMonth = date.getMonth() === currentMonth.getMonth()
          const available = isDateAvailable(date)
          const selected = isDateSelected(date)
          const today = isToday(date)

          return (
            <button
              key={index}
              onClick={() => handleDateClick(date)}
              disabled={!available}
              className={cn(
                "calendar-day",
                {
                  "available": available && isCurrentMonth,
                  "selected": selected,
                  "opacity-30": !isCurrentMonth,
                  "cursor-not-allowed opacity-50": !available && isCurrentMonth,
                  "ring-2 ring-primary ring-offset-2": today && !selected,
                  "font-bold": today
                }
              )}
              aria-label={`${date.getDate()} de ${MONTHS[date.getMonth()]}`}
              aria-selected={selected}
              aria-disabled={!available}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary rounded-full"></div>
          <span className="text-xs text-gray-600">Selecionado</span>
        </div>
        {availableDates.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary/20 rounded-full"></div>
            <span className="text-xs text-gray-600">Disponível</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-primary rounded-full"></div>
          <span className="text-xs text-gray-600">Hoje</span>
        </div>
      </div>
    </div>
  )
}

export default EnhancedCalendar 