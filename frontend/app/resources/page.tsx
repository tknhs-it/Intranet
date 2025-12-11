'use client'

import { useEffect, useState } from 'react'
import { Search, Download, FileText, BookOpen, GraduationCap, FileCheck } from 'lucide-react'
import api from '@/lib/api'

export default function ResourcesPage() {
  const [resources, setResources] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('')

  useEffect(() => {
    fetchResources()
  }, [selectedType])

  const fetchResources = async () => {
    try {
      const params: any = {}
      if (selectedType) params.type = selectedType
      if (searchTerm) params.search = searchTerm

      const response = await api.get('/resources', { params })
      setResources(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching resources:', error)
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchResources()
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'LESSON_PLAN':
        return BookOpen
      case 'ASSESSMENT':
        return FileCheck
      case 'RUBRIC':
        return FileText
      case 'SAC':
        return GraduationCap
      default:
        return FileText
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading resources...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Resource Library</h1>
          <p className="text-gray-600">Lesson plans, assessments, and teaching resources</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="LESSON_PLAN">Lesson Plans</option>
              <option value="ASSESSMENT">Assessments</option>
              <option value="RUBRIC">Rubrics</option>
              <option value="CURRICULUM_MAP">Curriculum Maps</option>
              <option value="SAC">SACs</option>
              <option value="EXAM">Exams</option>
              <option value="UNIT_PLAN">Unit Plans</option>
            </select>
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Search
            </button>
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => {
            const Icon = getTypeIcon(resource.type)
            return (
              <div
                key={resource.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{resource.title}</h3>
                      <p className="text-xs text-gray-500 capitalize">{resource.type.toLowerCase().replace('_', ' ')}</p>
                    </div>
                  </div>
                </div>

                {resource.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{resource.description}</p>
                )}

                <div className="flex items-center gap-2 mb-4">
                  {resource.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{resource.downloadCount} downloads</span>
                  <span className="capitalize">{resource.category}</span>
                </div>

                <div className="flex gap-2">
                  {resource.fileUrl && (
                    <a
                      href={resource.fileUrl}
                      download
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                  )}
                  {resource.externalUrl && (
                    <a
                      href={resource.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      View
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {resources.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No resources found</p>
          </div>
        )}
      </div>
    </main>
  )
}

