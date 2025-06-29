import { supabase } from '@/configs/supabase';

interface CalendarEventInput {
  title: string;
  description: string;
  startTime: string;
  endTime?: string;
  parishId: string;
  metadata?: Record<string, any>;
}

export async function createCalendarEvent(input: CalendarEventInput) {
  const {
    title,
    description,
    startTime,
    endTime = new Date(new Date(startTime).getTime() + 60 * 60 * 1000).toISOString(), // Default to 1 hour duration
    parishId,
    metadata
  } = input;

  try {
    const { data, error } = await supabase
      .from('calendar_events')
      .insert({
        title,
        description,
        start_time: startTime,
        end_time: endTime,
        parish_id: parishId,
        metadata,
        status: 'scheduled'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to create calendar event:', error);
    throw error;
  }
}
