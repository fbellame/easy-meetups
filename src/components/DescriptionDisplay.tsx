'use client'

import { useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon, LinkIcon } from '@heroicons/react/24/outline'

interface DescriptionDisplayProps {
  description: string
  className?: string
  maxLength?: number
}

export default function DescriptionDisplay({
  description,
  className = '',
  maxLength = 200
}: DescriptionDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Extract URLs from description
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const urls = description.match(urlRegex) || []
  
  // Replace URLs with clickable links
  const formatDescription = (text: string) => {
    return text.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">${url}</a>`
    })
  }

  const shouldTruncate = description.length > maxLength
  const displayText = isExpanded || !shouldTruncate 
    ? description 
    : description.substring(0, maxLength) + '...'

  const formattedText = formatDescription(displayText)

  return (
    <div className={className}>
      <div 
        className="text-gray-600 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: formattedText }}
      />
      
      {/* URL List */}
      {urls.length > 0 && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center mb-2">
            <LinkIcon className="h-4 w-4 text-blue-600 mr-1" />
            <span className="text-sm font-medium text-blue-800">Links in this event:</span>
          </div>
          <div className="space-y-1">
            {urls.map((url, index) => (
              <a
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-blue-600 hover:text-blue-800 underline truncate"
              >
                {url}
              </a>
            ))}
          </div>
        </div>
      )}
      
      {/* Expand/Collapse Button */}
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          {isExpanded ? (
            <>
              <ChevronUpIcon className="h-4 w-4 mr-1" />
              Show less
            </>
          ) : (
            <>
              <ChevronDownIcon className="h-4 w-4 mr-1" />
              Show more
            </>
          )}
        </button>
      )}
    </div>
  )
}
