import { SupabaseClient } from '@supabase/supabase-js';
import { MassIntention, MassIntentionFilters, MassIntentionStats, MassIntentionStatus } from '@/types/mass-intention';

export class MassIntentionService {
  constructor(private supabase: SupabaseClient) {}

  async createIntention(intention: Omit<MassIntention, 'id' | 'created_at' | 'updated_at'>): Promise<MassIntention> {
    const { data, error } = await this.supabase
      .from('mass_intentions')
      .insert(intention)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async updateIntention(id: string, updates: Partial<MassIntention>): Promise<MassIntention> {
    const { data, error } = await this.supabase
      .from('mass_intentions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async getIntention(id: string): Promise<MassIntention> {
    const { data, error } = await this.supabase
      .from('mass_intentions')
      .select('*, churches(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async listIntentions(filters?: MassIntentionFilters) {
    let query = this.supabase
      .from('mass_intentions')
      .select('*, churches(*)', { count: 'exact' });

    if (filters) {
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.dateRange) {
        query = query
          .gte('preferred_date', filters.dateRange.start.toISOString())
          .lte('preferred_date', filters.dateRange.end.toISOString());
      }

      if (filters.church) {
        query = query.eq('church_id', filters.church);
      }

      if (filters.massType) {
        query = query.eq('mass_type', filters.massType);
      }

      if (filters.search) {
        query = query.or(`
          content.ilike.%${filters.search}%,
          requestor_name.ilike.%${filters.search}%,
          requestor_email.ilike.%${filters.search}%
        `);
      }
    }

    const { data, error, count } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return { data, count };
  }

  async getStats(dateRange?: { start: Date; end: Date }): Promise<MassIntentionStats> {
    let query = this.supabase.from('mass_intentions').select('*');

    if (dateRange) {
      query = query
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;

    const stats: MassIntentionStats = {
      total: data.length,
      pending: data.filter(i => i.status === MassIntentionStatus.PENDING_PAYMENT).length,
      paid: data.filter(i => i.status === MassIntentionStatus.PAID).length,
      completed: data.filter(i => i.status === MassIntentionStatus.COMPLETED).length,
      cancelled: data.filter(i => i.status === MassIntentionStatus.CANCELLED).length,
      totalRevenue: data.reduce((sum, i) => sum + (i.payment_amount || 0), 0),
      avgProcessingTime: this.calculateAvgProcessingTime(data),
    };

    return stats;
  }

  private calculateAvgProcessingTime(intentions: MassIntention[]): number {
    const completedIntentions = intentions.filter(
      i => i.status === MassIntentionStatus.COMPLETED && i.scheduled_date
    );

    if (completedIntentions.length === 0) return 0;

    const totalTime = completedIntentions.reduce((sum, i) => {
      const created = new Date(i.created_at);
      const completed = new Date(i.scheduled_date!);
      return sum + (completed.getTime() - created.getTime());
    }, 0);

    return totalTime / completedIntentions.length / (1000 * 60 * 60 * 24); // Convert to days
  }
}
