import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { MassCalendar } from './MassCalendar'
import { StatsPanel } from './StatsPanel'
import { RecentIntentions } from './RecentIntentions'

export function AdminDashboard() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/stats')
      return res.json()
    }
  })

  return (
    <div className="p-6 space-y-6">
      <StatsPanel stats={stats} />
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8">
          <MassCalendar 
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
        </div>
        <div className="col-span-4">
          <RecentIntentions />
        </div>
      </div>
    </div>
  )
}