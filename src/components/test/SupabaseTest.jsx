import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function SupabaseTest() {
  const [masses, setMasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      const { data: massesData, error: massesError } = await supabase
        .from('masses')
        .select('*')
        .limit(5);

      if (massesError) throw massesError;

      setMasses(massesData || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Sprawdzam połączenie z Supabase...</div>;

  if (error) return (
    <div className="p-4 text-red-700 bg-red-100 rounded">
      <h3 className="font-bold">❌ Błąd połączenia:</h3>
      <p>{error}</p>
      <p className="mt-2 text-sm">Sprawdź czy dodałeś ANON KEY do .env.local</p>
    </div>
  );

  return (
    <div className="p-4 text-green-700 bg-green-100 rounded">
      <h3 className="mb-2 font-bold">✅ Połączenie z Supabase działa!</h3>
      <p>Znaleziono {masses.length} mszy w bazie danych.</p>
      {masses.length > 0 && (
        <div className="mt-2">
          <p className="font-semibold">Przykładowa msza:</p>
          <p className="text-sm">{masses[0].title} - {masses[0].time}</p>
        </div>
      )}
    </div>
  );
}
