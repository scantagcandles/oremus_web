import { massService } from './MassService';

export interface MassOrderData {
  church_id: string;
  mass_date: Date;
  intention: string;
  payment_method: string;
  payment?: any;
}

export class MassOrderingService {
  async getAvailableChurches(city?: string) {
    // Integracja z istniejącym massService
    return massService.getChurches(city);
  }

  async createMassOrder(orderData: MassOrderData) {
    // Rozszerzenie istniejącego API
    const result = await massService.orderMass(orderData);
    // Tu można dodać obsługę powiadomień, płatności itp.
    return result;
  }
}

export const massOrderingService = new MassOrderingService(); 