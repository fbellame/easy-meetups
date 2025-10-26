import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    console.log('Simple CSV import request started')
    
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
    console.log('First 500 characters:', csvText.substring(0, 500))
    
    const lines = csvText.split('\n').filter(line => line.trim())
    console.log('Number of lines:', lines.length)
    
    if (lines.length < 2) {
      console.log('Not enough lines in CSV')
      return NextResponse.json({ error: 'CSV file must have at least a header and one data row' }, { status: 400 })
    }
    
    // Parse header row
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''))
    console.log('Headers found:', headers)
    
    // Find column indices - be flexible with column names
    const columnIndices: Record<string, number> = {}
    
    headers.forEach((header, index) => {
      const cleanHeader = header.toLowerCase().trim()
      
      // Map various possible header names
      if (cleanHeader === 'name') {
        columnIndices.name = index
      } else if (cleanHeader === 'email') {
        columnIndices.email = index
      } else if (cleanHeader === 'phone') {
        columnIndices.phone = index
      } else if (cleanHeader === 'company') {
        columnIndices.company = index
      } else if (cleanHeader === 'city') {
        columnIndices.city = index
      } else if (cleanHeader === 'meetup url' || cleanHeader === 'meetup_url') {
        columnIndices.meetup_url = index
      } else if (cleanHeader === 'bio') {
        columnIndices.bio = index
      } else if (cleanHeader === 'linkedin' || cleanHeader === 'linkedin_url') {
        columnIndices.linkedin_url = index
      } else if (cleanHeader === 'twitter' || cleanHeader === 'twitter_url') {
        columnIndices.twitter_url = index
      } else if (cleanHeader === 'github' || cleanHeader === 'github_url') {
        columnIndices.github_url = index
      } else if (cleanHeader === 'website' || cleanHeader === 'website_url') {
        columnIndices.website_url = index
      } else if (cleanHeader === 'interests') {
        columnIndices.interests = index
      }
    })
    
    console.log('Column indices:', columnIndices)
    
    // Check if we have at least name
    if (columnIndices.name === undefined) {
      console.log('Missing name column')
      return NextResponse.json({ 
        error: 'CSV must contain a "Name" column',
        foundHeaders: headers
      }, { status: 400 })
    }
    
    // Parse data rows
    const members = []
    const errors = []
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      if (!line.trim()) continue
      
      try {
        // Parse CSV line properly (handle quoted values)
        const values = parseCSVLine(line)
        console.log(`Row ${i + 1} values:`, values)
        
        // Extract name
        const name = values[columnIndices.name] || ''
        if (!name.trim()) {
          errors.push(`Row ${i + 1}: Missing name`)
          continue
        }
        
        // Extract email or generate one
        let email = ''
        if (columnIndices.email !== undefined) {
          email = values[columnIndices.email] || ''
        }
        
        if (!email.trim()) {
          // Generate email from name
          const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '')
          email = `${cleanName}@meetup-member.local`
        }
        
        // Extract other fields
        const phone = columnIndices.phone !== undefined ? values[columnIndices.phone] || null : null
        const company = columnIndices.company !== undefined ? values[columnIndices.company] || null : null
        const city = columnIndices.city !== undefined ? values[columnIndices.city] || null : null
        const meetup_url = columnIndices.meetup_url !== undefined ? values[columnIndices.meetup_url] || null : null
        const bio = columnIndices.bio !== undefined ? values[columnIndices.bio] || null : null
        const linkedin_url = columnIndices.linkedin_url !== undefined ? values[columnIndices.linkedin_url] || null : null
        const twitter_url = columnIndices.twitter_url !== undefined ? values[columnIndices.twitter_url] || null : null
        const github_url = columnIndices.github_url !== undefined ? values[columnIndices.github_url] || null : null
        const website_url = columnIndices.website_url !== undefined ? values[columnIndices.website_url] || null : null
        
        // Parse interests
        let interests = []
        if (columnIndices.interests !== undefined) {
          const interestsStr = values[columnIndices.interests] || ''
          if (interestsStr.trim()) {
            interests = interestsStr.split(';').map(i => i.trim()).filter(i => i)
          }
        }
        
        const member: any = {
          name: name.trim(),
          email: email.trim(),
          phone: phone,
          company: company,
          city: city,
          meetup_url: meetup_url,
          bio: bio,
          linkedin_url: linkedin_url,
          twitter_url: twitter_url,
          github_url: github_url,
          website_url: website_url,
          interests: interests,
          join_date: new Date().toISOString(),
          last_active: new Date().toISOString()
        }
        
        console.log(`Member ${i + 1}:`, member)
        members.push(member)
      } catch (error) {
        console.error(`Error parsing row ${i + 1}:`, error)
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
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

// Helper function to parse CSV line properly (handle quoted values)
function parseCSVLine(line: string): string[] {
  const result = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current.trim())
  return result
}
