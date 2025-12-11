'use client'

import { useEffect, useState } from 'react'
import { Search, MapPin, Clock, Calendar, Users } from 'lucide-react'
import api from '@/lib/api'

export default function RoomsPage() {
  const [rooms, setRooms] = useState<any[]>([])
  const [availableRooms, setAvailableRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchRooms()
    fetchAvailableRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      const response = await api.get('/rooms')
      setRooms(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching rooms:', error)
      setLoading(false)
    }
  }

  const fetchAvailableRooms = async () => {
    try {
      const now = new Date()
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000)
      
      const response = await api.get('/rooms/availability', {
        params: {
          startTime: now.toISOString(),
          endTime: oneHourLater.toISOString()
        }
      })
      setAvailableRooms(response.data.available)
    } catch (error) {
      console.error('Error fetching available rooms:', error)
    }
  }

  const filteredRooms = rooms.filter(room =>
    room.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.building.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading rooms...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Room Finder</h1>
          <p className="text-gray-600">Find available rooms and view timetables</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by room code, name, or building..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Available Now */}
        {availableRooms.length > 0 && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-green-900 mb-2">
              Available Now ({availableRooms.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {availableRooms.slice(0, 10).map((room) => (
                <span
                  key={room.id}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                >
                  {room.code}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Room Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRooms.map((room) => {
            const isAvailable = availableRooms.some(r => r.id === room.id)
            
            return (
              <div
                key={room.id}
                className={`bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow ${
                  isAvailable ? 'border-2 border-green-500' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{room.code}</h3>
                    <p className="text-gray-600 text-sm">{room.name}</p>
                  </div>
                  {isAvailable && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                      Available
                    </span>
                  )}
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{room.building}</span>
                    {room.floor && <span className="ml-1">• Floor {room.floor}</span>}
                  </div>
                  {room.capacity && (
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      <span>Capacity: {room.capacity}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <span className="capitalize">{room.type.toLowerCase()}</span>
                  </div>
                </div>

                <button className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  View Details
                </button>
              </div>
            )
          })}
        </div>

        {filteredRooms.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No rooms found matching your search</p>
          </div>
        )}
      </div>
    </main>
  )
}

