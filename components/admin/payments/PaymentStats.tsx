import { useMemo } from 'react'
import { BarChart, PieChart } from '@/components/charts'
import type { Payment } from '@/types/payment'

interface PaymentStatsProps {
  payments: Payment[]
}

export function PaymentStats({ payments }: PaymentStatsProps) {
  const stats = useMemo(() => {
    return {
      total: payments?.reduce((sum, p) => sum + p.amount, 0) || 0,
      byMethod: payments?.reduce((acc, p) => ({
        ...acc,
        [p.method]: (acc[p.method] || 0) + 1
      }), {} as Record<string, number>),
      byStatus: payments?.reduce((acc, p) => ({
        ...acc,
        [p.status]: (acc[p.status] || 0) + 1
      }), {} as Record<string, number>)
    }
  }, [payments])

  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Metody płatności</h3>
        <PieChart data={Object.entries(stats.byMethod)} />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Status płatności</h3>
        <BarChart data={Object.entries(stats.byStatus)} />
      </div>
    </div>
  )
}