import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function MassCalendar() {
  const [masses, setMasses] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMasses();
  }, [selectedDate]);

  const fetchMasses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('masses')
        .select('*')
        .gte('date', selectedDate.toISOString().split('T')[0])
        .lte('date', new Date(selectedDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;
      setMasses(data || []);
    } catch (error) {
      console.error('Error fetching masses:', error);
      // Dane przykładowe gdy brak połączenia
      setMasses([
        { id: 1, date: '2025-06-22', time: '07:00', title: 'Msza św. poranna', priest: 'ks. Jan Kowalski', location: 'Kaplica główna' },
        { id: 2, date: '2025-06-22', time: '10:00', title: 'Suma', priest: 'ks. Piotr Nowak', location: 'Kościół' },
        { id: 3, date: '2025-06-22', time: '18:00', title: 'Msza św. wieczorna', priest: 'ks. Jan Kowalski', location: 'Kościół' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Calendar className="h-6 w-6 text-purple-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-800">Kalendarz Mszy Świętych</h2>
        </div>
        <button 
          onClick={() => setSelectedDate(new Date())}
          className="text-sm text-purple-600 hover:text-purple-700"
        >
          Dziś
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {masses.map((mass) => (
            <div key={mass.id} className="border-l-4 border-purple-600 pl-4 py-3 hover:bg-gray-50 transition-colors">
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <Clock className="h-4 w-4 mr-1" />
                <span>{new Date(mass.date).toLocaleDateString('pl-PL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                <span className="mx-2">•</span>
                <span className="font-semibold">{mass.time}</span>
              </div>
              <h3 className="font-semibold text-gray-800">{mass.title}</h3>
              {mass.priest && (
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <Users className="h-4 w-4 mr-1" />
                  <span>Celebrans: {mass.priest}</span>
                </div>
              )}
              {mass.location && (
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{mass.location}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
