'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  MicrophoneIcon, 
  EnvelopeIcon, 
  UserIcon,
  TagIcon
} from '@heroicons/react/24/outline'
import type { Speaker } from '@/types/database'

interface SpeakersListProps {
  speakers: Speaker[]
}

export default function SpeakersList({ speakers }: SpeakersListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterExpertise, setFilterExpertise] = useState('all')

  const allExpertise = Array.from(new Set(speakers.flatMap(s => s.expertise || [])))

  const filteredSpeakers = speakers.filter(speaker => {
    const matchesSearch = speaker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (speaker.bio && speaker.bio.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (speaker.expertise && speaker.expertise.some(exp => exp.toLowerCase().includes(searchTerm.toLowerCase())))
    
    const matchesExpertise = filterExpertise === 'all' || (speaker.expertise && speaker.expertise.includes(filterExpertise))
    
    return matchesSearch && matchesExpertise
  })

  return (
    <>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MicrophoneIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search speakers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="sm:w-64">
          <select
            value={filterExpertise}
            onChange={(e) => setFilterExpertise(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Expertise</option>
            {allExpertise.map(expertise => (
              <option key={expertise} value={expertise}>{expertise}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Speakers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSpeakers.map((speaker) => (
          <div key={speaker.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">{speaker.name}</h3>
                    <p className="text-sm text-gray-600">{speaker.email}</p>
                  </div>
                </div>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  Available
                </span>
              </div>
              
              {speaker.bio && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{speaker.bio}</p>
              )}
              
              {speaker.expertise && speaker.expertise.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <TagIcon className="h-4 w-4 mr-2" />
                    Expertise
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {speaker.expertise.map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {speaker.social_links && Object.keys(speaker.social_links).length > 0 && (
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-2">Social Links</div>
                  <div className="flex space-x-2">
                    {Object.entries(speaker.social_links).map(([platform, url]) => (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        {platform}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <Link
                  href={`/speakers/${speaker.id}`}
                  className="flex-1 text-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                >
                  View Details
                </Link>
                <Link
                  href={`/speakers/${speaker.id}/edit`}
                  className="flex-1 text-center px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors"
                >
                  Edit
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSpeakers.length === 0 && (
        <div className="text-center py-12">
          <MicrophoneIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No speakers found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterExpertise !== 'all'
              ? 'No speakers match your search criteria.'
              : 'Get started by adding your first speaker.'
            }
          </p>
          <div className="mt-6">
            <Link
              href="/speakers/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <MicrophoneIcon className="h-5 w-5 mr-2" />
              Add Speaker
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
