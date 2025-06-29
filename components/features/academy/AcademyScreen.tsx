"use client";

import React from "react";
import { Card } from "@/components/glass/Card";
import { Button } from "../../../components/design-system";
import {
  GraduationCap,
  Book,
  History,
  Heart,
  FileCheck,
  ChevronRight,
  Loader,
} from "lucide-react";
import { motion } from "framer-motion";
import { twMerge } from "tailwind-merge";
import { useAcademy } from "../../../hooks/useAcademy";
import type { Course, Certificate } from "../../../services/academyService";

// Course category icons mapping
const categoryIcons = {
  "Teologia Fundamentalna": <Book className="w-5 h-5" />,
  Duchowość: <Heart className="w-5 h-5" />,
  "Historia Kościoła": <History className="w-5 h-5" />,
  Bioetyka: <FileCheck className="w-5 h-5" />,
  Liturgia: <GraduationCap className="w-5 h-5" />,
  Katecheza: <Book className="w-5 h-5" />,
} as const;

// Use the actual course category type from the icons object
type CourseCategory = keyof typeof categoryIcons;

export const AcademyScreen: React.FC = () => {
  const {
    courses,
    certificates,
    enrolledCourses,
    selectedCategory,
    loading,
    error,
    setSelectedCategory,
    enrollCourse,
    unenrollFromCourse,
    downloadCertificate,
    refresh,
  } = useAcademy();

  const filteredCourses = selectedCategory
    ? courses.filter((c) => c.category === selectedCategory)
    : courses;

  const handleEnroll = async (courseId: string) => {
    await enrollCourse(courseId);
  };

  const handleUnenroll = async (courseId: string) => {
    await unenrollFromCourse(courseId);
  };

  if (error) {
    return (
      <Card variant="glass" className="p-8 text-center">
        <h2 className="mb-4 text-xl font-bold text-red-500">Wystąpił błąd</h2>
        <p className="text-white/70">{error}</p>
        <Button variant="primary" className="mt-4" onClick={refresh}>
          Spróbuj ponownie
        </Button>
      </Card>
    );
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="grid gap-8">
        {/* Header */}
        <div className="text-center">
          <motion.h1
            className="mb-4 text-4xl font-bold text-white"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Akademia Formacyjna
          </motion.h1>
          <motion.p
            className="max-w-2xl mx-auto text-lg text-white/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Rozwijaj swoją wiedzę i duchowość poprzez profesjonalne kursy online
          </motion.p>
        </div>

        {/* Categories */}
        <Card
          variant="glass"
          className="overflow-x-auto"
          title="Kategorie kursów"
        >
          <div className="flex pb-2 space-x-4">
            {(Object.keys(categoryIcons) as CourseCategory[]).map(
              (category, index) => (
                <motion.button
                  key={category}
                  onClick={() =>
                    setSelectedCategory(
                      selectedCategory === category ? null : category
                    )
                  }
                  className={twMerge(
                    "px-4 py-2 rounded-lg",
                    "flex items-center gap-2",
                    "transition-colors duration-200",
                    "border border-white/20",
                    selectedCategory === category
                      ? "bg-primary-500 text-white"
                      : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
                  )}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {categoryIcons[category]}
                  <span>{category}</span>
                </motion.button>
              )
            )}
          </div>
        </Card>

        {/* Course Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Available Courses */}
          <Card variant="glass" title="Dostępne kursy">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="w-8 h-8 animate-spin text-white/50" />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredCourses.map((course, index) => (
                  <motion.div
                    key={course.id}
                    className="p-4 space-y-4 rounded-lg bg-white/5"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-white">
                          {course.title}
                        </h3>
                        <p className="mt-1 text-sm text-white/70">
                          {course.description}
                        </p>
                      </div>
                      {categoryIcons[course.category as CourseCategory]}
                    </div>
                    {enrolledCourses.has(course.id) ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleUnenroll(course.id)}
                      >
                        Wypisz się
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full"
                        onClick={() => handleEnroll(course.id)}
                      >
                        Zapisz się
                      </Button>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </Card>

          <div className="space-y-6">
            {/* Enrolled Courses */}
            <Card
              variant="glass"
              title="Twoje kursy"
              description="Kursy, na które jesteś zapisany"
            >
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="w-6 h-6 animate-spin text-white/50" />
                </div>
              ) : enrolledCourses.size === 0 ? (
                <p className="py-8 text-center text-white/50">
                  Nie jesteś jeszcze zapisany na żaden kurs
                </p>
              ) : (
                <div className="space-y-4">
                  {courses
                    .filter((course) => enrolledCourses.has(course.id))
                    .map((course) => (
                      <motion.div
                        key={course.id}
                        className="p-4 rounded-lg bg-white/5"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-white">
                            {course.title}
                          </h3>
                          {categoryIcons[course.category as CourseCategory]}
                        </div>
                        <div className="w-full h-2 mt-2 rounded-full bg-white/10">
                          <motion.div
                            className="h-full rounded-full bg-primary-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${course.progress || 0}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                          />
                        </div>
                        <p className="mt-1 text-sm text-white/50">
                          Ukończono: {course.progress || 0}%
                        </p>
                      </motion.div>
                    ))}
                </div>
              )}
            </Card>

            {/* Certificates */}
            <Card
              variant="glass"
              title="Twoje certyfikaty"
              description="Zdobyte certyfikaty ukończenia kursów"
            >
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="w-6 h-6 animate-spin text-white/50" />
                </div>
              ) : certificates.length === 0 ? (
                <p className="py-8 text-center text-white/50">
                  Nie masz jeszcze żadnych certyfikatów
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {certificates.map((cert, index) => (
                    <motion.div
                      key={cert.id}
                      className="p-4 rounded-lg bg-white/5"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <h3 className="font-medium text-white">{cert.title}</h3>
                      <p className="mt-1 text-sm text-white/70">
                        Wydano: {new Date(cert.issueDate).toLocaleDateString()}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-4"
                        onClick={() => downloadCertificate(cert.id)}
                      >
                        Pobierz certyfikat
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademyScreen;
