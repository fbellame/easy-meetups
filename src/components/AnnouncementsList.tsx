'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  MegaphoneIcon, 
  CalendarDaysIcon, 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import type { Announcement } from '@/types/database'

interface AnnouncementsListProps {
  announcements: Announcement[]
}

const platformIcons = {
  meetup: '🔗',
  luma: '📅',
  linkedin: '💼'
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  scheduled: 'bg-yellow-100 text-yellow-800',
  sent: 'bg-green-100 text-green-800'
}

const typeColors = {
  pre_event: 'bg-blue-100 text-blue-800',
  post_event: 'bg-green-100 text-green-800',
  reminder: 'bg-orange-100 text-orange-800'
}

export default function AnnouncementsList({ announcements }: AnnouncementsListProps) {
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesFilter = filter === 'all' || announcement.status === filter
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  return (
    <>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MegaphoneIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="sm:w-48">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="sent">Sent</option>
          </select>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.map((announcement) => (
          <div key={announcement.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">Type: {announcement.type.replace('_', ' ')}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[announcement.type as keyof typeof typeColors]}`}>
                    {announcement.type.replace('_', ' ')}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[announcement.status as keyof typeof statusColors]}`}>
                    {announcement.status}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{announcement.content}</p>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <span className="mr-1">Platforms:</span>
                    <div className="flex space-x-1">
                      {announcement.platforms && announcement.platforms.map((platform) => (
                        <span key={platform} className="flex items-center">
                          {platformIcons[platform as keyof typeof platformIcons]} {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  {announcement.scheduled_for && (
                    <div className="flex items-center">
                      <CalendarDaysIcon className="h-4 w-4 mr-1" />
                      {new Date(announcement.scheduled_for).toLocaleDateString()}
                    </div>
                  )}
                  
                  {announcement.sent_at && (
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-4 w-4 mr-1 text-green-500" />
                      Sent {new Date(announcement.sent_at).toLocaleDateString()}
                    </div>
                  )}
                  
                  {announcement.status === 'scheduled' && !announcement.sent_at && (
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1 text-yellow-500" />
                      Scheduled
                    </div>
                  )}
                  
                  {announcement.status === 'draft' && (
                    <div className="flex items-center">
                      <XCircleIcon className="h-4 w-4 mr-1 text-gray-500" />
                      Draft
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-2">
                <Link
                  href={`/announcements/${announcement.id}`}
                  className="flex-1 text-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                >
                  View Details
                </Link>
                <Link
                  href={`/announcements/${announcement.id}/edit`}
                  className="flex-1 text-center px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors"
                >
                  Edit
                </Link>
                {announcement.status === 'draft' && (
                  <button className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors">
                    Send Now
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAnnouncements.length === 0 && (
        <div className="text-center py-12">
          <MegaphoneIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No announcements found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filter !== 'all'
              ? 'No announcements match your search criteria.'
              : 'Get started by creating your first announcement.'
            }
          </p>
          <div className="mt-6">
            <Link
              href="/announcements/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <MegaphoneIcon className="h-5 w-5 mr-2" />
              Create Announcement
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
