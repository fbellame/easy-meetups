'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ImageUpload from './ImageUpload'
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  BuildingOfficeIcon,
  MapPinIcon,
  UsersIcon,
  CheckIcon,
  LinkIcon
} from '@heroicons/react/24/outline'

interface HostFormData {
  name: string
  email: string
  phone: string
  company: string
  venue_name: string
  venue_address: string
  capacity: string
  amenities: string[]
  bio: string
  profile_photo_url: string
  social_links: {
    linkedin: string
    twitter: string
    github: string
    website: string
  }
  preferences: {
    tech_stack: string
    event_types: string[]
    time_preferences: string[]
  }
}

interface HostFormProps {
  initialData?: Partial<HostFormData> & { id?: string }
  isEditing?: boolean
}

const AMENITY_OPTIONS = [
  'WiFi',
  'Projector',
  'Whiteboard',
  'Microphone',
  'Video Recording',
  'Catering',
  'Parking',
  'Accessibility',
  'Air Conditioning',
  'Coffee/Tea'
]

const EVENT_TYPE_OPTIONS = [
  'Tech Talks',
  'Workshops',
  'Networking',
  'Panel Discussions',
  'Hackathons',
  'Meetups',
  'Conferences'
]

const TIME_PREFERENCE_OPTIONS = [
  'Weekday Mornings',
  'Weekday Afternoons',
  'Weekday Evenings',
  'Weekend Mornings',
  'Weekend Afternoons',
  'Weekend Evenings'
]

