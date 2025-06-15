import { supabase } from '@/lib/supabase/client'
import { MassIntention, Church, MassTimeSlot } from '@/types/mass'

export class MassService {
  // Pobieranie dostępnych kościołów
  static async getChurches(filters?: {
    diocese?: string
    features?: string[]
    massType?: MassIntention['type']
  }): Promise<Church[]> {
    let query = supabase.from('churches').select('*')

    if (filters?.diocese) {
      query = query.eq('diocese', filters.diocese)
    }
    if (filters?.features) {
      query = query.contains('features', filters.features)
    }
    if (filters?.massType) {
      query = query.contains('massTypes', [filters.massType])
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  // Sprawdzanie dostępności terminów
  static async getAvailableTimeSlots(params: {
    churchId: string
    startDate: string
    endDate: string
    type: MassIntention['type']
  }): Promise<MassTimeSlot[]> {
    const { data, error } = await supabase
      .rpc('get_available_mass_slots', params)

    if (error) throw error
    return data || []
  }

  // Składanie zamówienia mszy
  static async createMassOrder(intention: Omit<MassIntention, 'id' | 'status' | 'createdAt'>): Promise<MassIntention> {
    const { data, error } = await supabase
      .from('mass_intentions')
      .insert([{
        ...intention,
        status: 'pending',
        createdAt: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Potwierdzenie płatności
  static async confirmPayment(intentionId: string): Promise<void> {
    const { error } = await supabase
      .from('mass_intentions')
      .update({
        isPaid: true,
        confirmedAt: new Date().toISOString(),
        status: 'confirmed'
      })
      .eq('id', intentionId)

    if (error) throw error
  }

  // Pobieranie zamówionych mszy użytkownika
  static async getUserIntentions(userId: string): Promise<MassIntention[]> {
    const { data, error } = await supabase
      .from('mass_intentions')
      .select('*')
      .eq('requestedBy->>email', userId)
      .order('createdAt', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Anulowanie zamówienia
  static async cancelIntention(intentionId: string): Promise<void> {
    const { error } = await supabase
      .from('mass_intentions')
      .update({
        status: 'cancelled'
      })
      .eq('id', intentionId)

    if (error) throw error
  }

  // Wysyłanie przypomnienia o mszy
  static async sendReminder(intentionId: string): Promise<void> {
    const { error } = await supabase
      .functions.invoke('send-mass-reminder', {
        body: { intentionId }
      })

    if (error) throw error
  }
}
