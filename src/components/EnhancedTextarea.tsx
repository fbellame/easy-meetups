'use client'

import { useState, useRef, useEffect } from 'react'
import { LinkIcon } from '@heroicons/react/24/outline'

interface EnhancedTextareaProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  minRows?: number
  className?: string
}

export default function EnhancedTextarea({
  id,
  label,
  value,
  onChange,
  placeholder = '',
  required = false,
  minRows = 12,
  className = ''
}: EnhancedTextareaProps) {
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [urls, setUrls] = useState<string[]>([])

  // Extract URLs from text
  useEffect(() => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const foundUrls = value.match(urlRegex) || []
    setUrls(foundUrls)
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  const insertUrl = (url: string) => {
    const textarea = textareaRef.current
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const text = value
      const before = text.substring(0, start)
      const after = text.substring(end)
      const newText = before + url + after
      onChange(newText)
      
      // Set cursor position after the inserted URL
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + url.length, start + url.length)
      }, 0)
    }
  }

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-800 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <textarea
          ref={textareaRef}
          id={id}
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          required={required}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-600 text-gray-900 text-sm leading-relaxed resize-y ${
            isFocused ? 'border-blue-500' : 'border-gray-300'
          }`}
          style={{
            minHeight: `${20 * minRows}px`,
            fontSize: '14px',
            lineHeight: '1.5'
          }}
        />
      </div>

      {/* URL Detection and Links */}
      {urls.length > 0 && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center mb-2">
            <LinkIcon className="h-4 w-4 text-blue-600 mr-1" />
            <span className="text-sm font-medium text-blue-800">Detected URLs ({urls.length}):</span>
          </div>
          <div className="space-y-2">
            {urls.map((url, index) => (
              <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 underline truncate flex-1 mr-2"
                >
                  {url}
                </a>
                <button
                  type="button"
                  onClick={() => insertUrl(url)}
                  className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-100 transition-colors whitespace-nowrap"
                >
                  Insert at cursor
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Character count */}
      <div className="mt-2 text-xs text-gray-500">
        {value.length} characters
      </div>
    </div>
  )
}
