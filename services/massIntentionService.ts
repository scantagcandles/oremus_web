import type {
  MassIntention,
  MassIntentionStatus,
  MassIntentionFilters,
  CreateMassIntentionDTO,
} from "@/types/mass-intention";

class MassIntentionService {
  // Pobierz intencje mszalne z filtrowaniem
  async getIntentions(
    filters?: MassIntentionFilters
  ): Promise<MassIntention[]> {
    // TODO: Zintegruj z rzeczywistym API
    // Tymczasowo zwracamy mock data
    return [
      {
        id: "1",
        content: "O zdrowie dla Jana",
        preferred_date: "2025-06-21",
        preferred_time: "18:00",
        mass_type: "Msza święta",
        requestor_name: "Anna Kowalska",
        requestor_email: "anna@example.com",
        requestor_phone: "+48 123 456 789",
        offering_amount: 100,
        is_paid: true,
        status: "pending",
        church_id: "1",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "2",
        content: "Za † Marię w 1. rocznicę śmierci",
        preferred_date: "2025-06-21",
        preferred_time: "7:00",
        mass_type: "Msza święta",
        requestor_name: "Piotr Nowak",
        requestor_email: "piotr@example.com",
        requestor_phone: null,
        offering_amount: 50,
        is_paid: false,
        status: "confirmed",
        church_id: "1",
        priest_id: "1",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }

  // Zaktualizuj status intencji
  async updateIntentionStatus(
    intentionId: string,
    status: MassIntentionStatus
  ): Promise<MassIntention> {
    // TODO: Zintegruj z rzeczywistym API
    return {
      id: intentionId,
      content: "Mock intention",
      preferred_date: "2025-06-21",
      preferred_time: "18:00",
      mass_type: "Msza święta",
      requestor_name: "Mock User",
      requestor_email: "mock@example.com",
      requestor_phone: null,
      offering_amount: 100,
      is_paid: true,
      status,
      church_id: "1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  // Utwórz nową intencję
  async createIntention(data: CreateMassIntentionDTO): Promise<MassIntention> {
    // TODO: Zintegruj z rzeczywistym API
    return {
      id: Math.random().toString(),
      ...data,
      paid: false,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

export const massIntentionService = new MassIntentionService();
