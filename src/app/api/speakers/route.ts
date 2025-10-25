import { NextRequest, NextResponse } from 'next/server'
import { createSpeaker, updateSpeaker } from '@/lib/database'
import type { Speaker } from '@/types/database'

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

    // Create speaker data
    const speakerData: Omit<Speaker, 'id' | 'created_at' | 'updated_at'> = {
      name: body.name,
      email: body.email,
      bio: body.bio || null,
      expertise: body.expertise || [],
      social_links: body.social_links || {},
      availability: body.availability || {}
    }

    const speaker = await createSpeaker(speakerData)
    
    return NextResponse.json(speaker, { status: 201 })
  } catch (error) {
    console.error('Error creating speaker:', error)
    return NextResponse.json(
      { error: 'Failed to create speaker' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.id) {
      return NextResponse.json(
        { error: 'Speaker ID is required for updates' },
        { status: 400 }
      )
    }

    // Update speaker data
    const updateData: Partial<Speaker> = {
      name: body.name,
      email: body.email,
      bio: body.bio || null,
      expertise: body.expertise || [],
      social_links: body.social_links || {},
      availability: body.availability || {}
    }

    const speaker = await updateSpeaker(body.id, updateData)
    
    return NextResponse.json(speaker, { status: 200 })
  } catch (error) {
    console.error('Error updating speaker:', error)
    return NextResponse.json(
      { error: 'Failed to update speaker' },
      { status: 500 }
    )
  }
}
