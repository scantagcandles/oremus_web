import React, { useState, useEffect } from 'react';
import { Heart, Send, Users, Loader } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function PrayerRequests() {
  const [request, setRequest] = useState('');
  const [category, setCategory] = useState('general');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [recentRequests, setRecentRequests] = useState([]);

  useEffect(() => {
    fetchRecentRequests();
  }, []);

  const fetchRecentRequests = async () => {
    try {
      const { data } = await supabase
        .from('prayer_requests')
        .select('id, category, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      
      setRecentRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!request.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('prayer_requests')
        .insert([{ 
          content: request,
          category: category,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;
      
      setRequest('');
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      fetchRecentRequests();
    } catch (error) {
      console.error('Error submitting prayer request:', error);
      alert('Nie udało się wysłać intencji. Spróbuj ponownie.');
    } finally {
      setSubmitting(false);
    }
  };

  const categories = [
    { value: 'general', label: 'Ogólna', icon: '�' },
    { value: 'health', label: 'O zdrowie', icon: '�' },
    { value: 'family', label: 'Za rodzinę', icon: '�‍�‍�‍�' },
    { value: 'peace', label: 'O pokój', icon: '�️' },
    { value: 'thanksgiving', label: 'Dziękczynienie', icon: '�' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-6">
        <Heart className="h-6 w-6 text-red-500 mr-2" />
        <h2 className="text-2xl font-bold text-gray-800">Intencje Modlitewne</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kategoria intencji
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`p-2 rounded-lg border transition-all ${
                  category === cat.value
                    ? 'border-purple-600 bg-purple-50 text-purple-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <span className="mr-1">{cat.icon}</span>
                <span className="text-sm">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Twoja intencja
          </label>
          <textarea
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            placeholder="Napisz swoją intencję modlitewną..."
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            rows="4"
          />
        </div>
        
        <button
          type="submit"
          disabled={submitting || !request.trim()}
          className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {submitting ? (
            <>
              <Loader className="h-5 w-5 mr-2 animate-spin" />
              <span>Wysyłanie...</span>
            </>
          ) : (
            <>
              <Send className="h-5 w-5 mr-2" />
              <span>Wyślij intencję</span>
            </>
          )}
        </button>
      </form>

      {submitted && (
        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg flex items-center">
          <Heart className="h-5 w-5 mr-2 fill-current" />
          Twoja intencja została przyjęta. Będziemy się modlić!
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            <span>Modlimy się wspólnie</span>
          </div>
          <span>{recentRequests.length} intencji dzisiaj</span>
        </div>
      </div>
    </div>
  );
}
