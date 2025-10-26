import { NextRequest, NextResponse } from 'next/server'
import { createCommunityMember, getCommunityMembers, updateCommunityMember, deleteCommunityMember } from '@/lib/database'
import type { CommunityMember } from '@/types/database'

export async function GET() {
  try {
    const members = await getCommunityMembers()
    return NextResponse.json(members)
  } catch (error) {
    console.error('Error fetching community members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch community members' },
      { status: 500 }
    )
  }
}

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

    // Create community member data
    const memberData: Omit<CommunityMember, 'id' | 'created_at' | 'updated_at'> = {
      name: body.name,
      email: body.email,
      phone: body.phone || null,
      company: body.company || null,
      interests: body.interests || [],
      join_date: body.join_date || new Date().toISOString(),
      last_active: body.last_active || null
    }

    const member = await createCommunityMember(memberData)
    
    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    console.error('Error creating community member:', error)
    return NextResponse.json(
      { error: 'Failed to create community member' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.id) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      )
    }

    const member = await updateCommunityMember(body.id, body)
    
    return NextResponse.json(member)
  } catch (error) {
    console.error('Error updating community member:', error)
    return NextResponse.json(
      { error: 'Failed to update community member' },
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
        { error: 'Member ID is required' },
        { status: 400 }
      )
    }

    await deleteCommunityMember(id)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting community member:', error)
    return NextResponse.json(
      { error: 'Failed to delete community member' },
      { status: 500 }
    )
  }
}
