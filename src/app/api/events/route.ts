import { NextRequest, NextResponse } from 'next/server'
import { createEvent, getEvents, updateEvent, deleteEvent } from '@/lib/database'
import type { Event } from '@/types/database'

export async function GET() {
  try {
    const events = await getEvents()
    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.title || !body.event_date) {
      return NextResponse.json(
        { error: 'Title and event date are required' },
        { status: 400 }
      )
    }

    // Create the event
    const eventData: Omit<Event, 'id' | 'created_at' | 'updated_at'> = {
      title: body.title,
      description: body.description || null,
      host_id: body.host_id || null,
      venue_name: body.venue_name || null,
      venue_address: body.venue_address || null,
      event_date: body.event_date,
      start_time: body.start_time || null,
      end_time: body.end_time || null,
      max_capacity: body.max_capacity || null,
      registration_deadline: body.registration_deadline || null,
      status: body.status || 'planned',
      meetup_url: body.meetup_url || null,
      luma_url: body.luma_url || null,
      linkedin_url: body.linkedin_url || null
    }

    const event = await createEvent(eventData)
    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }

    // Update the event
    const updateData: Partial<Event> = {
      title: body.title,
      description: body.description,
      host_id: body.host_id,
      venue_name: body.venue_name,
      venue_address: body.venue_address,
      event_date: body.event_date,
      start_time: body.start_time,
      end_time: body.end_time,
      max_capacity: body.max_capacity,
      registration_deadline: body.registration_deadline,
      status: body.status,
      meetup_url: body.meetup_url,
      luma_url: body.luma_url,
      linkedin_url: body.linkedin_url
    }

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof Event] === undefined) {
        delete updateData[key as keyof Event]
      }
    })

    const event = await updateEvent(body.id, updateData)
    return NextResponse.json(event)
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }

    await deleteEvent(id)
    return NextResponse.json({ message: 'Event deleted successfully' })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    )
  }
}
