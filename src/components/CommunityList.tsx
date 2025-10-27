'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  UserGroupIcon, 
  BuildingOfficeIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import type { CommunityMember } from '@/types/database'
import DeleteCommunityMemberButton from './DeleteCommunityMemberButton'

interface CommunityListProps {
  members: CommunityMember[]
  currentPage: number
  totalPages: number
  totalCount: number
  searchTerm?: string
  filterStatus?: string
}

export default function CommunityList({ members, currentPage, totalPages, totalCount, searchTerm = '', filterStatus = 'all' }: CommunityListProps) {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm)
  const [localFilterStatus, setLocalFilterStatus] = useState(filterStatus)
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (localSearchTerm) {
      params.set('search', localSearchTerm)
    } else {
      params.delete('search')
    }
    params.set('page', '1') // Reset to first page when searching
    router.push(`/community?${params.toString()}`)
  }

  const handleFilterChange = (newFilterStatus: string) => {
    setLocalFilterStatus(newFilterStatus)
    const params = new URLSearchParams(searchParams.toString())
    if (newFilterStatus !== 'all') {
      params.set('status', newFilterStatus)
    } else {
      params.delete('status')
    }
    params.set('page', '1') // Reset to first page when filtering
    router.push(`/community?${params.toString()}`)
  }

  // For now, we'll just display the members as they come from the server
  // The filtering and searching will be handled server-side
  const displayMembers = members

  return (
    <>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserGroupIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search members..."
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </form>
        </div>
        
        <div className="sm:w-48">
          <select
            value={localFilterStatus}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Members</option>
            <option value="active">Active</option>
          </select>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white shadow-sm border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  City
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Meetups
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Links
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Join Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Attended
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <BuildingOfficeIcon className="h-4 w-4 mr-2 text-gray-400" />
                      {member.company || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {member.city || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600 font-medium">{member.meetups_attended || 0}</span>
                        <span className="text-gray-500">attended</span>
                      </div>
                      {member.total_responses && member.total_responses > 0 && (
                        <div className="text-xs text-gray-500">
                          {member.responded_yes || 0} yes, {member.responded_maybe || 0} maybe
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      {member.meetup_url && (
                        <a
                          href={member.meetup_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                          title="Meetup Profile"
                        >
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                        </a>
                      )}
                      {member.linkedin_url && (
                        <a
                          href={member.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                          title="LinkedIn"
                        >
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        </a>
                      )}
                      {member.github_url && (
                        <a
                          href={member.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-gray-800"
                          title="GitHub"
                        >
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                          </svg>
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(member.join_date).toLocaleDateString('en-US')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {member.last_attended ? new Date(member.last_attended).toLocaleDateString('en-US') : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link
                        href={`/community/${member.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </Link>
                      <Link
                        href={`/community/${member.id}/edit`}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Edit
                      </Link>
                      <DeleteCommunityMemberButton memberId={member.id} memberName={member.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <Link
              href={currentPage > 1 ? `/community?${new URLSearchParams({...Object.fromEntries(searchParams.entries()), page: (currentPage - 1).toString()}).toString()}` : '#'}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage > 1
                  ? 'text-gray-700 bg-white hover:bg-gray-50'
                  : 'text-gray-400 bg-gray-100 cursor-not-allowed'
              }`}
            >
              Previous
            </Link>
            <Link
              href={currentPage < totalPages ? `/community?${new URLSearchParams({...Object.fromEntries(searchParams.entries()), page: (currentPage + 1).toString()}).toString()}` : '#'}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage < totalPages
                  ? 'text-gray-700 bg-white hover:bg-gray-50'
                  : 'text-gray-400 bg-gray-100 cursor-not-allowed'
              }`}
            >
              Next
            </Link>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">{(currentPage - 1) * 100 + 1}</span>
                {' '}to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * 100, totalCount)}
                </span>
                {' '}of{' '}
                <span className="font-medium">{totalCount}</span>
                {' '}results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <Link
                  href={currentPage > 1 ? `/community?${new URLSearchParams({...Object.fromEntries(searchParams.entries()), page: (currentPage - 1).toString()}).toString()}` : '#'}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage > 1
                      ? 'text-gray-500 hover:bg-gray-50'
                      : 'text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                </Link>
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Link
                      key={pageNum}
                      href={`/community?${new URLSearchParams({...Object.fromEntries(searchParams.entries()), page: pageNum.toString()}).toString()}`}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pageNum === currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </Link>
                  );
                })}
                
                <Link
                  href={currentPage < totalPages ? `/community?${new URLSearchParams({...Object.fromEntries(searchParams.entries()), page: (currentPage + 1).toString()}).toString()}` : '#'}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage < totalPages
                      ? 'text-gray-500 hover:bg-gray-50'
                      : 'text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                </Link>
              </nav>
            </div>
          </div>
        </div>
      )}

      {displayMembers.length === 0 && (
        <div className="text-center py-12">
          <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No members found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterStatus !== 'all'
              ? 'No members match your search criteria.'
              : 'Get started by adding your first community member.'
            }
          </p>
          <div className="mt-6">
            <Link
              href="/community/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <UserGroupIcon className="h-5 w-5 mr-2" />
              Add Member
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
