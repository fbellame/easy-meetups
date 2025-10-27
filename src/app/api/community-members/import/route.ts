import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    console.log('CSV import request started')
    
    // Require authentication
    await requireAuth()
    console.log('Authentication passed')
    
    const supabase = await createClient()
    
    // Get the uploaded file
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      console.log('No file uploaded')
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }
    
    console.log('File received:', file.name, 'Size:', file.size)
    
    // Read the CSV file
    const csvText = await file.text()
    console.log('CSV text length:', csvText.length)
    const lines = csvText.split('\n').filter(line => line.trim())
    console.log('Number of lines:', lines.length)
    
    if (lines.length < 2) {
      console.log('Not enough lines in CSV')
      return NextResponse.json({ error: 'CSV file must have at least a header and one data row' }, { status: 400 })
    }
    
    // Parse header row
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''))
    console.log('Headers found:', headers)
    
    // Expected columns mapping
    const columnMapping: Record<string, string> = {
      'name': 'name',
      'email': 'email',
      'phone': 'phone',
      'company': 'company',
      'city': 'city',
      'meetup url': 'meetup_url',
      'meetup_url': 'meetup_url',
      'bio': 'bio',
      'linkedin': 'linkedin_url',
      'linkedin_url': 'linkedin_url',
      'twitter': 'twitter_url',
      'twitter_url': 'twitter_url',
      'github': 'github_url',
      'github_url': 'github_url',
      'website': 'website_url',
      'website_url': 'website_url',
      'interests': 'interests'
    }
    
    // Find column indices
    const columnIndices: Record<string, number> = {}
    headers.forEach((header, index) => {
      const mappedColumn = columnMapping[header]
      if (mappedColumn) {
        columnIndices[mappedColumn] = index
      }
    })
    console.log('Column indices:', columnIndices)
    
    if (columnIndices.name === undefined || columnIndices.email === undefined) {
      console.log('Missing required columns. Name index:', columnIndices.name, 'Email index:', columnIndices.email)
      return NextResponse.json({ 
        error: 'CSV must contain at least "Name" and "Email" columns',
        foundHeaders: headers
      }, { status: 400 })
    }
    
    // Parse data rows
    const members = []
    const errors = []
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/['"]/g, ''))
      
      try {
        const member: any = {
          name: values[columnIndices.name] || '',
          email: values[columnIndices.email] || '',
          phone: values[columnIndices.phone] || null,
          company: values[columnIndices.company] || null,
          city: values[columnIndices.city] || null,
          meetup_url: values[columnIndices.meetup_url] || null,
          bio: values[columnIndices.bio] || null,
          linkedin_url: values[columnIndices.linkedin_url] || null,
          twitter_url: values[columnIndices.twitter_url] || null,
          github_url: values[columnIndices.github_url] || null,
          website_url: values[columnIndices.website_url] || null,
          interests: values[columnIndices.interests] ? 
            values[columnIndices.interests].split(';').map((i: string) => i.trim()).filter((i: string) => i) : 
            [],
          join_date: new Date().toISOString(),
          last_active: new Date().toISOString()
        }
        
        // Validate required fields
        if (!member.name || !member.email) {
          errors.push(`Row ${i + 1}: Missing required fields (name or email)`)
          continue
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(member.email)) {
          errors.push(`Row ${i + 1}: Invalid email format`)
          continue
        }
        
        members.push(member)
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
    
    if (members.length === 0) {
      return NextResponse.json({ 
        error: 'No valid members found in CSV',
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
