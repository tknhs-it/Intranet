'use client'

import { ExternalLink, BookOpen, Video, FileText, Users, Presentation } from 'lucide-react'

const tools = [
  {
    category: 'Video & Media',
    items: [
      { name: 'ClickView', url: 'https://www.clickview.com.au', icon: Video, color: 'bg-purple-100 text-purple-600' },
      { name: 'Edrolo', url: 'https://www.edrolo.com.au', icon: BookOpen, color: 'bg-blue-100 text-blue-600' },
      { name: 'Flip', url: 'https://info.flip.com', icon: Video, color: 'bg-green-100 text-green-600' },
    ]
  },
  {
    category: 'Learning Platforms',
    items: [
      { name: 'Stile', url: 'https://stileapp.com', icon: BookOpen, color: 'bg-indigo-100 text-indigo-600' },
      { name: 'Cambridge', url: 'https://www.cambridge.edu.au', icon: FileText, color: 'bg-red-100 text-red-600' },
      { name: 'Jacaranda', url: 'https://www.jacplus.com.au', icon: BookOpen, color: 'bg-yellow-100 text-yellow-600' },
      { name: 'Oxford', url: 'https://www.oup.com.au', icon: FileText, color: 'bg-blue-100 text-blue-600' },
    ]
  },
  {
    category: 'Microsoft 365',
    items: [
      { name: 'Microsoft Forms', url: 'https://forms.office.com', icon: FileText, color: 'bg-blue-100 text-blue-600' },
      { name: 'Microsoft Teams', url: 'https://teams.microsoft.com', icon: Users, color: 'bg-purple-100 text-purple-600' },
      { name: 'OneNote', url: 'https://www.onenote.com', icon: FileText, color: 'bg-orange-100 text-orange-600' },
      { name: 'Whiteboard', url: 'https://whiteboard.microsoft.com', icon: Presentation, color: 'bg-green-100 text-green-600' },
    ]
  },
  {
    category: 'School Resources',
    items: [
      { name: 'Printable Seating Plans', url: '#', icon: FileText, color: 'bg-gray-100 text-gray-600' },
      { name: 'Lab Booking', url: '#', icon: BookOpen, color: 'bg-green-100 text-green-600' },
      { name: 'Equipment Booking', url: '#', icon: FileText, color: 'bg-blue-100 text-blue-600' },
    ]
  }
]

export default function ToolsPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Classroom Tools</h1>
          <p className="text-gray-600">Quick access to teaching tools and resources</p>
        </div>

        <div className="space-y-8">
          {tools.map((category) => (
            <div key={category.category} className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{category.category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.items.map((tool) => {
                  const Icon = tool.icon
                  return (
                    <a
                      key={tool.name}
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all group"
                    >
                      <div className={`p-2 rounded-lg ${tool.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="flex-1 font-medium text-gray-900 group-hover:text-blue-600">
                        {tool.name}
                      </span>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                    </a>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

