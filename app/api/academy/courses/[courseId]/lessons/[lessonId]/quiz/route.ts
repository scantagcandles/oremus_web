import { supabase } from '@/configs/supabase';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';

// Submit quiz answers
export async function POST(
  request: Request,
  { params }: { params: { courseId: string, lessonId: string } }
) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { answers } = await request.json();

    // Get quiz questions and correct answers
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('content')
      .eq('id', params.lessonId)
      .eq('type', 'quiz')
      .single();

    if (lessonError || !lesson) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    const quiz = JSON.parse(lesson.content);
    const questions = quiz.questions;

    // Calculate score
    const results = Object.entries(answers).map(([questionId, answer]) => {
      const question = questions.find((q: any) => q.id === questionId);
      const correct = question?.correctAnswer === answer;
      return { questionId, selectedAnswer: answer, correct };
    });

    const score = Math.round(
      (results.filter(r => r.correct).length / questions.length) * 100
    );

    // Save quiz attempt
    const { data: attempt, error: attemptError } = await supabase
      .from('quiz_attempts')
      .insert({
        user_id: user.id,
        lesson_id: params.lessonId,
        completed_at: new Date().toISOString(),
        score,
        answers: JSON.stringify(results)
      })
      .select()
      .single();

    if (attemptError) throw attemptError;

    // If passed the quiz, mark lesson as complete
    if (score >= quiz.passingScore) {
      await supabase
        .from('student_lessons')
        .upsert({
          user_id: user.id,
          lesson_id: params.lessonId,
          status: 'completed',
          progress: 100,
          completed_at: new Date().toISOString(),
          last_accessed_at: new Date().toISOString()
        });

      // Update course progress
      const { data: courseLessons, error: countError } = await supabase
        .from('lessons')
        .select('id')
        .eq('course_id', params.courseId);

      if (countError) throw countError;

      const { data: completedLessons, error: completedError } = await supabase
        .from('student_lessons')
        .select('lesson_id')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .in('lesson_id', courseLessons.map(l => l.id));

      if (completedError) throw completedError;

      const progress = Math.round(
        (completedLessons.length / courseLessons.length) * 100
      );

      const { error: courseUpdateError } = await supabase
        .from('student_courses')
        .update({
          progress,
          last_accessed_at: new Date().toISOString(),
          ...(progress === 100 ? {
            status: 'completed',
            completed_at: new Date().toISOString()
          } : {})
        })
        .eq('course_id', params.courseId)
        .eq('user_id', user.id);

      if (courseUpdateError) throw courseUpdateError;
    }

    return NextResponse.json({
      attempt: {
        id: attempt.id,
        score,
        results,
        passed: score >= quiz.passingScore
      }
    });
  } catch (error) {
    console.error('Failed to submit quiz:', error);
    return NextResponse.json(
      { error: 'Failed to submit quiz' },
      { status: 500 }
    );
  }
}
