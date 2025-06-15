'use client'

import { FC, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Table,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RotateCcw,
  Search,
  Filter,
  Download
} from 'lucide-react'
import GlassCard from '@/components/glass/GlassCard'
import { GlassInput } from '@/components/glass/GlassInput'
import { GlassSelect } from '@/components/glass/GlassSelect'
import { GlassButton } from '@/components/glass/GlassButton'
import { DataGrid } from '@/components/admin/DataGrid'
import { paymentStatus } from '@/lib/constants'
import { formatCurrency, formatDateTime } from '@/lib/utils'

interface Payment {
  id: string
  amount: number
  status: keyof typeof paymentStatus
  method: string
  intentionId: string
  createdAt: string
  updatedAt: string
}

export const PaymentDashboard: FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateRange, setDateRange] = useState('week')
  const [sortBy, setSortBy] = useState('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)

  // Mock data for now
  const payments: Payment[] = [
    {
      id: '1',
      amount: 100,
      status: 'completed',
      method: 'card',
      intentionId: 'int_1',
      createdAt: '2025-06-14T10:00:00Z',
      updatedAt: '2025-06-14T10:01:00Z'
    },
    // Add more mock data...
  ]

  const statusBadgeColor = (status: keyof typeof paymentStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-success/20 text-success'
      case 'pending':
        return 'bg-warning/20 text-warning'
      case 'processing':
        return 'bg-info/20 text-info'
      case 'failed':
        return 'bg-error/20 text-error'
      default:
        return 'bg-glass-white text-white/70'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Płatności</h2>

        <div className="flex flex-wrap gap-4">
          <GlassInput
            placeholder="Szukaj po ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={Search}
          />
          
          <GlassSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'Wszystkie statusy' },
              ...Object.entries(paymentStatus).map(([value, label]) => ({
                value,
                label
              }))
            ]}
          />

          <GlassSelect
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            options={[
              { value: 'today', label: 'Dziś' },
              { value: 'week', label: 'Tydzień' },
              { value: 'month', label: 'Miesiąc' },
              { value: 'year', label: 'Rok' }
            ]}
          />

          <GlassButton variant="secondary">
            <Filter className="w-4 h-4 mr-2" />
            Filtry
          </GlassButton>

          <GlassButton variant="secondary">
            <Download className="w-4 h-4 mr-2" />
            Eksportuj
          </GlassButton>
        </div>
      </div>

      {/* Payments Grid */}
      <GlassCard className="p-6">
        <DataGrid
          data={payments}
          columns={[
            { field: 'id', headerName: 'ID' },
            { 
              field: 'amount', 
              headerName: 'Kwota',
              render: (value) => formatCurrency(value)
            },
            { 
              field: 'status', 
              headerName: 'Status',
              render: (value) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadgeColor(value)}`}>
                  {paymentStatus[value]}
                </span>
              )
            },
            { field: 'method', headerName: 'Metoda' },
            { 
              field: 'createdAt', 
              headerName: 'Data',
              render: (value) => formatDateTime(value)
            }
          ]}
        />
      </GlassCard>

      {/* Payment Details Modal */}
      {selectedPayment && (
        <GlassModal
          isOpen={true}
          onClose={() => setSelectedPayment(null)}
          title="Szczegóły płatności"
        >
          <div className="space-y-4">
            {/* Payment info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-white/50 text-sm">ID płatności</p>
                <p className="text-white">{selectedPayment.id}</p>
              </div>
              <div>
                <p className="text-white/50 text-sm">ID intencji</p>
                <p className="text-white">{selectedPayment.intentionId}</p>
              </div>
              <div>
                <p className="text-white/50 text-sm">Kwota</p>
                <p className="text-white">{formatCurrency(selectedPayment.amount)}</p>
              </div>
              <div>
                <p className="text-white/50 text-sm">Status</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  statusBadgeColor(selectedPayment.status)
                }`}>
                  {paymentStatus[selectedPayment.status]}
                </span>
              </div>
              <div>
                <p className="text-white/50 text-sm">Data utworzenia</p>
                <p className="text-white">{formatDateTime(selectedPayment.createdAt)}</p>
              </div>
              <div>
                <p className="text-white/50 text-sm">Ostatnia aktualizacja</p>
                <p className="text-white">{formatDateTime(selectedPayment.updatedAt)}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <GlassButton
                variant="secondary"
                className="flex-1"
                disabled={selectedPayment.status === 'completed'}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Potwierdź płatność
              </GlassButton>
              <GlassButton
                variant="secondary"
                className="flex-1"
                disabled={selectedPayment.status === 'cancelled'}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Anuluj
              </GlassButton>
              <GlassButton
                variant="secondary"
                className="flex-1"
                disabled={!['failed', 'cancelled'].includes(selectedPayment.status)}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Spróbuj ponownie
              </GlassButton>
            </div>
          </div>
        </GlassModal>
      )}
    </div>
  )
}
