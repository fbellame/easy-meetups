import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event_id, speaker_ids } = body
    
    if (!event_id || !speaker_ids || !Array.isArray(speaker_ids)) {
      return NextResponse.json(
        { error: 'Event ID and speaker IDs array are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // First, remove existing speaker assignments for this event
    await supabase
      .from('event_speakers')
      .delete()
      .eq('event_id', event_id)

    // Then, add new speaker assignments
    const eventSpeakers = speaker_ids.map((speaker_id: string, index: number) => ({
      event_id,
      speaker_id,
      speaking_order: index + 1
    }))

    const { data, error } = await supabase
      .from('event_speakers')
      .insert(eventSpeakers)
      .select()

    if (error) throw error

    return NextResponse.json({ message: 'Speakers assigned successfully', data })
  } catch (error) {
    console.error('Error assigning speakers to event:', error)
    return NextResponse.json(
      { error: 'Failed to assign speakers to event' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const event_id = searchParams.get('event_id')
    
    if (!event_id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }

    // Use the database function instead of direct Supabase query
    const { getEventSpeakers } = await import('@/lib/database')
    const data = await getEventSpeakers(event_id)

    // Debug: Log the raw data
    console.log('Event speakers API raw data:', data)

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error fetching event speakers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch event speakers' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const event_id = searchParams.get('event_id')
    const speaker_id = searchParams.get('speaker_id')
    
    if (!event_id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    let query = supabase
      .from('event_speakers')
      .delete()
      .eq('event_id', event_id)

    if (speaker_id) {
      query = query.eq('speaker_id', speaker_id)
    }

    const { error } = await query

    if (error) throw error

    return NextResponse.json({ message: 'Speaker assignment removed successfully' })
  } catch (error) {
    console.error('Error removing speaker assignment:', error)
    return NextResponse.json(
      { error: 'Failed to remove speaker assignment' },
      { status: 500 }
    )
  }
}
