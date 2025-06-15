'use client'

import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { useQuery } from '@tanstack/react-query'
import { getMassSchedule } from '@/lib/api'
import { GlassPanel } from '../ui/glass-panel'

export function MassCalendar({ churchId }: { churchId: string }) {
  const [selectedDate, setSelectedDate] = useState<Date>()
  
  const { data: schedule } = useQuery({
    queryKey: ['mass-schedule', churchId, selectedDate],
    queryFn: () => getMassSchedule(churchId, selectedDate)
  })

  return (
    <GlassPanel>
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
        disabled={{ before: new Date() }}
        modifiers={{
          booked: schedule?.bookedDates || [],
          available: schedule?.availableDates || []
        }}
      />
      {selectedDate && schedule && (
        <TimeSlotPicker 
          slots={schedule.timeSlots}
          selectedDate={selectedDate}
        />
      )}
    </GlassPanel>
  )
}