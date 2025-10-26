'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ImageUpload from './ImageUpload'
import { 
  UserIcon, 
  EnvelopeIcon, 
  MicrophoneIcon,
  TagIcon,
  LinkIcon,
  CalendarIcon,
  CheckIcon
} from '@heroicons/react/24/outline'

interface SpeakerFormData {
  name: string
  email: string
  bio: string
  profile_photo_url: string
  expertise: string[]
  social_links: {
    linkedin: string
    twitter: string
    github: string
    website: string
  }
  availability: {
    time_preferences: string[]
    travel_willingness: string
    virtual_events: boolean
  }
}

interface SpeakerFormProps {
  initialData?: Partial<SpeakerFormData> & { id?: string } | any
  isEditing?: boolean
}

const EXPERTISE_OPTIONS = [
  'Python',
  'Machine Learning',
  'Deep Learning',
  'Natural Language Processing',
  'Computer Vision',
  'Large Language Models (LLMs)',
  'Generative AI',
  'ChatGPT',
  'OpenAI API',
  'LangChain',
  'LangGraph',
  'AI Agents',
  'Prompt Engineering',
  'Data Science',
  'TensorFlow',
  'PyTorch',
  'Vector Databases',
  'RAG (Retrieval Augmented Generation)',
  'Product Management',
  'Marketing',
  'Sales',
  'Startup Experience',
  'CTO',
  'Technical Leadership',
  'AI Strategy',
  'Entrepreneurship',
  'AI Ethics',
  'Other'
]

const TIME_PREFERENCE_OPTIONS = [
  'Weekday Mornings',
  'Weekday Afternoons',
  'Weekday Evenings',
  'Weekend Mornings',
  'Weekend Afternoons',
  'Weekend Evenings'
]

const TRAVEL_OPTIONS = [
  'Local only',
  'Regional (within 100 miles)',
  'National (within country)',
  'International',
  'Virtual only'
]

export default function SpeakerForm({ initialData, isEditing = false }: SpeakerFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [formData, setFormData] = useState<SpeakerFormData>({
    name: initialData?.name || '',
    email: initialData?.email || '',
    bio: initialData?.bio || '',
    profile_photo_url: initialData?.profile_photo_url || '',
    expertise: initialData?.expertise || [],
    social_links: {
      linkedin: initialData?.social_links?.linkedin || '',
      twitter: initialData?.social_links?.twitter || '',
      github: initialData?.social_links?.github || '',
      website: initialData?.social_links?.website || ''
    },
    availability: {
      time_preferences: initialData?.availability?.time_preferences || [],
      travel_willingness: initialData?.availability?.travel_willingness || 'Local only',
      virtual_events: initialData?.availability?.virtual_events || false
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

  const handleInputChange = (field: keyof SpeakerFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePhotoChange = (url: string) => {
    setFormData(prev => ({
      ...prev,
      profile_photo_url: url
    }))
  }

  const handleSocialLinkChange = (platform: keyof SpeakerFormData['social_links'], value: string) => {
    setFormData(prev => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value
      }
    }))
  }

  const handleAvailabilityChange = (field: keyof SpeakerFormData['availability'], value: string | string[] | boolean) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [field]: value
      }
    }))
  }

  const handleExpertiseChange = (expertise: string) => {
    setFormData(prev => ({
      ...prev,
      expertise: prev.expertise.includes(expertise)
        ? prev.expertise.filter(item => item !== expertise)
        : [...prev.expertise, expertise]
    }))
  }

  const handleTimePreferenceChange = (time: string) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        time_preferences: prev.availability.time_preferences.includes(time)
          ? prev.availability.time_preferences.filter(item => item !== time)
          : [...prev.availability.time_preferences, time]
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/speakers', {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...(isEditing && initialData ? { id: initialData.id } : {}),
          ...formData,
          social_links: formData.social_links,
          availability: formData.availability
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save speaker')
      }

      router.push('/speakers')
      router.refresh()
    } catch (error) {
      console.error('Error saving speaker:', error)
      alert('Failed to save speaker. Please try again.')
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
          <p className="text-yellow-700 mb-4">You need to be signed in to create or edit speakers.</p>
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
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-600 text-gray-900"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-800 mb-2">
              <EnvelopeIcon className="h-4 w-4 inline mr-1" />
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              required
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-600 text-gray-900"
              placeholder="Enter your email address"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="bio" className="block text-sm font-medium text-gray-800 mb-2">
              <MicrophoneIcon className="h-4 w-4 inline mr-1" />
              Bio
            </label>
            <textarea
              id="bio"
              rows={4}
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-600 text-gray-900"
              placeholder="Tell us about yourself, your background, and speaking experience..."
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

      {/* Expertise */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Expertise & Skills</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {EXPERTISE_OPTIONS.map((skill) => (
            <label key={skill} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.expertise.includes(skill)}
                onChange={() => handleExpertiseChange(skill)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-800">{skill}</span>
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
              Personal Website
            </label>
            <input
              type="url"
              id="website"
              value={formData.social_links.website}
              onChange={(e) => handleSocialLinkChange('website', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-600 text-gray-900"
              placeholder="https://yourwebsite.com"
            />
          </div>
        </div>
      </div>

      {/* Availability */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Availability & Preferences</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-3">
              <CalendarIcon className="h-4 w-4 inline mr-1" />
              Preferred Speaking Times
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {TIME_PREFERENCE_OPTIONS.map((time) => (
                <label key={time} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.availability.time_preferences.includes(time)}
                    onChange={() => handleTimePreferenceChange(time)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-800">{time}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="travel_willingness" className="block text-sm font-medium text-gray-800 mb-2">
              Travel Willingness
            </label>
            <select
              id="travel_willingness"
              value={formData.availability.travel_willingness}
              onChange={(e) => handleAvailabilityChange('travel_willingness', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {TRAVEL_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.availability.virtual_events}
                onChange={(e) => handleAvailabilityChange('virtual_events', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-800">Available for virtual events</span>
            </label>
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
              {isEditing ? 'Update Speaker' : 'Create Speaker'}
            </>
          )}
        </button>
      </div>
    </form>
  )
}
