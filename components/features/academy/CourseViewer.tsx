import React, { useState, useEffect } from 'react';
import { Card } from '@/components/glass/Card';
import { Button } from '@/components/design-system';
import { Loader, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAcademy } from '@/hooks/useAcademy';
import type { Course, Lesson } from '@/services/academyService';

interface CourseViewerProps {
  courseId: string;
  onClose?: () => void;
}

export const CourseViewer: React.FC<CourseViewerProps> = ({ courseId, onClose }) => {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizResults, setQuizResults] = useState<any>(null);
  
  const {
    course,
    loading,
    error,
    markLessonComplete,
    submitQuiz,
    updateLessonProgress
  } = useAcademy(courseId);

  const currentLesson = course?.lessons[currentLessonIndex];
  const isLastLesson = currentLessonIndex === (course?.lessons.length ?? 0) - 1;
  const isFirstLesson = currentLessonIndex === 0;

  const handleNext = async () => {
    if (!currentLesson || !course) return;

    if (currentLesson.type === 'quiz' && !currentLesson.completed) {
      const results = await submitQuiz(currentLesson.id, quizAnswers);
      setQuizResults(results);
      setShowQuizResults(true);
      if (results.passed) {
        await markLessonComplete(currentLesson.id);
      }
    } else if (!currentLesson.completed) {
      await markLessonComplete(currentLesson.id);
    }

    if (!isLastLesson) {
      setCurrentLessonIndex(prev => prev + 1);
      setQuizAnswers({});
      setShowQuizResults(false);
    }
  };

  const handlePrevious = () => {
    if (!isFirstLesson) {
      setCurrentLessonIndex(prev => prev - 1);
      setQuizAnswers({});
      setShowQuizResults(false);
    }
  };

  const handleQuizAnswer = (questionId: string, answer: string) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  if (loading) {
    return (
      <Card variant="glass" className="p-8">
        <div className="flex items-center justify-center">
          <Loader className="w-8 h-8 animate-spin text-white/50" />
        </div>
      </Card>
    );
  }

  if (error || !course || !currentLesson) {
    return (
      <Card variant="glass" className="p-8">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-500 mb-4">
            Wystąpił błąd
          </h2>
          <p className="text-white/70">{error || 'Nie można załadować kursu'}</p>
          {onClose && (
            <Button
              variant="primary"
              className="mt-4"
              onClick={onClose}
            >
              Wróć
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      className="grid gap-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Course header */}
      <Card variant="glass" className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{course.title}</h1>
            <p className="text-white/70 mt-1">
              Lekcja {currentLessonIndex + 1} z {course.lessons.length}
            </p>
          </div>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Zamknij
            </Button>
          )}
        </div>
        <div className="w-full bg-white/10 rounded-full h-2 mt-4">
          <motion.div
            className="bg-primary-500 h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${course.progress || 0}%` }}
            transition={{ duration: 1 }}
          />
        </div>
      </Card>

      {/* Lesson content */}
      <Card variant="glass" className="p-6">
        <h2 className="text-xl font-bold text-white mb-4">
          {currentLesson.title}
        </h2>
        
        {currentLesson.type === 'video' && (
          <div className="aspect-video bg-black/30 rounded-lg overflow-hidden">            <iframe
              title={`${course.title} - ${currentLesson.title}`}
              src={currentLesson.content}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {currentLesson.type === 'text' && (
          <div className="prose prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
          </div>
        )}

        {currentLesson.type === 'quiz' && !showQuizResults && (
          <div className="space-y-6">
            {JSON.parse(currentLesson.content).questions.map((question: any) => (
              <div key={question.id} className="space-y-4">
                <h3 className="text-lg font-medium text-white">
                  {question.text}
                </h3>
                <div className="grid gap-3">
                  {question.options.map((option: string, index: number) => (
                    <button
                      key={index}
                      className={`p-4 rounded-lg text-left transition-colors duration-200 ${
                        quizAnswers[question.id] === option
                          ? 'bg-primary-500 text-white'
                          : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white'
                      }`}
                      onClick={() => handleQuizAnswer(question.id, option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {currentLesson.type === 'quiz' && showQuizResults && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white">
                Wynik: {quizResults.score}%
              </h3>
              <p className="text-white/70 mt-2">
                {quizResults.passed
                  ? 'Gratulacje! Zaliczyłeś quiz.'
                  : 'Spróbuj jeszcze raz, aby zaliczyć quiz.'}
              </p>
            </div>
            
            {quizResults.results.map((result: any) => (
              <div key={result.questionId} className="p-4 rounded-lg bg-white/5">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-white">
                      {JSON.parse(currentLesson.content).questions.find(
                        (q: any) => q.id === result.questionId
                      ).text}
                    </h4>
                    <p className={`mt-2 ${
                      result.correct ? 'text-green-400' : 'text-red-400'
                    }`}>
                      Twoja odpowiedź: {result.selectedAnswer}
                    </p>
                  </div>
                  <CheckCircle className={`w-6 h-6 ${
                    result.correct ? 'text-green-400' : 'text-red-400'
                  }`} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={isFirstLesson}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Poprzednia lekcja
        </Button>
        
        <Button
          variant="primary"
          onClick={handleNext}
          className="flex items-center gap-2"
        >
          {isLastLesson ? 'Zakończ kurs' : 'Następna lekcja'}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
};

export default CourseViewer;
