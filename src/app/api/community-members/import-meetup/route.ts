import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    console.log('Meetup CSV import request started')
    
    // Require authentication
    await requireAuth()
    console.log('Authentication passed')
    
    const supabase = createClient()
    
    // Get the uploaded file
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      console.log('No file uploaded')
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }
    
    console.log('File received:', file.name, 'Size:', file.size)
    
    // Read the file
    const fileText = await file.text()
    console.log('File text length:', fileText.length)
    
    const lines = fileText.split('\n').filter(line => line.trim())
    console.log('Number of lines:', lines.length)
    
    if (lines.length < 2) {
      console.log('Not enough lines in file')
      return NextResponse.json({ error: 'File must have at least a header and one data row' }, { status: 400 })
    }
    
    // Parse header row - handle both comma and tab separated
    const firstLine = lines[0]
    const isTabSeparated = firstLine.includes('\t')
    const separator = isTabSeparated ? '\t' : ','
    
    console.log('Separator detected:', separator)
    
    const headers = firstLine.split(separator).map(h => h.trim().toLowerCase().replace(/['"]/g, ''))
    console.log('Headers found:', headers)
    
    // Map headers to our database fields
    const headerMapping: Record<string, string> = {
      'name': 'name',
      'nom': 'name',
      'email': 'email',
      'courriel': 'email',
      'user id': 'user_id',
      'member id': 'member_id',
      'title': 'title',
      'titre': 'title',
      'location': 'city',
      'lieu': 'city',
      'url du profil de membre': 'meetup_url',
      'member profile url': 'meetup_url',
      'meetup profile url': 'meetup_url',
      'photo': 'photo',
      'presentation': 'bio',
      'bio': 'bio',
      'rejoindre le groupe le': 'join_date',
      'dernier groupe visité le': 'last_active'
    }
    
    // Find column indices
    const columnIndices: Record<string, number> = {}
    headers.forEach((header, index) => {
      const mappedColumn = headerMapping[header]
      if (mappedColumn) {
        columnIndices[mappedColumn] = index
      }
    })
    
    console.log('Column indices:', columnIndices)
    
    // Check if we have at least name or user_id
    const hasName = columnIndices.name !== undefined
    const hasUserId = columnIndices.user_id !== undefined
    const hasMemberId = columnIndices.member_id !== undefined
    
    if (!hasName && !hasUserId && !hasMemberId) {
      console.log('Missing required columns')
      return NextResponse.json({ 
        error: 'File must contain at least Name, User ID, or Member ID column',
        foundHeaders: headers
      }, { status: 400 })
    }
    
    // Parse data rows
    const members = []
    const errors = []
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(separator).map(v => v.trim().replace(/['"]/g, ''))
      
      try {
        // Extract name from various possible columns
        let name = ''
        if (columnIndices.name !== undefined) {
          name = values[columnIndices.name] || ''
        } else if (columnIndices.user_id !== undefined) {
          name = values[columnIndices.user_id] || ''
        } else if (columnIndices.member_id !== undefined) {
          name = values[columnIndices.member_id] || ''
        }
        
        // Generate email if not provided
        let email = ''
        if (columnIndices.email !== undefined) {
          email = values[columnIndices.email] || ''
        }
        
        if (!email && name) {
          // Generate a placeholder email
          const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '')
          email = `${cleanName}@meetup-member.local`
        }
        
        // Extract city from location
        let city = ''
        if (columnIndices.city !== undefined) {
          city = values[columnIndices.city] || ''
          // Extract just the city name from "Montréal, QC" format
          if (city.includes(',')) {
            city = city.split(',')[0].trim()
          }
        }
        
        // Extract meetup URL
        let meetup_url = ''
        if (columnIndices.meetup_url !== undefined) {
          meetup_url = values[columnIndices.meetup_url] || ''
        }
        
        // Extract bio from presentation
        let bio = ''
        if (columnIndices.bio !== undefined) {
          bio = values[columnIndices.bio] || ''
        }
        
        // Parse join date
        let join_date = new Date().toISOString()
        if (columnIndices.join_date !== undefined) {
          const joinDateStr = values[columnIndices.join_date]
          if (joinDateStr) {
            try {
              // Handle French date format like "6 juin 2024"
              const date = new Date(joinDateStr)
              if (!isNaN(date.getTime())) {
                join_date = date.toISOString()
              }
            } catch (e) {
              console.log('Could not parse join date:', joinDateStr)
            }
          }
        }
        
        const member: any = {
          name: name || 'Unknown Member',
          email: email || `member${i}@meetup.local`,
          phone: null,
          company: null,
          city: city || null,
          meetup_url: meetup_url || null,
          bio: bio || null,
          linkedin_url: null,
          twitter_url: null,
          github_url: null,
          website_url: null,
          interests: [],
          join_date: join_date,
          last_active: new Date().toISOString()
        }
        
        // Validate required fields
        if (!member.name) {
          errors.push(`Row ${i + 1}: Missing name`)
          continue
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(member.email)) {
          errors.push(`Row ${i + 1}: Invalid email format: ${member.email}`)
          continue
        }
        
        members.push(member)
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
    
    if (members.length === 0) {
      return NextResponse.json({ 
        error: 'No valid members found in file',
        details: errors 
      }, { status: 400 })
    }
    
    // Insert members into database
    console.log('Attempting to insert', members.length, 'members')
    console.log('Sample member:', members[0])
    
    const { data, error: insertError } = await supabase
      .from('community_members')
      .insert(members)
      .select()
    
    if (insertError) {
      console.error('Database insert error:', insertError)
      return NextResponse.json({ 
        error: 'Failed to import members to database',
        details: insertError.message,
        code: insertError.code
      }, { status: 500 })
    }
    
    console.log('Successfully inserted members:', data?.length)
    
    return NextResponse.json({
      success: true,
      imported: members.length,
      errors: errors.length > 0 ? errors : undefined,
      data: data
    })
    
  } catch (error) {
    console.error('CSV import error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
