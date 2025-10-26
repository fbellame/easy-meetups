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

    // Helper function to convert empty strings to undefined
    const undefinedIfEmpty = (value: any) => {
      if (value === '' || value === undefined) return undefined
      return value
    }

    // Helper function to parse date/time strings properly
    const parseDateTime = (dateStr: string | null): string | undefined => {
      if (!dateStr || dateStr === '') return undefined
      // If it's already a valid ISO string, return as is
      if (dateStr.includes('T') || dateStr.includes('Z')) return dateStr
      // If it's just a date, convert to ISO string
      return new Date(dateStr).toISOString()
    }

    // Helper function to parse required date/time strings
    const parseRequiredDateTime = (dateStr: string | null): string => {
      if (!dateStr || dateStr === '') throw new Error('Date is required')
      // If it's already a valid ISO string, return as is
      if (dateStr.includes('T') || dateStr.includes('Z')) return dateStr
      // If it's just a date, convert to ISO string
      return new Date(dateStr).toISOString()
    }

    // Create the event with proper data validation
    const eventData: Omit<Event, 'id' | 'created_at' | 'updated_at'> = {
      title: body.title,
      description: undefinedIfEmpty(body.description),
      host_id: undefinedIfEmpty(body.host_id),
      venue_name: undefinedIfEmpty(body.venue_name),
      venue_address: undefinedIfEmpty(body.venue_address),
      event_date: parseRequiredDateTime(body.event_date),
      start_time: undefinedIfEmpty(body.start_time),
      end_time: undefinedIfEmpty(body.end_time),
      max_capacity: body.max_capacity ? parseInt(body.max_capacity) : undefined,
      registration_deadline: parseDateTime(body.registration_deadline),
      status: body.status || 'planned',
      meetup_url: undefinedIfEmpty(body.meetup_url),
      luma_url: undefinedIfEmpty(body.luma_url),
      linkedin_url: undefinedIfEmpty(body.linkedin_url),
      event_image_url: undefinedIfEmpty(body.event_image_url),
      event_banner_url: undefinedIfEmpty(body.event_banner_url),
      host_email: undefinedIfEmpty(body.host_email)
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

    // Helper function to convert empty strings to undefined
    const undefinedIfEmpty = (value: any) => {
      if (value === '' || value === undefined) return undefined
      return value
    }

    // Helper function to parse date/time strings properly
    const parseDateTime = (dateStr: string | null): string | undefined => {
      if (!dateStr || dateStr === '') return undefined
      // If it's already a valid ISO string, return as is
      if (dateStr.includes('T') || dateStr.includes('Z')) return dateStr
      // If it's just a date, convert to ISO string
      return new Date(dateStr).toISOString()
    }

    // Helper function to parse required date/time strings
    const parseRequiredDateTime = (dateStr: string | null): string => {
      if (!dateStr || dateStr === '') throw new Error('Date is required')
      // If it's already a valid ISO string, return as is
      if (dateStr.includes('T') || dateStr.includes('Z')) return dateStr
      // If it's just a date, convert to ISO string
      return new Date(dateStr).toISOString()
    }

    // Update the event with proper data validation
    const updateData: Partial<Event> = {
      title: body.title,
      description: undefinedIfEmpty(body.description),
      host_id: undefinedIfEmpty(body.host_id),
      venue_name: undefinedIfEmpty(body.venue_name),
      venue_address: undefinedIfEmpty(body.venue_address),
      event_date: parseRequiredDateTime(body.event_date),
      start_time: undefinedIfEmpty(body.start_time),
      end_time: undefinedIfEmpty(body.end_time),
      max_capacity: body.max_capacity ? parseInt(body.max_capacity) : undefined,
      registration_deadline: parseDateTime(body.registration_deadline),
      status: body.status || 'planned',
      meetup_url: undefinedIfEmpty(body.meetup_url),
      luma_url: undefinedIfEmpty(body.luma_url),
      linkedin_url: undefinedIfEmpty(body.linkedin_url),
      event_image_url: undefinedIfEmpty(body.event_image_url),
      event_banner_url: undefinedIfEmpty(body.event_banner_url),
      host_email: undefinedIfEmpty(body.host_email)
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
