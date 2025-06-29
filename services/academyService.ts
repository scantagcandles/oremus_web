import { api } from "../lib/api";

export interface Course {
  id: string;
  title: string;
  category: string;
  description?: string;
  progress?: number;
  lessons: Lesson[];
  duration: number; // in minutes
  level: "beginner" | "intermediate" | "advanced";
  instructor: string;
  prerequisites?: string[];
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  duration: number; // in minutes
  order: number;
  type: "video" | "text" | "quiz";
  content: string;
  completed?: boolean;
}

export interface Certificate {
  id: string;
  title: string;
  courseId: string;
  issueDate: string;
  recipientName: string;
  instructorName: string;
  grade?: string;
  validUntil?: string;
}

export interface QuizAttempt {
  id: string;
  lessonId: string;
  startedAt: string;
  completedAt?: string;
  score: number;
  passed: boolean;
  answers: {
    questionId: string;
    selectedAnswer: string;
    correct: boolean;
  }[];
}

export class AcademyService {
  private API_BASE = "/api/academy";

  async getCourses(): Promise<Course[]> {
    try {
      const response = await api.get(`${this.API_BASE}/courses`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      // Return mock data for development
      return [
        {
          id: "1",
          title: "Podstawy teologii",
          category: "Teologia Fundamentalna",
          description:
            "Wprowadzenie do podstawowych koncepcji teologicznych i ich znaczenia w życiu chrześcijańskim.",
          lessons: [],
          duration: 180,
          level: "beginner",
          instructor: "ks. dr Jan Kowalski",
        },
        {
          id: "2",
          title: "Wprowadzenie do duchowości",
          category: "Duchowość",
          description:
            "Odkryj głębię duchowości chrześcijańskiej i jej praktyczne zastosowanie w codziennym życiu.",
          lessons: [],
          duration: 240,
          level: "beginner",
          instructor: "ks. dr Adam Nowak",
        },
        {
          id: "3",
          title: "Historia Kościoła w pigułce",
          category: "Historia Kościoła",
          description:
            "Przegląd kluczowych momentów w historii Kościoła i ich wpływu na współczesne chrześcijaństwo.",
          lessons: [],
          duration: 300,
          level: "intermediate",
          instructor: "prof. Maria Wiśniewska",
        },
      ];
    }
  }

  async getCourse(courseId: string): Promise<Course> {
    try {
      const response = await api.get(`${this.API_BASE}/courses/${courseId}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch course:", error);
      throw new Error("Failed to fetch course details");
    }
  }

  async getCourseLessons(courseId: string): Promise<Lesson[]> {
    try {
      const response = await api.get(
        `${this.API_BASE}/courses/${courseId}/lessons`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch course lessons:", error);
      throw new Error("Failed to fetch course lessons");
    }
  }

  async getCertificates(): Promise<Certificate[]> {
    try {
      const response = await api.get(`${this.API_BASE}/certificates`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch certificates:", error);
      // Return mock data for development
      return [
        {
          id: "c1",
          title: "Certyfikat: Podstawy teologii",
          courseId: "1",
          issueDate: "2025-06-15",
          recipientName: "Jan Kowalski",
          instructorName: "ks. dr Adam Nowak",
          grade: "A",
        },
      ];
    }
  }

  async getEnrolledCourses(): Promise<string[]> {
    try {
      const response = await api.get(`${this.API_BASE}/enrolled-courses`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch enrolled courses:", error);
      // Return mock data for development
      return ["1"];
    }
  }

  async enrollInCourse(courseId: string): Promise<void> {
    try {
      await api.post(`${this.API_BASE}/courses/${courseId}/enroll`);
    } catch (error) {
      console.error("Failed to enroll in course:", error);
      throw new Error("Failed to enroll in course. Please try again later.");
    }
  }

  async unenrollFromCourse(courseId: string): Promise<void> {
    try {
      await api.post(`${this.API_BASE}/courses/${courseId}/unenroll`);
    } catch (error) {
      console.error("Failed to unenroll from course:", error);
      throw new Error(
        "Failed to unenroll from course. Please try again later."
      );
    }
  }

  async getCourseProgress(courseId: string): Promise<number> {
    try {
      const response = await api.get(
        `${this.API_BASE}/courses/${courseId}/progress`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch course progress:", error);
      return 0;
    }
  }

  async markLessonComplete(lessonId: string): Promise<void> {
    try {
      await api.post(`${this.API_BASE}/lessons/${lessonId}/complete`);
    } catch (error) {
      console.error("Failed to mark lesson as complete:", error);
      throw new Error("Failed to mark lesson as complete");
    }
  }

  async updateLessonProgress(
    lessonId: string,
    progress: number
  ): Promise<void> {
    try {
      await api.put(`${this.API_BASE}/lessons/${lessonId}/progress`, {
        progress,
      });
    } catch (error) {
      console.error("Failed to update lesson progress:", error);
      throw new Error("Failed to update lesson progress");
    }
  }

  async submitQuiz(
    lessonId: string,
    answers: Record<string, string>
  ): Promise<QuizAttempt> {
    try {
      const response = await api.post(
        `${this.API_BASE}/lessons/${lessonId}/quiz`,
        { answers }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      throw new Error("Failed to submit quiz");
    }
  }

  async downloadCertificate(certificateId: string): Promise<Blob> {
    try {
      const response = await api.get(
        `${this.API_BASE}/certificates/${certificateId}/download`,
        { responseType: "blob" }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to download certificate:", error);
      throw new Error("Failed to download certificate");
    }
  }

  async getRecommendedCourses(): Promise<Course[]> {
    try {
      const response = await api.get(`${this.API_BASE}/courses/recommended`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch recommended courses:", error);
      return [];
    }
  }
}
