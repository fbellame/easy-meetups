import { NextResponse } from 'next/server'
import { getSpeakers } from '@/lib/database'

export async function GET() {
  try {
    const speakers = await getSpeakers()
    
    // Create CSV headers
    const headers = [
      'Name',
      'Email', 
      'Bio',
      'Expertise',
      'LinkedIn',
      'GitHub',
      'Twitter',
      'Website',
      'Profile Photo URL',
      'Created At',
      'Updated At'
    ]
    
    // Convert speakers data to CSV rows
    const csvRows = speakers.map(speaker => [
      speaker.name || '',
      speaker.email || '',
      speaker.bio || '',
      speaker.expertise ? speaker.expertise.join('; ') : '',
      speaker.social_links?.linkedin || '',
      speaker.social_links?.github || '',
      speaker.social_links?.twitter || '',
      speaker.social_links?.website || '',
      speaker.profile_photo_url || '',
      speaker.created_at || '',
      speaker.updated_at || ''
    ])
    
    // Escape CSV values (handle commas, quotes, newlines)
    const escapeCsvValue = (value: string) => {
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    }
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => row.map(escapeCsvValue).join(','))
    ].join('\n')
    
    // Generate filename with current date
    const now = new Date()
    const dateStr = now.toISOString().split('T')[0] // YYYY-MM-DD format
    const filename = `speakers-export-${dateStr}.csv`
    
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error exporting speakers:', error)
    return NextResponse.json(
      { error: 'Failed to export speakers' },
      { status: 500 }
    )
  }
}
