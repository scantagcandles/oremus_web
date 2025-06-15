'use client';

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { Calendar, Button, Input, Select } from '@/components/glass';
import { useAuth } from '@/hooks/useAuth';
import { usePayment } from '@/hooks/usePayment';
import '@/types/forms';

const MASS_PRICES = {
  regular: 50,
  requiem: 100,
  thanksgiving: 75,
};

type MassType = keyof typeof MASS_PRICES;

export const MassOrderForm = () => {
  const { user } = useAuth();
  const { mutate } = useSupabaseQuery('masses');
  const { processPayment, loading: paymentLoading } = usePayment();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [massType, setMassType] = useState<MassType | ''>('');
  const [intention, setIntention] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedDate || !massType || !intention || !user?.id) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const price = MASS_PRICES[massType];
      
      // Create the mass intention
      const { data: intentionData, error: intentionError } = await mutate({
        type: massType,
        intention,
        scheduled_date: selectedDate.toISOString(),
        status: 'pending',
        user_id: user.id,
        priest_notes: null,
        created_at: new Date().toISOString()
      });

      if (intentionError || !intentionData) {
        throw intentionError || new Error('Failed to create mass intention');
      }

      // Process payment
      const { error: paymentError } = await processPayment(price * 100, {
        intentionId: intentionData.id,
        massType,
        date: selectedDate.toISOString()
      });

      if (paymentError) {
        throw paymentError;
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error processing mass intention:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium">Select Date</label>
        <Calendar
          selected={selectedDate}
          onSelect={setSelectedDate}
          minDate={new Date()}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Mass Type</label>
        <Select
          value={massType}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => {
            setMassType(e.target.value as MassType);
          }}
          required
          className="w-full"
        >
          <option value="">Select a type</option>
          <option value="regular">Regular Mass</option>
          <option value="requiem">Requiem Mass</option>
          <option value="thanksgiving">Thanksgiving Mass</option>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Intention</label>
        <Input
          type="text"
          value={intention}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setIntention(e.target.value);
          }}
          required
          placeholder="Enter your mass intention"
          className="w-full"
        />
      </div>

      {massType && (
        <div className="text-sm text-gray-600">
          Price: ${MASS_PRICES[massType]}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading || paymentLoading || !selectedDate || !massType || !intention}
        className="w-full"
      >
        {loading || paymentLoading ? 'Processing...' : 'Continue to Payment'}
      </Button>
    </form>
  );
};
