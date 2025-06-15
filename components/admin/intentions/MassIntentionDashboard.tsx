import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { toast } from 'react-toastify';
import { Calendar, ChevronLeft, ChevronRight, Filter, Search } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { GlassCard } from '@/components/glass/GlassCard';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassInput } from '@/components/glass/GlassInput';
import { GlassSelect } from '@/components/glass/GlassSelect';
import { DataGrid } from '@/components/admin/DataGrid';
import { StatsCard } from '@/components/admin/analytics/StatsCard';
import { TrendChart } from '@/components/admin/analytics/TrendChart';
import { MassIntentionService } from '@/services/massIntentionService';
import { 
  MassIntention,
  MassIntentionStatus,
  MassIntentionFilters,
  MassIntentionStats,
  MASS_TYPES
} from '@/types/mass-intention';

export default function MassIntentionDashboard() {
  const [intentions, setIntentions] = useState<MassIntention[]>([]);
  const [stats, setStats] = useState<MassIntentionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<MassIntentionFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const supabase = createClientComponentClient();
  const service = new MassIntentionService(supabase);

  const { register, handleSubmit } = useForm<MassIntentionFilters>();

  const loadData = async () => {
    try {
      setLoading(true);
      const { data } = await service.listIntentions(filters);
      const stats = await service.getStats();
      setIntentions(data || []);
      setStats(stats);
    } catch (error) {
      console.error('Error loading intentions:', error);
      toast.error('Nie udało się załadować intencji');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  const handleFilterSubmit = (data: MassIntentionFilters) => {
    setFilters(data);
  };

  const handleStatusChange = async (id: string, status: MassIntentionStatus) => {
    try {
      await service.updateIntention(id, { status });
      toast.success('Status został zaktualizowany');
      loadData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Nie udało się zaktualizować statusu');
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Wszystkie intencje"
            value={stats.total}
            icon="inbox"
          />
          <StatsCard
            title="Oczekujące na płatność"
            value={stats.pending}
            trend={(stats.pending / stats.total) * 100}
            icon="clock"
          />
          <StatsCard
            title="Przychód całkowity"
            value={`${stats.totalRevenue / 100} zł`}
            icon="banknote"
          />
          <StatsCard
            title="Śr. czas realizacji"
            value={`${Math.round(stats.avgProcessingTime)} dni`}
            icon="timer"
          />
        </div>
      )}

      {/* Filters */}
      <GlassCard className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Intencje mszalne</h2>
          <GlassButton
            onClick={() => setShowFilters(!showFilters)}
            variant="secondary"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtry
          </GlassButton>
        </div>

        {showFilters && (
          <form onSubmit={handleSubmit(handleFilterSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <GlassInput
              {...register('search')}
              label="Szukaj"
              placeholder="Wyszukaj w intencjach..."
              icon={Search}
            />
            
            <GlassSelect
              {...register('status')}
              label="Status"
              options={Object.values(MassIntentionStatus).map(status => ({
                value: status,
                label: status
                  .replace(/_/g, ' ')
                  .toLowerCase()
                  .replace(/\b\w/g, l => l.toUpperCase())
              }))}
            />

            <GlassSelect
              {...register('massType')}
              label="Typ mszy"
              options={MASS_TYPES.map(type => ({
                value: type.id,
                label: type.name
              }))}
            />

            <div className="md:col-span-3 flex justify-end">
              <GlassButton type="submit">
                Zastosuj filtry
              </GlassButton>
            </div>
          </form>
        )}

        <DataGrid
          data={intentions}
          loading={loading}
          columns={[
            {
              header: 'Data',
              accessor: 'preferred_date',
              cell: ({ value }) => format(new Date(value), 'dd.MM.yyyy', { locale: pl })
            },
            {
              header: 'Typ mszy',
              accessor: 'mass_type',
              cell: ({ value }) => MASS_TYPES.find(t => t.id === value)?.name || value
            },
            {
              header: 'Intencja',
              accessor: 'content'
            },
            {
              header: 'Status',
              accessor: 'status',
              cell: ({ value, row }) => (
                <GlassSelect
                  value={value}
                  onChange={(e) => handleStatusChange(row.original.id, e.target.value as MassIntentionStatus)}
                  options={Object.values(MassIntentionStatus).map(status => ({
                    value: status,
                    label: status
                      .replace(/_/g, ' ')
                      .toLowerCase()
                      .replace(/\b\w/g, l => l.toUpperCase())
                  }))}
                  className="min-w-[150px]"
                />
              )
            },
            {
              header: 'Płatność',
              accessor: 'payment_amount',
              cell: ({ value }) => value ? `${value / 100} zł` : '-'
            }
          ]}
          pagination
          sortable
        />
      </GlassCard>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard className="p-4">
          <h3 className="text-lg font-bold text-white mb-4">Intencje według statusu</h3>
          <TrendChart
            data={[
              { name: 'Oczekujące', value: stats?.pending || 0 },
              { name: 'Opłacone', value: stats?.paid || 0 },
              { name: 'Zrealizowane', value: stats?.completed || 0 },
              { name: 'Anulowane', value: stats?.cancelled || 0 }
            ]}
          />
        </GlassCard>

        <GlassCard className="p-4">
          <h3 className="text-lg font-bold text-white mb-4">Przychód (ostatnie 30 dni)</h3>
          <TrendChart
            data={[]} // TODO: Implement revenue over time data
            type="line"
          />
        </GlassCard>
      </div>
    </div>
  );
}
