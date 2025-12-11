'use client'

import { useEffect, useState } from 'react'
import { Bell, Pin, MessageSquare, Tag } from 'lucide-react'
import api from '@/lib/api'

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      const response = await api.get('/announcements')
      setAnnouncements(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching announcements:', error)
      setLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'NORMAL':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading announcements...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Announcements</h1>
          <p className="text-gray-600">Staff notices, updates, and important information</p>
        </div>

        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className={`bg-white rounded-lg shadow p-6 ${
                announcement.isPinned ? 'border-l-4 border-yellow-500' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {announcement.isPinned && (
                      <Pin className="w-4 h-4 text-yellow-500 fill-current" />
                    )}
                    <h2 className="text-xl font-semibold text-gray-900">
                      {announcement.title}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(announcement.priority)}`}>
                      {announcement.priority}
                    </span>
                    {announcement.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="prose max-w-none mb-4">
                <p className="text-gray-700 whitespace-pre-wrap">{announcement.content}</p>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>
                  By {announcement.author.firstName} {announcement.author.lastName} •{' '}
                  {new Date(announcement.createdAt).toLocaleDateString()}
                </span>
                {announcement.comments.length > 0 && (
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>{announcement.comments.length} comments</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {announcements.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No announcements at this time</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

