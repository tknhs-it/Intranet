'use client'

import { useEffect, useState } from 'react'
import { Calendar, Clock, AlertCircle, CheckCircle, FileText, Users } from 'lucide-react'
import api from '@/lib/api'

interface DashboardData {
  tasks: any[]
  announcements: any[]
  helpdeskTickets: any[]
  compassData: {
    classes: any[]
    roomChanges: any[]
    yardDuty: any[]
    meetings: any[]
    studentAbsences: any[]
  }
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Get userId from auth context
    const userId = 'temp-user-id'
    
    api.get(`/dashboard?userId=${userId}`)
      .then((response) => {
        setData(response.data)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching dashboard:', error)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Staff Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Schedule */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Today's Schedule</h2>
              </div>
              {data?.compassData.classes.length ? (
                <div className="space-y-3">
                  {data.compassData.classes.map((cls, idx) => (
                    <div key={idx} className="flex items-center p-3 bg-gray-50 rounded">
                      <Clock className="w-4 h-4 text-gray-500 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">{cls.name}</p>
                        <p className="text-sm text-gray-600">{cls.time} • {cls.room}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No classes scheduled for today</p>
              )}
            </div>

            {/* Tasks */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Tasks</h2>
              </div>
              {data?.tasks.length ? (
                <div className="space-y-3">
                  {data.tasks.map((task) => (
                    <div key={task.id} className="flex items-center p-3 bg-gray-50 rounded">
                      <input type="checkbox" className="mr-3" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{task.title}</p>
                        {task.dueDate && (
                          <p className="text-sm text-gray-600">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No pending tasks</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Announcements */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Announcements</h2>
              </div>
              {data?.announcements.length ? (
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
                <p className="text-gray-500 text-sm">No new announcements</p>
              )}
            </div>

            {/* Helpdesk Tickets */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <FileText className="w-5 h-5 text-orange-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">My Tickets</h2>
              </div>
              {data?.helpdeskTickets.length ? (
                <div className="space-y-3">
                  {data.helpdeskTickets.map((ticket) => (
                    <div key={ticket.id} className="p-3 bg-gray-50 rounded">
                      <p className="font-medium text-gray-900 text-sm">{ticket.title}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        Status: <span className="capitalize">{ticket.status}</span>
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No open tickets</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

