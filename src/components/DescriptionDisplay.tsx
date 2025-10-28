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

  const escapeHtml = (unsafe: string) =>
    unsafe
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;')

  const linkify = (text: string) =>
    text.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">${url}</a>`
    })

  // Convert zero-width and paragraph separators into newlines, then build simple HTML
  const normalizeBreaks = (text: string) => {
    return text
      .replace(/[\r]/g, '')
      .replace(/[\u200B-\u200F\u2028\u2029\u2060]/g, '\n')
  }

  const formatWithLineBreaksAndBullets = (raw: string) => {
    const normalized = normalizeBreaks(raw)
    const lines = normalized.split('\n')

    const htmlParts: string[] = []
    let collectingList = false
    let listItems: string[] = []
    let currentParagraph: string[] = []

    const flushList = () => {
      if (collectingList && listItems.length > 0) {
        htmlParts.push(`<ul class="list-disc pl-6 space-y-1 text-sm">${listItems.join('')}</ul>`) 
      }
      collectingList = false
      listItems = []
    }

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        const content = linkify(escapeHtml(currentParagraph.join(' ')))
        htmlParts.push(`<p class="text-sm">${content}</p>`)
        currentParagraph = []
      }
    }

    const bulletRegex = /^\s*(?:[-–—•\*]|\d+\.)\s+(.+)/
    const titleRegex = /^[✨🎤🎯📅📍👥🎉💡🔥⭐]+.*[A-Za-z].*$/

    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.length === 0) {
        // Empty line - flush current paragraph and add paragraph break
        flushParagraph()
        flushList()
        continue
      }

      const bulletMatch = trimmed.match(bulletRegex)
      if (bulletMatch) {
        // Flush current paragraph before starting list
        flushParagraph()
        flushList()
        
        if (!collectingList) collectingList = true
        const content = linkify(escapeHtml(bulletMatch[1]))
        listItems.push(`<li class="text-sm">${content}</li>`) 
      } else if (titleRegex.test(trimmed)) {
        // Title with emoji - flush current paragraph and make it bold
        flushParagraph()
        flushList()
        const content = linkify(escapeHtml(trimmed))
        htmlParts.push(`<h3 class="font-bold text-sm mb-2">${content}</h3>`)
      } else {
        // Regular text - add to current paragraph
        flushList()
        currentParagraph.push(trimmed)
      }
    }

    // Flush any remaining content
    flushParagraph()
    flushList()

    return htmlParts.join('')
  }

  const shouldTruncate = description.length > maxLength
  const displayText = isExpanded || !shouldTruncate 
    ? description 
    : description.substring(0, maxLength) + '...'

  const formattedText = formatWithLineBreaksAndBullets(displayText)

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
