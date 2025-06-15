'use client'

import { useState, useEffect } from 'react'
import { CandleService } from '@/services/candleService'
import { OremusCandle, CandleStats } from '@/types/candle'

export default function AdminPanel() {
  const [activeCandles, setActiveCandles] = useState<OremusCandle[]>([])
  const [stats, setStats] = useState<CandleStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      const [candlesData, statsData] = await Promise.all([
        CandleService.getActiveCandles(),
        CandleService.getCandleStats()
      ])
      setActiveCandles(candlesData)
      setStats(statsData)
    } catch (err) {
      setError('Błąd podczas ładowania danych')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleExtendCandle = async (candleId: string) => {
    try {
      await CandleService.extendCandle({
        candle_id: candleId,
        hours: 24 // Przedłużenie o 24h
      })
      await loadData() // Odświeżenie danych
    } catch (err) {
      setError('Błąd podczas przedłużania świecy')
    }
  }

  if (loading) {
    return <div className="p-8">Ładowanie...</div>
  }

  if (error) {
    return (
      <div className="p-8 text-red-600">
        {error}
        <button
          onClick={loadData}
          className="ml-4 text-blue-600 hover:underline"
        >
          Spróbuj ponownie
        </button>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Panel Administracyjny Świec</h1>

      {/* Statystyki */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Aktywne Świece</h3>
            <p className="text-3xl text-primary">{stats.total_active}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Wygasłe Świece</h3>
            <p className="text-3xl text-gray-600">{stats.total_expired}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Według Typu</h3>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span>Standard:</span>
                <span>{stats.by_type.standard}</span>
              </li>
              <li className="flex justify-between">
                <span>Premium:</span>
                <span>{stats.by_type.premium}</span>
              </li>
              <li className="flex justify-between">
                <span>Deluxe:</span>
                <span>{stats.by_type.deluxe}</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Lista aktywnych świec */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID NFC
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Typ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data Aktywacji
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data Wygaśnięcia
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Intencja
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Akcje
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {activeCandles.map((candle) => (
              <tr key={candle.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {candle.nfc_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {candle.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(candle.activation_date!).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(candle.expiry_date!).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {candle.intention || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleExtendCandle(candle.id)}
                    className="text-primary hover:text-primary/80"
                  >
                    Przedłuż o 24h
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
