'use client'

import { useEffect, useState } from 'react'
import { Calendar, Clock, AlertCircle, Users, FileText, MapPin, Bell, Search, MessageCircle, Mail, ExternalLink } from 'lucide-react'
import api from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'

function DailyOrgViewer() {
  const { accessToken } = useAuth()
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (accessToken) {
      fetchDailyOrg()
    }
  }, [accessToken])

  const fetchDailyOrg = async () => {
    try {
      const response = await api.get('/daily-org/metadata', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      setPdfUrl(response.data.webUrl)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching Daily Org:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-gray-50">
        <p className="text-gray-600">Loading Daily Org...</p>
      </div>
    )
  }

  if (!pdfUrl) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-gray-50">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">Daily Org PDF not available</p>
        <p className="text-sm text-gray-400">Auto-loaded from Teams SharePoint</p>
      </div>
    )
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <iframe
        src={pdfUrl}
        className="w-full h-96"
        title="Daily Org PDF"
      />
      <div className="p-3 bg-gray-50 border-t border-gray-200">
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline"
        >
          Open in new tab
        </a>
      </div>
    </div>
  )
}

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
  staffAway?: Array<{
    name: string
    reason: string
  }>
}

export default function HomePage() {
  const { isAuthenticated, accessToken, account } = useAuth()
  const [data, setData] = useState<MergedDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [staffSearch, setStaffSearch] = useState('')
  const [staffResults, setStaffResults] = useState<any[]>([])

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

  const searchStaff = async (query: string) => {
    if (query.length < 2) {
      setStaffResults([])
      return
    }

    try {
      const response = await api.get(`/staff/enhanced?search=${encodeURIComponent(query)}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      setStaffResults(response.data.slice(0, 5))
    } catch (error) {
      console.error('Error searching staff:', error)
    }
  }

  useEffect(() => {
    if (staffSearch) {
      const timeoutId = setTimeout(() => searchStaff(staffSearch), 300)
      return () => clearTimeout(timeoutId)
    }
  }, [staffSearch])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in</h2>
          <p className="text-gray-600">You need to be authenticated to view the dashboard</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">No data available</div>
      </div>
    )
  }

  const today = new Date(data.today)
  const dayName = today.toLocaleDateString('en-AU', { weekday: 'long' })
  const dateStr = today.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
  const userName = account?.name || 'Staff Member'

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">NOSSAL STAFF INTRANET</h1>
          <div className="text-sm text-gray-600">
            Welcome, {userName} | {dayName} {dateStr}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left Column - Daily Org & Today at a Glance */}
          <div className="lg:col-span-2 space-y-6">
            {/* Daily Org PDF */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">DAILY ORG (PDF)</h2>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-gray-50">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Daily Org PDF will appear here</p>
                <p className="text-sm text-gray-400">Auto-loaded from Teams SharePoint</p>
                <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                  View PDF
                </button>
              </div>
            </div>

            {/* Today at a Glance */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">TODAY AT A GLANCE</h2>
              <div className="space-y-2">
                {data.timetable.length > 0 ? (
                  data.timetable.map((classItem, idx) => {
                    const isExtra = data.extrasDetails.some(e => e.period === classItem.period)
                    const roomChange = data.roomChanges.find(rc => rc.period === classItem.period)
                    
                    return (
                      <div key={idx} className="flex items-start p-3 bg-gray-50 rounded border border-gray-200">
                        <Clock className="w-4 h-4 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">
                            Period {classItem.period}: {classItem.className}
                          </p>
                          <p className="text-sm text-gray-600">
                            {classItem.subject}
                            {roomChange ? (
                              <span className="ml-2 text-blue-600 font-medium">
                                • ROOM CHANGED → {roomChange.to || classItem.room}
                              </span>
                            ) : (
                              <span> • {classItem.room}</span>
                            )}
                          </p>
                          {isExtra && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                              EXTRA
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="p-3 bg-gray-50 rounded border border-gray-200">
                    <p className="text-gray-500">No classes scheduled for today</p>
                  </div>
                )}

                {/* Show free periods */}
                {data.timetable.length < 6 && (
                  <div className="p-3 bg-green-50 rounded border border-green-200">
                    <p className="text-sm text-green-800">
                      Free periods: {Array.from({ length: 6 - data.timetable.length }, (_, i) => {
                        const periods = [1, 2, 3, 4, 5, 6]
                        const usedPeriods = data.timetable.map(t => t.period)
                        return periods.find(p => !usedPeriods.includes(p))
                      }).filter(Boolean).join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Staff Away */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              STAFF AWAY TODAY ({data.staffAway?.length || 0})
            </h2>
            {data.staffAway && data.staffAway.length > 0 ? (
              <div className="space-y-2">
                {data.staffAway.map((staff, idx) => (
                  <div key={idx} className="p-2 bg-gray-50 rounded text-sm">
                    <span className="font-medium text-gray-900">{staff.name}</span>
                    {staff.reason && (
                      <span className="text-gray-600 ml-2">({staff.reason})</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No staff absences recorded</p>
              </div>
            )}
          </div>
        </div>

        {/* Three Column Section - Extras, Room Changes, Notices */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Extras */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">EXTRAS</h2>
            {data.extras > 0 ? (
              <div>
                <div className="text-3xl font-bold text-yellow-600 mb-2">You have {data.extras}</div>
                <button className="text-sm text-blue-600 hover:underline">(View)</button>
                {data.extrasDetails.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {data.extrasDetails.slice(0, 3).map((extra, idx) => (
                      <div key={idx} className="text-sm text-gray-600">
                        Period {extra.period}: {extra.className}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No extras assigned</p>
            )}
          </div>

          {/* Room Changes */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">ROOM CHANGES</h2>
            {data.roomChanges.length > 0 ? (
              <div className="space-y-2">
                {data.roomChanges.map((change, idx) => (
                  <div key={idx} className="text-sm">
                    <span className="font-medium">Rm {change.from || change.Room}→{change.to || change.NewRoom}</span>
                    <span className="text-gray-600 ml-2">P{change.period || change.Period}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No room changes</p>
            )}
          </div>

          {/* Notices */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">NOTICES</h2>
            {data.announcements.length > 0 ? (
              <div className="space-y-3">
                {data.announcements.slice(0, 3).map((announcement) => (
                  <div key={announcement.id} className="text-sm">
                    <p className="font-medium text-gray-900">- {announcement.title}</p>
                    {announcement.priority === 'URGENT' && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-800 text-xs font-medium rounded">
                        URGENT
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No new notices</p>
            )}
          </div>
        </div>

        {/* Staff Directory Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">STAFF DIRECTORY</h2>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, faculty, role..."
              value={staffSearch}
              onChange={(e) => setStaffSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {staffResults.length > 0 && (
            <div className="space-y-3">
              {staffResults.map((staff) => (
                <div key={staff.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                  <div className="flex items-center space-x-3">
                    {staff.photoUrl && (
                      <img src={staff.photoUrl} alt={staff.name} className="w-10 h-10 rounded-full" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {staff.name} – {staff.faculty || 'Staff'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {staff.presence === 'Available' ? (
                          <span className="text-green-600">Available</span>
                        ) : staff.presence === 'Busy' ? (
                          <span className="text-yellow-600">Busy</span>
                        ) : (
                          <span className="text-gray-500">{staff.presence || 'Unknown'}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Chat in Teams">
                      <MessageCircle className="w-5 h-5" />
                    </button>
                    <a href={`mailto:${staff.email}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Email">
                      <Mail className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
          {staffSearch && staffResults.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-4">No staff found</p>
          )}
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">QUICK LINKS</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <a
              href="https://nossal-hs.compass.education"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
            >
              <ExternalLink className="w-6 h-6 text-blue-600 mb-2" />
              <span className="font-medium text-gray-900 text-sm">Compass</span>
            </a>
            <a
              href="https://teams.microsoft.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
            >
              <MessageCircle className="w-6 h-6 text-blue-600 mb-2" />
              <span className="font-medium text-gray-900 text-sm">Teams</span>
            </a>
            <a
              href="/sharepoint"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
            >
              <FileText className="w-6 h-6 text-blue-600 mb-2" />
              <span className="font-medium text-gray-900 text-sm">SharePoint</span>
            </a>
            <Link
              href="/helpdesk"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
            >
              <AlertCircle className="w-6 h-6 text-blue-600 mb-2" />
              <span className="font-medium text-gray-900 text-sm">IT Helpdesk</span>
            </Link>
            <Link
              href="/resources"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
            >
              <FileText className="w-6 h-6 text-blue-600 mb-2" />
              <span className="font-medium text-gray-900 text-sm">Policies</span>
            </Link>
            <Link
              href="/forms"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
            >
              <FileText className="w-6 h-6 text-blue-600 mb-2" />
              <span className="font-medium text-gray-900 text-sm">HR Forms</span>
            </Link>
          </div>
        </div>

        {/* Resources */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">RESOURCES</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/resources?category=Curriculum" className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all text-center">
              <span className="font-medium text-gray-900 text-sm">Curriculum</span>
            </Link>
            <Link href="/resources?category=Policies" className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all text-center">
              <span className="font-medium text-gray-900 text-sm">Policies</span>
            </Link>
            <Link href="/resources?category=Lesson Templates" className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all text-center">
              <span className="font-medium text-gray-900 text-sm">Lesson Templates</span>
            </Link>
            <Link href="/resources?category=Wellbeing" className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all text-center">
              <span className="font-medium text-gray-900 text-sm">Wellbeing Toolkit</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
