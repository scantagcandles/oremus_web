"use client";

import { useState, useEffect } from "react";
import {
  AcademyService,
  type Course,
  type Certificate,
} from "../services/academyService";

interface UseAcademyOptions {
  courseId?: string;
}

export function useAcademy(options: UseAcademyOptions = {}) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Set<string>>(
    new Set()
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const academyService = new AcademyService();

  useEffect(() => {
    if (options.courseId) {
      loadCourse(options.courseId);
    } else {
      loadInitialData();
    }
  }, [options.courseId]);

  async function loadCourse(courseId: string) {
    setLoading(true);
    setError(null);

    try {
      const course = await academyService.getCourse(courseId);
      setCourse(course);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load course");
    } finally {
      setLoading(false);
    }
  }

  async function loadInitialData() {
    setLoading(true);
    setError(null);

    try {
      const [coursesData, certificatesData, enrolledCoursesData] =
        await Promise.all([
          academyService.getCourses(),
          academyService.getCertificates(),
          academyService.getEnrolledCourses(),
        ]);

      setCourses(coursesData);
      setCertificates(certificatesData);
      setEnrolledCourses(new Set(enrolledCoursesData));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function enrollCourse(courseId: string) {
    if (enrolledCourses.has(courseId)) return;

    setLoading(true);
    setError(null);

    try {
      await academyService.enrollInCourse(courseId);
      setEnrolledCourses((prev) => new Set([...prev, courseId]));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to enroll in course"
      );
    } finally {
      setLoading(false);
    }
  }

  async function unenrollFromCourse(courseId: string) {
    if (!enrolledCourses.has(courseId)) return;

    setLoading(true);
    setError(null);

    try {
      await academyService.unenrollFromCourse(courseId);
      setEnrolledCourses((prev) => {
        const newSet = new Set(prev);
        newSet.delete(courseId);
        return newSet;
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to unenroll from course"
      );
    } finally {
      setLoading(false);
    }
  }

  async function markLessonComplete(lessonId: string) {
    setLoading(true);
    setError(null);

    try {
      await academyService.markLessonComplete(lessonId);
      if (course) {
        setCourse({
          ...course,
          lessons: course.lessons.map((lesson) =>
            lesson.id === lessonId ? { ...lesson, completed: true } : lesson
          ),
        });
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to mark lesson as complete"
      );
    } finally {
      setLoading(false);
    }
  }

  async function submitQuiz(lessonId: string, answers: Record<string, string>) {
    setLoading(true);
    setError(null);

    try {
      const result = await academyService.submitQuiz(lessonId, answers);
      if (result.passed && course) {
        setCourse({
          ...course,
          lessons: course.lessons.map((lesson) =>
            lesson.id === lessonId ? { ...lesson, completed: true } : lesson
          ),
        });
      }
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit quiz");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function updateLessonProgress(lessonId: string, progress: number) {
    try {
      await academyService.updateLessonProgress(lessonId, progress);
      if (course) {
        setCourse({
          ...course,
          lessons: course.lessons.map((lesson) =>
            lesson.id === lessonId ? { ...lesson, progress } : lesson
          ),
        });
      }
    } catch (err) {
      console.error("Failed to update lesson progress:", err);
    }
  }

  async function downloadCertificate(certificateId: string) {
    try {
      const blob = await academyService.downloadCertificate(certificateId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `certificate-${certificateId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to download certificate"
      );
    }
  }

  const refresh = () => {
    if (options.courseId) {
      loadCourse(options.courseId);
    } else {
      loadInitialData();
    }
  };

  const filteredCourses = selectedCategory
    ? courses.filter((c) => c.category === selectedCategory)
    : courses;

  return {
    courses: filteredCourses,
    course,
    certificates,
    enrolledCourses,
    selectedCategory,
    loading,
    error,
    setSelectedCategory,
    enrollCourse,
    unenrollFromCourse,
    markLessonComplete,
    submitQuiz,
    updateLessonProgress,
    downloadCertificate,
    refresh,
  };
}
