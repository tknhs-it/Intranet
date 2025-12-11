'use client'

import { useEffect, useState } from 'react'
import { Calendar, Clock, AlertCircle, Users, FileText, MapPin, Bell } from 'lucide-react'
import api from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'

interface MergedDashboard {
  today: string
  timetable: Array<{
    period: number
    subject: string
    className: string
    room: string
    startTime: string
    endTime: string
  }>
  extras: number
  extrasDetails: any[]
  roomChanges: any[]
  duties: any[]
  calendar: any[]
  nextFree: Date | null
  announcements: any[]
  tasks: any[]
}

export default function MergedDashboardPage() {
  const { isAuthenticated, accessToken } = useAuth()
  const [data, setData] = useState<MergedDashboard | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      fetchDashboard()
    }
  }, [isAuthenticated, accessToken])

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/dashboard/merged', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      setData(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching dashboard:', error)
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in</h2>
          <p className="text-gray-600">You need to be authenticated to view the dashboard</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">No data available</div>
      </div>
    )
  }

  const today = new Date(data.today)
  const dayName = today.toLocaleDateString('en-AU', { weekday: 'long' })
  const dateStr = today.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Nossal Staff Intranet</h1>
          <p className="text-gray-600">
            {dayName}, {dateStr}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Daily Org & Today at a Glance */}
          <div className="lg:col-span-2 space-y-6">
            {/* Daily Org PDF Placeholder */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Daily Org</h2>
              <div className="border-2 border-dashed border-gray-300 rounded p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Daily Org PDF will appear here</p>
                <p className="text-sm text-gray-400 mt-2">Auto-loaded from Teams SharePoint</p>
              </div>
            </div>

            {/* Today at a Glance */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Today at a Glance</h2>
              <div className="space-y-3">
                {data.timetable.length > 0 ? (
                  data.timetable.map((classItem, idx) => (
                    <div key={idx} className="flex items-center p-3 bg-gray-50 rounded">
                      <Clock className="w-4 h-4 text-gray-500 mr-3" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          Period {classItem.period}: {classItem.className}
                        </p>
                        <p className="text-sm text-gray-600">
                          {classItem.subject} • {classItem.room}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No classes scheduled for today</p>
                )}

                {data.extras > 0 && (
                  <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <AlertCircle className="w-4 h-4 text-yellow-600 mr-3" />
                    <div>
                      <p className="font-medium text-yellow-900">
                        EXTRA: You have {data.extras} extra class{data.extras > 1 ? 'es' : ''}
                      </p>
                      <button className="text-sm text-yellow-700 mt-1 hover:underline">
                        View details
                      </button>
                    </div>
                  </div>
                )}

                {data.roomChanges.length > 0 && (
                  <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded">
                    <MapPin className="w-4 h-4 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium text-blue-900">Room Changes</p>
                      {data.roomChanges.map((change, idx) => (
                        <p key={idx} className="text-sm text-blue-700">
                          {change.Room} → {change.NewRoom} (Period {change.Period})
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Staff Away Today */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Staff Away Today</h2>
              <div className="text-center py-8 text-gray-500">
                <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">Staff absences will appear here</p>
                <p className="text-xs text-gray-400 mt-1">From Compass integration</p>
              </div>
            </div>

            {/* Extras Summary */}
            {data.extras > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Extras</h2>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600 mb-2">{data.extras}</div>
                  <p className="text-sm text-gray-600">Extra class{data.extras > 1 ? 'es' : ''} assigned</p>
                </div>
              </div>
            )}

            {/* Room Changes Summary */}
            {data.roomChanges.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Room Changes</h2>
                <div className="space-y-2">
                  {data.roomChanges.map((change, idx) => (
                    <div key={idx} className="text-sm">
                      <span className="font-medium">Period {change.Period}:</span>{' '}
                      <span className="text-gray-600">{change.Room} → {change.NewRoom}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notices */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Notices</h2>
              {data.announcements.length > 0 ? (
                <div className="space-y-3">
                  {data.announcements.map((announcement) => (
                    <div key={announcement.id} className="p-3 bg-gray-50 rounded">
                      <p className="font-medium text-gray-900 text-sm">{announcement.title}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {announcement.author.firstName} {announcement.author.lastName}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No new notices</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Links</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <a href="https://nossal-hs.compass.education" target="_blank" rel="noopener noreferrer" className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all text-center">
              <p className="font-medium text-gray-900">Compass</p>
            </a>
            <a href="https://teams.microsoft.com" target="_blank" rel="noopener noreferrer" className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all text-center">
              <p className="font-medium text-gray-900">Teams</p>
            </a>
            <a href="/resources" className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all text-center">
              <p className="font-medium text-gray-900">Policies</p>
            </a>
            <a href="/helpdesk" className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all text-center">
              <p className="font-medium text-gray-900">IT Helpdesk</p>
            </a>
            <a href="/rooms" className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all text-center">
              <p className="font-medium text-gray-900">Room Finder</p>
            </a>
            <a href="/staff" className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all text-center">
              <p className="font-medium text-gray-900">Staff Directory</p>
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}

