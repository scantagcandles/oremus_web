import { supabase } from "@/configs/supabase";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/supabase";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string; lessonId: string }> }
) {
  try {
    const resolvedParams = await params;
    const { data: lesson, error } = await supabase
      .from("lessons")
      .select(
        `
        *,
        course:courses(*)
      `
      )
      .eq("id", resolvedParams.lessonId)
      .eq("course_id", resolvedParams.courseId)
      .single();

    if (error) throw error;
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    return NextResponse.json(lesson);
  } catch (error) {
    console.error("Failed to fetch lesson:", error);
    return NextResponse.json(
      { error: "Failed to fetch lesson" },
      { status: 500 }
    );
  }
}

// Mark lesson as complete
export async function POST(
  request: Request,
  { params }: { params: Promise<{ courseId: string; lessonId: string }> }
) {
  try {
    const resolvedParams = await params;
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Start a transaction
    const { data: lesson, error: lessonError } = await supabase
      .from("lessons")
      .select("course_id")
      .eq("id", resolvedParams.lessonId)
      .single();

    if (lessonError || !lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Mark lesson as complete
    const { error: progressError } = await supabase
      .from("student_lessons")
      .upsert({
        user_id: user.id,
        lesson_id: resolvedParams.lessonId,
        status: "completed",
        progress: 100,
        completed_at: new Date().toISOString(),
        last_accessed_at: new Date().toISOString(),
      });

    if (progressError) throw progressError;

    // Update course progress
    const { data: courseLessons, error: countError } = await supabase
      .from("lessons")
      .select("id")
      .eq("course_id", lesson.course_id);

    if (countError) throw countError;

    const { data: completedLessons, error: completedError } = await supabase
      .from("student_lessons")
      .select("lesson_id")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .in(
        "lesson_id",
        courseLessons.map((l) => l.id)
      );

    if (completedError) throw completedError;

    const progress = Math.round(
      (completedLessons.length / courseLessons.length) * 100
    );

    const { error: courseUpdateError } = await supabase
      .from("student_courses")
      .update({
        progress,
        last_accessed_at: new Date().toISOString(),
        ...(progress === 100
          ? {
              status: "completed",
              completed_at: new Date().toISOString(),
            }
          : {}),
      })
      .eq("course_id", lesson.course_id)
      .eq("user_id", user.id);

    if (courseUpdateError) throw courseUpdateError;

    return NextResponse.json({
      completed: true,
      progress,
    });
  } catch (error) {
    console.error("Failed to complete lesson:", error);
    return NextResponse.json(
      { error: "Failed to complete lesson" },
      { status: 500 }
    );
  }
}

// Update lesson progress
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ courseId: string; lessonId: string }> }
) {
  try {
    const resolvedParams = await params;
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { progress } = await request.json();

    const { error: updateError } = await supabase
      .from("student_lessons")
      .upsert({
        user_id: user.id,
        lesson_id: resolvedParams.lessonId,
        progress,
        last_accessed_at: new Date().toISOString(),
        ...(progress === 100
          ? {
              status: "completed",
              completed_at: new Date().toISOString(),
            }
          : {
              status: "started",
            }),
      });

    if (updateError) throw updateError;

    return NextResponse.json({ updated: true });
  } catch (error) {
    console.error("Failed to update lesson progress:", error);
    return NextResponse.json(
      { error: "Failed to update lesson progress" },
      { status: 500 }
    );
  }
}
