import { Metadata } from 'next';
import MassIntentionDashboard from '@/components/admin/intentions/MassIntentionDashboard';

export const metadata: Metadata = {
  title: 'Zarządzanie intencjami | Oremus Admin',
  description: 'Panel administracyjny do zarządzania intencjami mszalnymi - Oremus',
};

export default function AdminIntentionsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Zarządzanie intencjami</h1>
      </div>
      
      <MassIntentionDashboard />
    </div>
  );
}
