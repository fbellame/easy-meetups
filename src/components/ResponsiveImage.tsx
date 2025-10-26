'use client'

import { useState, useEffect } from 'react'

interface ResponsiveImageProps {
  src: string
  alt: string
  className?: string
  aspectRatio?: 'video' | 'square' | 'portrait' | 'wide' | 'standard' | 'auto'
  objectFit?: 'cover' | 'contain' | 'fill'
  fallback?: React.ReactNode
}

export default function ResponsiveImage({
  src,
  alt,
  className = '',
  aspectRatio = 'video',
  objectFit = 'cover',
  fallback
}: ResponsiveImageProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [naturalAspectRatio, setNaturalAspectRatio] = useState<number | null>(null)

  const aspectRatioClasses = {
    video: 'aspect-video',
    square: 'aspect-square',
    portrait: 'aspect-[4/5]',
    wide: 'aspect-[21/9]',
    standard: 'aspect-[4/3]',
    auto: ''
  }

  const objectFitClasses = {
    cover: 'object-cover',
    contain: 'object-contain',
    fill: 'object-fill'
  }

  // Handle image load to get natural dimensions
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    const aspectRatio = img.naturalWidth / img.naturalHeight
    setNaturalAspectRatio(aspectRatio)
    setImageLoaded(true)
  }

  // Determine the container style based on aspect ratio
  const getContainerStyle = () => {
    if (aspectRatio === 'auto' && naturalAspectRatio) {
      return {
        aspectRatio: naturalAspectRatio.toString()
      }
    }
    return {}
  }

  // Determine the image object fit
  const getObjectFit = () => {
    if (aspectRatio === 'auto') {
      return 'contain' // Use contain for auto to prevent clipping
    }
    return objectFit
  }

  if (imageError && fallback) {
    return <>{fallback}</>
  }

  return (
    <div 
      className={`relative w-full ${aspectRatioClasses[aspectRatio]} overflow-hidden ${className}`}
      style={getContainerStyle()}
    >
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`absolute inset-0 w-full h-full ${objectFitClasses[getObjectFit()]} transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={handleImageLoad}
        onError={() => setImageError(true)}
      />
    </div>
  )
}
