"use client"
import { FC } from 'react'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  trend: string
  isPositive: boolean
  icon: LucideIcon
  color: string
}

export const StatsCard: FC<StatsCardProps> = ({ 
  title, 
  value, 
  trend, 
  isPositive, 
  icon: Icon, 
  color 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-glass-black rounded-xl p-6"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-white/70 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-white">{value}</h3>
        </div>
        <div className={cn("p-3 rounded-lg bg-glass-white", color)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-4">
        <span className={cn(
          "text-sm font-medium",
          isPositive ? "text-success" : "text-error"
        )}>
          {trend}
        </span>
        <span className="text-sm text-white/50 ml-1">vs. poprzedni okres</span>
      </div>
    </motion.div>
  )
}

interface ChartData {
  date: string
  value: number
}

export const TrendChart: FC<{ data: ChartData[] }> = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.value))
  const minValue = Math.min(...data.map(d => d.value))

  return (
    <div className="h-64">
      {/* Simple SVG line chart implementation */}
      <svg width="100%" height="100%" className="overflow-visible">
        {/* Create line chart using SVG path */}
        <path
          d={`M ${data.map((d, i) => {
            const x = (i / (data.length - 1)) * 100
            const y = 100 - ((d.value - minValue) / (maxValue - minValue)) * 100
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
          }).join(' ')}`}
          fill="none"
          stroke="currentColor"
          className="text-secondary"
          strokeWidth={2}
        />
      </svg>
    </div>
  )
}

interface PieChartData {
  name: string
  value: number
}

export const PieChartComponent: FC<{ data: PieChartData[] }> = ({ data }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  let currentAngle = 0

  return (
    <div className="relative h-64">
      <svg width="100%" height="100%" viewBox="0 0 100 100">
        {data.map((d, i) => {
          const angle = (d.value / total) * 360
          const x1 = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180)
          const y1 = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180)
          const x2 = 50 + 40 * Math.cos(((currentAngle + angle) * Math.PI) / 180)
          const y2 = 50 + 40 * Math.sin(((currentAngle + angle) * Math.PI) / 180)
          
          const path = `
            M 50 50
            L ${x1} ${y1}
            A 40 40 0 ${angle > 180 ? 1 : 0} 1 ${x2} ${y2}
            Z
          `

          currentAngle += angle

          return (
            <path
              key={d.name}
              d={path}
              fill={`hsl(${i * 60}, 70%, 60%)`}
              className="opacity-80 hover:opacity-100 transition-opacity"
            />
          )
        })}
      </svg>
      {/* Legend */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: `hsl(${i * 60}, 70%, 60%)` }} 
            />
            <span className="text-sm text-white/70">{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

interface LineChartData {
  date: string
  value: number
}

export const LineChartComponent: FC<{ data: LineChartData[] }> = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.value))
  const minValue = Math.min(...data.map(d => d.value))

  return (
    <div className="h-64">
      <svg width="100%" height="100%" className="overflow-visible">
        {/* Grid lines */}
        {[...Array(5)].map((_, i) => (
          <line
            key={i}
            x1="0"
            y1={i * 25}
            x2="100%"
            y2={i * 25}
            stroke="currentColor"
            className="text-white/10"
            strokeDasharray="4"
          />
        ))}
        
        {/* Line chart */}
        <path
          d={`M ${data.map((d, i) => {
            const x = (i / (data.length - 1)) * 100
            const y = 100 - ((d.value - minValue) / (maxValue - minValue)) * 100
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
          }).join(' ')}`}
          fill="none"
          stroke="currentColor"
          className="text-secondary"
          strokeWidth={2}
        />
        
        {/* Data points */}
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * 100
          const y = 100 - ((d.value - minValue) / (maxValue - minValue)) * 100
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={3}
              className="fill-secondary"
            />
          )
        })}
      </svg>
    </div>
  )
}

interface MetricsTableProps {
  data: {
    metric: string
    value: string | number
    change: string
    trend: 'up' | 'down' | 'neutral'
  }[]
}

export const MetricsTable: FC<MetricsTableProps> = ({ data }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-glass-white">
            <th className="px-4 py-3 text-left text-sm font-medium text-white/70">Metryka</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-white/70">Wartość</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-white/70">Zmiana</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b border-glass-white last:border-0">
              <td className="px-4 py-3 text-sm text-white">{row.metric}</td>
              <td className="px-4 py-3 text-right text-sm text-white">{row.value}</td>
              <td className={cn(
                "px-4 py-3 text-right text-sm font-medium",
                row.trend === 'up' ? "text-success" : 
                row.trend === 'down' ? "text-error" : 
                "text-white/70"
              )}>
                {row.change}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// All components are exported above