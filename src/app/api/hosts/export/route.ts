import { NextResponse } from 'next/server'
import { getHosts } from '@/lib/database'

export async function GET() {
  try {
    const hosts = await getHosts()
    
    // Create CSV headers
    const headers = [
      'ID',
      'Name',
      'Email',
      'Phone',
      'Company',
      'Venue Name',
      'Venue Address',
      'Capacity',
      'Amenities',
      'Tech Stack',
      'Event Types',
      'Time Preferences',
      'Created At',
      'Updated At'
    ]
    
    // Convert hosts data to CSV rows
    const csvRows = hosts.map(host => {
      const amenities = (host.amenities || []).join(', ')
      const eventTypes = (host.preferences?.event_types || []).join(', ')
      const timePreferences = (host.preferences?.time_preferences || []).join(', ')
      
      return [
        host.id,
        `"${host.name}"`,
        `"${host.email}"`,
        `"${host.phone || ''}"`,
        `"${host.company || ''}"`,
        `"${host.venue_name || ''}"`,
        `"${host.venue_address || ''}"`,
        host.capacity || 0,
        `"${amenities}"`,
        `"${host.preferences?.tech_stack || ''}"`,
        `"${eventTypes}"`,
        `"${timePreferences}"`,
        new Date(host.created_at).toISOString(),
        new Date(host.updated_at).toISOString()
      ]
    })
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n')
    
    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="hosts-export-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
  } catch (error) {
    console.error('CSV export error:', error)
    return NextResponse.json(
      { error: 'Failed to export hosts data' },
      { status: 500 }
    )
  }
}
