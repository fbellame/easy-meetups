'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  CalendarDaysIcon, 
  MapPinIcon, 
  UserGroupIcon,
  MicrophoneIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import type { Host, Speaker } from '@/types/database'

interface EventFormData {
  title: string
  description: string
  host_id: string
  venue_name: string
  venue_address: string
  event_date: string
  start_time: string
  end_time: string
  max_capacity: string
  registration_deadline: string
  status: 'planned' | 'confirmed' | 'cancelled' | 'completed'
  meetup_url: string
  luma_url: string
  linkedin_url: string
  selected_speakers: string[]
}

interface EventFormProps {
  initialData?: Partial<EventFormData> & { id?: string }
  isEditing?: boolean
}

const STATUS_OPTIONS = [
  { value: 'planned', label: 'Planned' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'completed', label: 'Completed' }
]

export default function EventForm({ initialData, isEditing = false }: EventFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [hosts, setHosts] = useState<Host[]>([])
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [loadingData, setLoadingData] = useState(true)
  
  const [formData, setFormData] = useState<EventFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    host_id: initialData?.host_id || '',
    venue_name: initialData?.venue_name || '',
    venue_address: initialData?.venue_address || '',
    event_date: initialData?.event_date || '',
    start_time: initialData?.start_time || '',
    end_time: initialData?.end_time || '',
    max_capacity: initialData?.max_capacity?.toString() || '',
    registration_deadline: initialData?.registration_deadline || '',
    status: initialData?.status || 'planned',
    meetup_url: initialData?.meetup_url || '',
    luma_url: initialData?.luma_url || '',
    linkedin_url: initialData?.linkedin_url || '',
    selected_speakers: initialData?.selected_speakers || []
  })

  // Check authentication and load data on component mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Check authentication
        const { data: { session } } = await supabase.auth.getSession()
        setIsAuthenticated(!!session?.user)

        // Load hosts and speakers
        const [hostsResponse, speakersResponse] = await Promise.all([
          fetch('/api/hosts'),
          fetch('/api/speakers')
        ])

        if (hostsResponse.ok) {
          const hostsData = await hostsResponse.json()
          setHosts(hostsData)
        }

        if (speakersResponse.ok) {
          const speakersData = await speakersResponse.json()
          setSpeakers(speakersData)
        }
      } catch (error) {
        console.error('Error initializing data:', error)
        setIsAuthenticated(false)
      } finally {
        setAuthLoading(false)
        setLoadingData(false)
      }
    }
    
    initializeData()
  }, [])

  const handleInputChange = (field: keyof EventFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSpeakerToggle = (speakerId: string) => {
    setFormData(prev => ({
      ...prev,
      selected_speakers: prev.selected_speakers.includes(speakerId)
        ? prev.selected_speakers.filter(id => id !== speakerId)
        : [...prev.selected_speakers, speakerId]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Prepare the data with proper validation
      const submitData = {
        ...(isEditing && initialData ? { id: initialData.id } : {}),
        title: formData.title,
        description: formData.description || '',
        host_id: formData.host_id || '',
        venue_name: formData.venue_name || '',
        venue_address: formData.venue_address || '',
        event_date: formData.event_date,
        start_time: formData.start_time || '',
        end_time: formData.end_time || '',
        max_capacity: formData.max_capacity || '',
        registration_deadline: formData.registration_deadline || '',
        status: formData.status,
        meetup_url: formData.meetup_url || '',
        luma_url: formData.luma_url || '',
        linkedin_url: formData.linkedin_url || '',
        // Note: selected_speakers will be handled separately via event_speakers table
      }

      const response = await fetch('/api/events', {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        throw new Error('Failed to save event')
      }

      const event = await response.json()

      // Handle speaker assignments if any speakers are selected
      if (formData.selected_speakers.length > 0) {
        await fetch('/api/event-speakers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event_id: event.id,
            speaker_ids: formData.selected_speakers
          }),
        })
      }

      router.push('/events')
      router.refresh()
    } catch (error) {
      console.error('Error saving event:', error)
      alert('Failed to save event. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading state while checking authentication and loading data
  if (authLoading || loadingData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show authentication required message if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Authentication Required</h3>
          <p className="text-yellow-700 mb-4">You need to be signed in to create or edit events.</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Event Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-800 mb-2">
              <CalendarDaysIcon className="h-4 w-4 inline mr-1" />
              Event Title *
            </label>
            <input
              type="text"
              id="title"
              required
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-600 text-gray-900"
              placeholder="Enter event title"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-800 mb-2">
              Event Description
            </label>
            <textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-600 text-gray-900"
              placeholder="Enter event description"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-800 mb-2">
              Status
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value as EventFormData['status'])}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="max_capacity" className="block text-sm font-medium text-gray-800 mb-2">
              <UserGroupIcon className="h-4 w-4 inline mr-1" />
              Maximum Capacity
            </label>
            <input
              type="number"
              id="max_capacity"
              min="1"
              value={formData.max_capacity}
              onChange={(e) => handleInputChange('max_capacity', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-600 text-gray-900"
              placeholder="Enter maximum capacity"
            />
          </div>
        </div>
      </div>

      {/* Date and Time */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Date & Time</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="event_date" className="block text-sm font-medium text-gray-800 mb-2">
              <CalendarDaysIcon className="h-4 w-4 inline mr-1" />
              Event Date *
            </label>
            <input
              type="date"
              id="event_date"
              required
              value={formData.event_date}
              onChange={(e) => handleInputChange('event_date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>

          <div>
            <label htmlFor="registration_deadline" className="block text-sm font-medium text-gray-800 mb-2">
              <ClockIcon className="h-4 w-4 inline mr-1" />
              Registration Deadline
            </label>
            <input
              type="datetime-local"
              id="registration_deadline"
              value={formData.registration_deadline}
              onChange={(e) => handleInputChange('registration_deadline', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>

          <div>
            <label htmlFor="start_time" className="block text-sm font-medium text-gray-800 mb-2">
              <ClockIcon className="h-4 w-4 inline mr-1" />
              Start Time
            </label>
            <input
              type="time"
              id="start_time"
              value={formData.start_time}
              onChange={(e) => handleInputChange('start_time', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>

          <div>
            <label htmlFor="end_time" className="block text-sm font-medium text-gray-800 mb-2">
              <ClockIcon className="h-4 w-4 inline mr-1" />
              End Time
            </label>
            <input
              type="time"
              id="end_time"
              value={formData.end_time}
              onChange={(e) => handleInputChange('end_time', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>
        </div>
      </div>

      {/* Host Selection */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Host Selection</h3>
        <div>
          <label htmlFor="host_id" className="block text-sm font-medium text-gray-800 mb-2">
            <UserGroupIcon className="h-4 w-4 inline mr-1" />
            Select Host
          </label>
          <select
            id="host_id"
            value={formData.host_id}
            onChange={(e) => handleInputChange('host_id', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          >
            <option value="">Select a host (optional)</option>
            {hosts.map((host) => (
              <option key={host.id} value={host.id}>
                {host.name} {host.company && `- ${host.company}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Venue Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Venue Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="venue_name" className="block text-sm font-medium text-gray-800 mb-2">
              <MapPinIcon className="h-4 w-4 inline mr-1" />
              Venue Name
            </label>
            <input
              type="text"
              id="venue_name"
              value={formData.venue_name}
              onChange={(e) => handleInputChange('venue_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-600 text-gray-900"
              placeholder="Enter venue name"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="venue_address" className="block text-sm font-medium text-gray-800 mb-2">
              <MapPinIcon className="h-4 w-4 inline mr-1" />
              Venue Address
            </label>
            <textarea
              id="venue_address"
              rows={3}
              value={formData.venue_address}
              onChange={(e) => handleInputChange('venue_address', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-600 text-gray-900"
              placeholder="Enter full venue address"
            />
          </div>
        </div>
      </div>

      {/* Speaker Selection */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Speaker Selection</h3>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Select speakers for this event:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {speakers.map((speaker) => (
              <div
                key={speaker.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  formData.selected_speakers.includes(speaker.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleSpeakerToggle(speaker.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{speaker.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{speaker.bio}</p>
                    {speaker.expertise && speaker.expertise.length > 0 && (
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-1">
                          {speaker.expertise.slice(0, 3).map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {skill}
                            </span>
                          ))}
                          {speaker.expertise.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              +{speaker.expertise.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    {formData.selected_speakers.includes(speaker.id) ? (
                      <CheckIcon className="h-5 w-5 text-blue-600" />
                    ) : (
                      <XMarkIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {speakers.length === 0 && (
            <p className="text-gray-500 text-center py-4">No speakers available. Add speakers first.</p>
          )}
        </div>
      </div>

      {/* Event Links */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Event Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="meetup_url" className="block text-sm font-medium text-gray-800 mb-2">
              Meetup URL
            </label>
            <input
              type="url"
              id="meetup_url"
              value={formData.meetup_url}
              onChange={(e) => handleInputChange('meetup_url', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-600 text-gray-900"
              placeholder="https://meetup.com/..."
            />
          </div>

          <div>
            <label htmlFor="luma_url" className="block text-sm font-medium text-gray-800 mb-2">
              Luma URL
            </label>
            <input
              type="url"
              id="luma_url"
              value={formData.luma_url}
              onChange={(e) => handleInputChange('luma_url', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-600 text-gray-900"
              placeholder="https://lu.ma/..."
            />
          </div>

          <div>
            <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-800 mb-2">
              LinkedIn URL
            </label>
            <input
              type="url"
              id="linkedin_url"
              value={formData.linkedin_url}
              onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-600 text-gray-900"
              placeholder="https://linkedin.com/..."
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <CheckIcon className="h-4 w-4 mr-2" />
              {isEditing ? 'Update Event' : 'Create Event'}
            </>
          )}
        </button>
      </div>
    </form>
  )
}
