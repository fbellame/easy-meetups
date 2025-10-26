'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PlusIcon, UserGroupIcon, ChartBarIcon, CalendarDaysIcon, MicrophoneIcon, BuildingOfficeIcon, UsersIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline'
import CommunityList from './CommunityList'
import QuickAddMemberForm from './QuickAddMemberForm'
import type { CommunityMember } from '@/types/database'

interface CommunityPageClientProps {
  members: CommunityMember[]
  user: any
}

export default function CommunityPageClient({ members, user }: CommunityPageClientProps) {
  const [showQuickAddForm, setShowQuickAddForm] = useState(false)
  const [showImportForm, setShowImportForm] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<{success: boolean, message: string, isAuthError?: boolean} | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && (
      file.type === 'text/csv' || 
      file.type === 'text/tab-separated-values' ||
      file.name.endsWith('.csv') ||
      file.name.endsWith('.tsv') ||
      file.name.endsWith('.xls') ||
      file.name.endsWith('.xlsx')
    )) {
      setImportFile(file)
      setImportResult(null)
    } else {
      setImportResult({ success: false, message: 'Please select a valid CSV, TSV, or Excel file' })
    }
  }

  const handleImport = async () => {
    if (!importFile) {
      setImportResult({ success: false, message: 'Please select a file first' })
      return
    }

    setIsImporting(true)
    setImportResult(null)

    try {
      const formData = new FormData()
      formData.append('file', importFile)

      const response = await fetch('/api/community-members/import-test', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        setImportResult({ 
          success: true, 
          message: `Successfully imported ${result.imported} members!` 
        })
        setImportFile(null)
        // Refresh the page to show new members
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else if (response.status === 401) {
        setImportResult({ 
          success: false, 
          message: 'Please sign in to import CSV files. Click here to sign in.',
          isAuthError: true
        })
      } else {
        setImportResult({ 
          success: false, 
          message: result.error || 'Import failed' 
        })
      }
    } catch (error) {
      setImportResult({ 
        success: false, 
        message: 'Network error. Please try again.' 
      })
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-8 rounded-xl border border-blue-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="bg-blue-600 p-3 rounded-xl shadow-lg">
                <UsersIcon className="h-8 w-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Community Members</h1>
              <p className="mt-2 text-lg text-gray-600">Manage your GenAI Montreal community members and engagement</p>
              {!user && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-yellow-800 text-sm">
                    <strong>Note:</strong> You're not signed in. Some features may be limited. 
                    <a href="/auth/login" className="ml-1 text-blue-600 hover:text-blue-800 underline">
                      Sign in here
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowImportForm(true)}
              className="inline-flex items-center px-4 py-2 border border-blue-300 text-blue-700 rounded-md hover:bg-blue-50 transition-colors"
            >
              <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
              Import CSV
            </button>
            <button
              onClick={() => setShowQuickAddForm(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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


      <CommunityList members={members} />

      {/* Quick Add Member Modal */}
      {showQuickAddForm && (
        <QuickAddMemberForm onClose={() => setShowQuickAddForm(false)} />
      )}

      {/* CSV Import Modal */}
      {showImportForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Import Community Members from CSV</h3>
              
              {importResult && (
                <div className={`mb-4 p-3 rounded-md ${
                  importResult.success 
                    ? 'bg-green-50 border border-green-200 text-green-800' 
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                  <p className="text-sm">
                    {importResult.isAuthError ? (
                      <a href="/auth/login" className="underline hover:no-underline">
                        {importResult.message}
                      </a>
                    ) : (
                      importResult.message
                    )}
                  </p>
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload CSV File
                </label>
                <input
                  type="file"
                  accept=".csv,.xls,.xlsx,.tsv"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {importFile && (
                  <p className="text-sm text-gray-600 mt-1">
                    Selected: {importFile.name}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Supports CSV, TSV, and Excel files. Will automatically detect columns like Name, User ID, Location, Meetup URL, etc.
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  <a 
                    href="/sample-community-members.csv" 
                    download 
                    className="hover:underline"
                  >
                    Download sample CSV file
                  </a>
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowImportForm(false)
                    setImportFile(null)
                    setImportResult(null)
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  disabled={isImporting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={!importFile || isImporting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isImporting ? 'Importing...' : 'Import'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
