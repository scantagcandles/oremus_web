import { Badge } from '@/components/ui/badge'
import type { PaymentStatus } from '@/types/payment'

interface PaymentStatusBadgeProps {
  status: PaymentStatus
}

const statusConfig = {
  pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Oczekuje' },
  processing: { color: 'bg-blue-100 text-blue-800', label: 'W trakcie' },
  completed: { color: 'bg-green-100 text-green-800', label: 'Zakończone' },
  failed: { color: 'bg-red-100 text-red-800', label: 'Nieudane' },
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  const { color, label } = statusConfig[status]

  return <Badge className={color}>{label}</Badge>
}