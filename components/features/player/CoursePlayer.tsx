'use client'

import { useState, useEffect } from 'react'
import CorePlayer from './CorePlayer'

interface Course {
  id: string
  title: string
  description: string
  level: 'beginner' | 'intermediate' | 'advanced'
  price: number
  videos: Video[]
  isPurchased: boolean
}

interface Video {
  id: string
  title: string
  url: string
  duration: number
  thumbnail?: string
  previewDuration: number // in seconds
}

interface CoursePlayerProps {
  course: Course
  userType: 'free' | 'premium'
  onPurchase: (courseId: string) => Promise<void>
}

export default function CoursePlayer({
  course,
  userType,
  onPurchase
}: CoursePlayerProps) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [showPurchasePrompt, setShowPurchasePrompt] = useState(false)

  useEffect(() => {
    if (course.videos.length > 0) {
      setSelectedVideo(course.videos[0])
    }
  }, [course])

  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video)
  }

  const handlePurchase = async () => {
    try {
      await onPurchase(course.id)
      setShowPurchasePrompt(false)
    } catch (error) {
      console.error('Error purchasing course:', error)
    }
  }

  const getLevelBadge = (level: Course['level']) => {
    const badges = {
      beginner: { text: 'Podstawowy', color: 'bg-green-100 text-green-800' },
      intermediate: { text: 'Średniozaawansowany', color: 'bg-yellow-100 text-yellow-800' },
      advanced: { text: 'Zaawansowany', color: 'bg-red-100 text-red-800' }
    }

    const badge = badges[level]
    return (
      <span className={`px-2 py-1 rounded-full text-sm ${badge.color}`}>
        {badge.text}
      </span>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Player Section */}
        <div className="lg:col-span-2">
          {selectedVideo && (
            <CorePlayer
              tracks={[{
                id: selectedVideo.id,
                title: selectedVideo.title,
                url: selectedVideo.url,
                duration: selectedVideo.duration,
                type: 'video',
                thumbnail: selectedVideo.thumbnail,
                courseId: course.id,
                previewDuration: course.isPurchased ? undefined : selectedVideo.previewDuration
              }]}
              userType={userType}
            />
          )}

          {/* Course Info */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">{course.title}</h1>
              {getLevelBadge(course.level)}
            </div>
            <p className="text-gray-600">{course.description}</p>
          </div>
        </div>

        {/* Video List */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-4">Lista lekcji</h2>
          <div className="space-y-2">
            {course.videos.map((video, index) => (
              <button
                key={video.id}
                onClick={() => handleVideoSelect(video)}
                className={`w-full text-left p-3 rounded ${
                  selectedVideo?.id === video.id
                    ? 'bg-primary text-white'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <span className="mr-2">{index + 1}.</span>
                    {video.title}
                  </span>
                  <span className="text-sm">
                    {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
                  </span>
                </div>
                {!course.isPurchased && (
                  <div className="mt-1 text-sm">
                    <span className="text-green-500">
                      {Math.floor(video.previewDuration / 60)}:{String(video.previewDuration % 60).padStart(2, '0')} preview
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>

          {!course.isPurchased && (
            <div className="mt-6 p-4 bg-gray-50 rounded">
              <p className="text-center mb-4">
                Odblokuj pełny dostęp do kursu
              </p>
              <button
                onClick={handlePurchase}
                className="w-full bg-primary text-white py-2 px-4 rounded hover:bg-primary/90"
              >
                Kup kurs za {course.price} zł
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