export default function HostForm({ initialData, isEditing = false }: HostFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [formData, setFormData] = useState<HostFormData>({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    company: initialData?.company || '',
    venue_name: initialData?.venue_name || '',
    venue_address: initialData?.venue_address || '',
    capacity: initialData?.capacity?.toString() || '',
    amenities: initialData?.amenities || [],
    bio: initialData?.bio || '',
    profile_photo_url: initialData?.profile_photo_url || '',
    social_links: {
      linkedin: initialData?.social_links?.linkedin || '',
      twitter: initialData?.social_links?.twitter || '',
      github: initialData?.social_links?.github || '',
      website: initialData?.social_links?.website || ''
    },
    preferences: {
      tech_stack: initialData?.preferences?.tech_stack || '',
      event_types: initialData?.preferences?.event_types || [],
      time_preferences: initialData?.preferences?.time_preferences || []
    }
  })

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setIsAuthenticated(!!session?.user)
      } catch (error) {
        console.error('Auth check error:', error)
        setIsAuthenticated(false)
      } finally {
        setAuthLoading(false)
      }
    }
    
    checkAuth()
  }, [])

  const handleInputChange = (field: keyof HostFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleArrayChange = (field: 'amenities' | 'event_types' | 'time_preferences', value: string) => {
    if (field === 'amenities') {
      setFormData(prev => ({
        ...prev,
        amenities: prev.amenities.includes(value)
          ? prev.amenities.filter(item => item !== value)
          : [...prev.amenities, value]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [field]: prev.preferences[field].includes(value)
            ? prev.preferences[field].filter((item: string) => item !== value)
            : [...prev.preferences[field], value]
        }
      }))
    }
  }

  const handlePreferencesChange = (field: keyof HostFormData['preferences'], value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value
      }
    }))
  }

  const handlePhotoChange = (url: string) => {
    setFormData(prev => ({
      ...prev,
      profile_photo_url: url
    }))
  }

  const handleSocialLinkChange = (platform: keyof HostFormData['social_links'], value: string) => {
    setFormData(prev => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/hosts', {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...(isEditing && initialData ? { id: initialData.id } : {}),
          ...formData,
          capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
          preferences: formData.preferences,
          social_links: formData.social_links
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save host')
      }

      router.push('/hosts')
      router.refresh()
    } catch (error) {
      console.error('Error saving host:', error)
      alert('Failed to save host. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading state while checking authentication
  if (authLoading) {
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
          <p className="text-yellow-700 mb-4">You need to be signed in to create or edit hosts.</p>
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
        <h3 className="text-lg font-medium text-gray-900 mb-6">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-800 mb-2">
              <UserIcon className="h-4 w-4 inline mr-1" />
              Company Contact Name *
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-600 text-gray-900"
              placeholder="Enter company contact name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-800 mb-2">
              <EnvelopeIcon className="h-4 w-4 inline mr-1" />
              Contact Email Address *
            </label>
            <input
              type="email"
              id="email"
              required
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-600 text-gray-900"
              placeholder="Enter contact email address"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-800 mb-2">
              <PhoneIcon className="h-4 w-4 inline mr-1" />
              Contact Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-600 text-gray-900"
              placeholder="Enter contact phone number"
            />
          </div>

          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-800 mb-2">
              <BuildingOfficeIcon className="h-4 w-4 inline mr-1" />
              Company
            </label>
            <input
              type="text"
              id="company"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-600 text-gray-900"
              placeholder="Enter company name"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="bio" className="block text-sm font-medium text-gray-800 mb-2">
              <UserIcon className="h-4 w-4 inline mr-1" />
              Bio
            </label>
            <textarea
              id="bio"
              rows={4}
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-600 text-gray-900"
              placeholder="Tell us about yourself and your company..."
            />
          </div>

          <div className="md:col-span-2">
            <ImageUpload
              label="Profile Photo"
              value={formData.profile_photo_url}
              onChange={handlePhotoChange}
              aspectRatio="square"
              maxSize={5}
              className="w-full"
            />
          </div>
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

          <div>
            <label htmlFor="capacity" className="block text-sm font-medium text-gray-800 mb-2">
              <UsersIcon className="h-4 w-4 inline mr-1" />
              Capacity
            </label>
            <input
              type="number"
              id="capacity"
              min="1"
              value={formData.capacity}
              onChange={(e) => handleInputChange('capacity', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-600 text-gray-900"
              placeholder="Enter maximum capacity"
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

      {/* Amenities */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Available Amenities</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {AMENITY_OPTIONS.map((amenity) => (
            <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.amenities.includes(amenity)}
                onChange={() => handleArrayChange('amenities', amenity)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
                  <span className="text-sm text-gray-800">{amenity}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Social Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="linkedin" className="block text-sm font-medium text-gray-800 mb-2">
              <LinkIcon className="h-4 w-4 inline mr-1" />
              LinkedIn Profile
            </label>
            <input
              type="url"
              id="linkedin"
              value={formData.social_links.linkedin}
              onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-600 text-gray-900"
              placeholder="https://linkedin.com/in/yourname"
            />
          </div>

          <div>
            <label htmlFor="twitter" className="block text-sm font-medium text-gray-800 mb-2">
              <LinkIcon className="h-4 w-4 inline mr-1" />
              Twitter Profile
            </label>
            <input
              type="url"
              id="twitter"
              value={formData.social_links.twitter}
              onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-600 text-gray-900"
              placeholder="https://twitter.com/yourname"
            />
          </div>

          <div>
            <label htmlFor="github" className="block text-sm font-medium text-gray-800 mb-2">
              <LinkIcon className="h-4 w-4 inline mr-1" />
              GitHub Profile
            </label>
            <input
              type="url"
              id="github"
              value={formData.social_links.github}
              onChange={(e) => handleSocialLinkChange('github', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-600 text-gray-900"
              placeholder="https://github.com/yourname"
            />
          </div>

          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-800 mb-2">
              <LinkIcon className="h-4 w-4 inline mr-1" />
              Company Website
            </label>
            <input
              type="url"
              id="website"
              value={formData.social_links.website}
              onChange={(e) => handleSocialLinkChange('website', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-600 text-gray-900"
              placeholder="https://yourcompany.com"
            />
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Event Preferences</h3>
        <div className="space-y-6">
          <div>
            <label htmlFor="tech_stack" className="block text-sm font-medium text-gray-800 mb-2">
              Preferred Tech Stack
            </label>
            <input
              type="text"
              id="tech_stack"
              value={formData.preferences.tech_stack}
              onChange={(e) => handlePreferencesChange('tech_stack', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-600 text-gray-900"
              placeholder="e.g., React, Node.js, Python, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-3">
              Preferred Event Types
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {EVENT_TYPE_OPTIONS.map((type) => (
                <label key={type} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.preferences.event_types.includes(type)}
                    onChange={() => handleArrayChange('event_types', type)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-800">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-3">
              Preferred Times
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {TIME_PREFERENCE_OPTIONS.map((time) => (
                <label key={time} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.preferences.time_preferences.includes(time)}
                    onChange={() => handleArrayChange('time_preferences', time)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-800">{time}</span>
                </label>
              ))}
            </div>
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
              {isEditing ? 'Update Host' : 'Create Host'}
            </>
          )}
        </button>
      </div>
    </form>
  )
}
