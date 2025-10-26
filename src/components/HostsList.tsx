'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  UserGroupIcon, 
  MapPinIcon, 
  PhoneIcon,
  EnvelopeIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import type { Host } from '@/types/database'

interface HostsListProps {
  hosts: Host[]
}

export default function HostsList({ hosts }: HostsListProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredHosts = hosts.filter(host =>
    host.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    host.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (host.venue_name && host.venue_name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <>
      {/* Search */}
      <div className="max-w-md">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <UserGroupIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search hosts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Hosts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredHosts.map((host) => (
          <div key={host.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                    {host.profile_photo_url ? (
                      <Image
                        src={host.profile_photo_url}
                        alt={host.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon className="h-6 w-6 text-blue-600" />
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">{host.name}</h3>
                    <p className="text-sm text-gray-600">{host.email}</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  Active
                </span>
              </div>
              
              {host.bio && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{host.bio}</p>
              )}
              
              <div className="space-y-3 mb-4">
                {host.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <PhoneIcon className="h-4 w-4 mr-2" />
                    {host.phone}
                  </div>
                )}
                {host.venue_name && (
                  <div className="flex items-start text-sm text-gray-600">
                    <MapPinIcon className="h-4 w-4 mr-2 mt-0.5" />
                    <div>
                      <div className="font-medium">{host.venue_name}</div>
                      {host.venue_address && (
                        <div className="text-gray-500">{host.venue_address}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-4">
                {host.capacity && (
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Capacity</span>
                    <span className="font-medium">{host.capacity} people</span>
                  </div>
                )}
                {host.company && (
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Company</span>
                    <span className="font-medium">{host.company}</span>
                  </div>
                )}
              </div>

              {host.amenities && host.amenities.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-2">Amenities</div>
                  <div className="flex flex-wrap gap-1">
                    {host.amenities.map((amenity, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {host.social_links && Object.keys(host.social_links).length > 0 && (
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-2">Social Links</div>
                  <div className="flex space-x-2">
                    {Object.entries(host.social_links).map(([platform, url]) => (
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
                  href={`/hosts/${host.id}`}
                  className="flex-1 text-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                >
                  View Details
                </Link>
                <Link
                  href={`/hosts/${host.id}/edit`}
                  className="flex-1 text-center px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors"
                >
                  Edit
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredHosts.length === 0 && (
        <div className="text-center py-12">
          <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hosts found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm 
              ? 'No hosts match your search criteria.'
              : 'Get started by adding your first host.'
            }
          </p>
          <div className="mt-6">
            <Link
              href="/hosts/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <UserGroupIcon className="h-5 w-5 mr-2" />
              Add Host
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
