import { supabase } from '@/configs/supabase';
import { NextResponse } from 'next/server';
import type { Course } from '@/services/academyService';

export async function GET() {
  try {
    const { data: courses, error } = await supabase
      .from('courses')
      .select(`
        *,
        lessons:lessons(*)
      `)
      .order('title');

    if (error) throw error;

    return NextResponse.json(courses);
  } catch (error) {
    console.error('Failed to fetch courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const courseData = await request.json();

    const { data: course, error } = await supabase
      .from('courses')
      .insert([courseData])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(course);
  } catch (error) {
    console.error('Failed to create course:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}
