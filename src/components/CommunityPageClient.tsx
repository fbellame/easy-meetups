'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PlusIcon, UserGroupIcon, ChartBarIcon, CalendarDaysIcon, MicrophoneIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline'
import CommunityList from './CommunityList'
import QuickAddMemberForm from './QuickAddMemberForm'
import type { CommunityMember } from '@/types/database'

interface CommunityPageClientProps {
  members: CommunityMember[]
}

export default function CommunityPageClient({ members }: CommunityPageClientProps) {
  const [showQuickAddForm, setShowQuickAddForm] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Community</h1>
          <p className="mt-2 text-gray-600">Manage your community members and engagement</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowQuickAddForm(true)}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Quick Add
          </button>
          <Link
            href="/community/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Member
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserGroupIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Members</p>
              <p className="text-2xl font-semibold text-gray-900">{members.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Members</p>
              <p className="text-2xl font-semibold text-gray-900">{members.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CalendarDaysIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">New This Month</p>
              <p className="text-2xl font-semibold text-gray-900">
                {members.filter(member => {
                  const memberDate = new Date(member.join_date)
                  const now = new Date()
                  return memberDate.getMonth() === now.getMonth() && memberDate.getFullYear() === now.getFullYear()
                }).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Attendance</p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Everything Loop - Multiple Add Buttons */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Add Everything</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => setShowQuickAddForm(true)}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group"
          >
            <div className="text-center">
              <UserGroupIcon className="h-8 w-8 text-gray-400 group-hover:text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 group-hover:text-blue-600">Add Member</p>
            </div>
          </button>
          
          <Link
            href="/speakers/new"
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors group"
          >
            <div className="text-center">
              <MicrophoneIcon className="h-8 w-8 text-gray-400 group-hover:text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 group-hover:text-green-600">Add Speaker</p>
            </div>
          </Link>
          
          <Link
            href="/hosts/new"
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors group"
          >
            <div className="text-center">
              <BuildingOfficeIcon className="h-8 w-8 text-gray-400 group-hover:text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 group-hover:text-purple-600">Add Host</p>
            </div>
          </Link>
          
          <Link
            href="/events/new"
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors group"
          >
            <div className="text-center">
              <CalendarDaysIcon className="h-8 w-8 text-gray-400 group-hover:text-orange-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 group-hover:text-orange-600">Create Event</p>
            </div>
          </Link>
        </div>
        <p className="text-sm text-gray-500 mt-3 text-center">Click any button above to quickly add new content</p>
      </div>

      <CommunityList members={members} />

      {/* Quick Add Member Modal */}
      {showQuickAddForm && (
        <QuickAddMemberForm onClose={() => setShowQuickAddForm(false)} />
      )}
    </div>
  )
}
