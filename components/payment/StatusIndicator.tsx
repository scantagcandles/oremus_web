import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/solid'
import type { PaymentStatus } from '@/types/payment'

interface StatusIndicatorProps {
  status: PaymentStatus
}

export function StatusIndicator({ status }: StatusIndicatorProps) {
  const config = {
    pending: {
      icon: ClockIcon,
      color: 'text-yellow-500',
      text: 'Oczekuje na potwierdzenie'
    },
    completed: {
      icon: CheckCircleIcon,
      color: 'text-green-500',
      text: 'Płatność zatwierdzona'
    },
    failed: {
      icon: XCircleIcon,
      color: 'text-red-500',
      text: 'Płatność nie powiodła się'
    }
  }

  const StatusIcon = config[status].icon

  return (
    <div className="flex items-center space-x-2">
      <StatusIcon className={`w-6 h-6 ${config[status].color}`} />
      <span className="font-medium">{config[status].text}</span>
    </div>
  )
}