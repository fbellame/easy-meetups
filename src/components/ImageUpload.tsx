'use client'

import { useState, useRef, useEffect } from 'react'
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline'
import ResponsiveImage from './ResponsiveImage'

interface ImageUploadProps {
  label: string
  value?: string
  onChange: (url: string) => void
  onRemove?: () => void
  className?: string
  accept?: string
  maxSize?: number // in MB
  aspectRatio?: 'video' | 'square' | 'portrait' | 'wide' | 'standard' | 'auto'
}

export default function ImageUpload({
  label,
  value,
  onChange,
  onRemove,
  className = '',
  accept = 'image/*',
  maxSize = 5,
  aspectRatio = 'video'
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Clear file input when value changes (e.g., when image is removed)
  useEffect(() => {
    if (!value && fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [value])

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`)
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    setIsUploading(true)
    setError('')

    try {
      // Store the old value to delete it later if upload succeeds
      const oldValue = value

      // Upload to our API route
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()
      onChange(result.url)
      setIsUploading(false)
      
      // Delete the old image if it exists and is from Supabase storage
      if (oldValue && oldValue.includes('supabase') && oldValue !== result.url) {
        try {
          await fetch('/api/upload', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: oldValue })
          })
        } catch (deleteError) {
          console.warn('Failed to delete old image:', deleteError)
        }
      }
      
      // Clear the file input so the same file can be uploaded again
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image')
      setIsUploading(false)
      
      // Clear the file input even on error
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemove = async () => {
    // Delete the image from storage if it's a Supabase URL
    if (value && value.includes('supabase')) {
      try {
        await fetch('/api/upload', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: value })
        })
      } catch (deleteError) {
        console.warn('Failed to delete image from storage:', deleteError)
      }
    }

    if (onRemove) {
      onRemove()
    } else {
      onChange('')
    }
    setError('')
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-800 mb-2">
        {label}
      </label>
      
      {value ? (
        <div className="relative">
          <ResponsiveImage
            src={value}
            alt="Uploaded"
            aspectRatio={aspectRatio}
            objectFit="cover"
            className="rounded-lg border border-gray-300"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={handleClick}
          className={`w-full ${aspectRatio === 'video' ? 'aspect-video' : aspectRatio === 'wide' ? 'aspect-[21/9]' : aspectRatio === 'square' ? 'aspect-square' : aspectRatio === 'portrait' ? 'aspect-[4/5]' : aspectRatio === 'standard' ? 'aspect-[4/3]' : aspectRatio === 'auto' ? 'aspect-video' : 'aspect-video'} border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors`}
        >
          {isUploading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          ) : (
            <div className="text-center">
              <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Click to upload image</p>
              <p className="text-xs text-gray-500 mt-1">Max size: {maxSize}MB</p>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
