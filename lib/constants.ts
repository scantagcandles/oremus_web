export const dateRanges = [
  { value: 'today', label: 'Dziś' },
  { value: 'yesterday', label: 'Wczoraj' },
  { value: 'week', label: 'Tydzień' },
  { value: 'month', label: 'Miesiąc' },
  { value: 'quarter', label: 'Kwartał' },
  { value: 'year', label: 'Rok' },
  { value: 'custom', label: 'Niestandardowy' }
]

export const churchTypes = [
  { value: 'parish', label: 'Parafia' },
  { value: 'cathedral', label: 'Katedra' },
  { value: 'sanctuary', label: 'Sanktuarium' },
  { value: 'chapel', label: 'Kaplica' }
]

export const massTypes = [
  { id: 'regular', name: 'Zwykła', price: 50 },
  { id: 'gregorian', name: 'Gregoriańska', price: 1500 },
  { id: 'wedding', name: 'Ślubna', price: 600 },
  { id: 'funeral', name: 'Pogrzebowa', price: 400 },
  { id: 'special', name: 'Okolicznościowa', price: 100 }
]

export const paymentMethods = [
  { id: 'card', name: 'Karta kredytowa' },
  { id: 'blik', name: 'BLIK' },
  { id: 'p24', name: 'Przelewy24' },
  { id: 'paypal', name: 'PayPal' }
]

export const notificationTypes = [
  { id: 'email', name: 'Email' },
  { id: 'sms', name: 'SMS' },
  { id: 'push', name: 'Push' }
]

export const intentionStatus = {
  pending_payment: 'Oczekuje na płatność',
  paid: 'Opłacona',
  confirmed: 'Potwierdzona',
  completed: 'Odprawiona',
  cancelled: 'Anulowana',
  refunded: 'Zwrócona'
} as const

export const paymentStatus = {
  pending: 'Oczekująca',
  processing: 'W trakcie',
  completed: 'Zakończona',
  failed: 'Nieudana',
  refunded: 'Zwrócona',
  cancelled: 'Anulowana'
} as const

export const analyticsMetrics = {
  financial: [
    'total_revenue',
    'average_order_value',
    'refund_rate',
    'conversion_rate'
  ],
  intentions: [
    'total_intentions',
    'intentions_per_church',
    'completion_rate',
    'cancellation_rate'
  ],
  users: [
    'total_users',
    'active_users',
    'new_users',
    'returning_users'
  ],
  churches: [
    'total_churches',
    'active_churches',
    'masses_per_church',
    'average_fill_rate'
  ]
} as const

export const monitoringAlerts = {
  system: [
    'high_cpu_usage',
    'high_memory_usage',
    'high_error_rate',
    'slow_response_time'
  ],
  business: [
    'low_intention_count',
    'high_cancellation_rate',
    'payment_failures',
    'church_inactivity'
  ],
  security: [
    'suspicious_login',
    'multiple_failures',
    'api_abuse',
    'data_anomaly'
  ]
} as const
