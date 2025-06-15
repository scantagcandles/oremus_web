export interface MassIntention {
  id: string;
  churchId: string;
  userId: string;
  date: Date;
  time: string;
  intentionType: MassIntentionType;
  customIntention?: string;
  status: MassIntentionStatus;
  payment: PaymentDetails;
  celebrant?: string;
  isCollective: boolean;
}

export type MassIntentionType = 
  | 'deceased'
  | 'family'
  | 'health'
  | 'thanksgiving'
  | 'special'
  | 'custom';

export type MassIntentionStatus = 
  | 'pending'
  | 'confirmed'
  | 'paid'
  | 'completed'
  | 'cancelled';

export interface Church {
  id: string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  contact: {
    email: string;
    phone: string;
  };
  schedule: MassSchedule[];
  isVerified: boolean;
}

export interface MassType {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export const MASS_TYPES: MassType[] = [
  {
    id: 'standard',
    name: 'Msza zwykła',
    price: 50,
    description: 'Msza odprawiana w zwykłym terminie'
  },
  {
    id: 'wedding',
    name: 'Msza ślubna',
    price: 600,
    description: 'Msza święta z ceremoniałem zaślubin'
  },
  {
    id: 'funeral',
    name: 'Msza pogrzebowa',
    price: 500,
    description: 'Msza święta pogrzebowa'
  },
  {
    id: 'gregorian',
    name: 'Msza gregoriańska',
    price: 1200,
    description: '30 Mszy odprawianych przez 30 kolejnych dni'
  }
];
