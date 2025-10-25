import { NextRequest, NextResponse } from 'next/server'
import { createHost, updateHost } from '@/lib/database'
import type { Host } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Create host data
    const hostData: Omit<Host, 'id' | 'created_at' | 'updated_at'> = {
      name: body.name,
      email: body.email,
      phone: body.phone || null,
      company: body.company || null,
      venue_name: body.venue_name || null,
      venue_address: body.venue_address || null,
      capacity: body.capacity || null,
      amenities: body.amenities || [],
      preferences: body.preferences || {}
    }

    const host = await createHost(hostData)
    
    return NextResponse.json(host, { status: 201 })
  } catch (error) {
    console.error('Error creating host:', error)
    return NextResponse.json(
      { error: 'Failed to create host' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.id) {
      return NextResponse.json(
        { error: 'Host ID is required for updates' },
        { status: 400 }
      )
    }

    // Update host data
    const updateData: Partial<Host> = {
      name: body.name,
      email: body.email,
      phone: body.phone || null,
      company: body.company || null,
      venue_name: body.venue_name || null,
      venue_address: body.venue_address || null,
      capacity: body.capacity || null,
      amenities: body.amenities || [],
      preferences: body.preferences || {}
    }

    const host = await updateHost(body.id, updateData)
    
    return NextResponse.json(host, { status: 200 })
  } catch (error) {
    console.error('Error updating host:', error)
    return NextResponse.json(
      { error: 'Failed to update host' },
      { status: 500 }
    )
  }
}
