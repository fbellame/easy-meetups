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
    
    // Map headers to database fields
    const headerMapping: Record<string, string> = {
      'name': 'name',
      'user id': 'meetup_user_id',
      'title': 'title',
      'member id': 'meetup_member_id',
      'location': 'city',
      'rejoindre le groupe le': 'join_date',
      'dernier groupe visité le': 'last_active',
      'last attended': 'last_attended',
      'total des réponses': 'total_responses',
      'répondu oui': 'responded_yes',
      'répondu peut-être': 'responded_maybe',
      'répondu non': 'responded_no',
      'meetups attended': 'meetups_attended',
      'absences': 'absences',
      'présentation': 'bio',
      'photo': 'has_photo',
      'assistant organizer': 'is_assistant_organizer',
      'liste de diffusion': 'is_on_mailing_list',
      'url du profil de membre': 'meetup_url'
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
        
        // Extract name
        const name = values[columnIndices.name] || ''
        if (!name.trim()) {
          errors.push(`Row ${i + 1}: Missing name`)
          continue
        }
        
        // Generate email if not provided
        const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '')
        const email = `${cleanName}@meetup-member.local`
        
        // Extract city from location
        let city = ''
        if (columnIndices.city !== undefined) {
          city = values[columnIndices.city] || ''
          // Remove quotes and extract city from "Montréal, QC" format
          city = city.replace(/['"]/g, '')
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
              const date = parseFrenchDate(joinDateStr)
              if (date) {
                join_date = date.toISOString()
              }
            } catch (e) {
              console.log('Could not parse join date:', joinDateStr)
            }
          }
        }
        
        // Parse last active date
        let last_active = new Date().toISOString()
        if (columnIndices.last_active !== undefined) {
          const lastActiveStr = values[columnIndices.last_active]
          if (lastActiveStr) {
            try {
              const date = parseFrenchDate(lastActiveStr)
              if (date) {
                last_active = date.toISOString()
              }
            } catch (e) {
              console.log('Could not parse last active date:', lastActiveStr)
            }
          }
        }
        
        // Extract numeric values
        const total_responses = parseInt(values[columnIndices.total_responses] || '0') || 0
        const responded_yes = parseInt(values[columnIndices.responded_yes] || '0') || 0
        const responded_maybe = parseInt(values[columnIndices.responded_maybe] || '0') || 0
        const responded_no = parseInt(values[columnIndices.responded_no] || '0') || 0
        const meetups_attended = parseInt(values[columnIndices.meetups_attended] || '0') || 0
        const absences = parseInt(values[columnIndices.absences] || '0') || 0
        
        // Extract boolean values
        const has_photo = (values[columnIndices.has_photo] || '').toLowerCase() === 'yes'
        const is_assistant_organizer = (values[columnIndices.is_assistant_organizer] || '').toLowerCase() === 'yes'
        const is_on_mailing_list = (values[columnIndices.is_on_mailing_list] || '').toLowerCase() === 'yes'
        
        const member: any = {
          name: name.trim(),
          email: email,
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
          last_active: last_active,
          meetup_user_id: values[columnIndices.meetup_user_id] || null,
          meetup_member_id: values[columnIndices.meetup_member_id] || null,
          title: values[columnIndices.title] || null,
          total_responses: total_responses,
          responded_yes: responded_yes,
          responded_maybe: responded_maybe,
          responded_no: responded_no,
          meetups_attended: meetups_attended,
          absences: absences,
          has_photo: has_photo,
          is_assistant_organizer: is_assistant_organizer,
          is_on_mailing_list: is_on_mailing_list
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

// Helper function to parse French dates
function parseFrenchDate(dateStr: string): Date | null {
  if (!dateStr) return null
  
  // French month names
  const frenchMonths: Record<string, number> = {
    'janvier': 0, 'février': 1, 'mars': 2, 'avril': 3, 'mai': 4, 'juin': 5,
    'juillet': 6, 'août': 7, 'septembre': 8, 'octobre': 9, 'novembre': 10, 'décembre': 11
  }
  
  try {
    // Handle format like "6 juin 2024"
    const parts = dateStr.trim().split(' ')
    if (parts.length === 3) {
      const day = parseInt(parts[0])
      const monthName = parts[1].toLowerCase()
      const year = parseInt(parts[2])
      
      if (frenchMonths[monthName] !== undefined) {
        return new Date(year, frenchMonths[monthName], day)
      }
    }
    
    // Fallback to regular date parsing
    return new Date(dateStr)
  } catch (e) {
    return null
  }
}
