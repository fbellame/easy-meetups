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
      'url du profil de membre': 'meetup_url',
      // Enhanced mappings for the fields from the image
      'joined group on': 'join_date',
      'last visited group on': 'last_active',
      'all time rsvps': 'total_responses',
      'all time \'yes\' rsvps': 'responded_yes',
      'all time \'no\' rsvps': 'responded_no',
      'all time yes rsvps': 'responded_yes',
      'all time no rsvps': 'responded_no',
      'events attended': 'meetups_attended',
      // Additional variations and common formats
      'joined group': 'join_date',
      'join date': 'join_date',
      'member since': 'join_date',
      'last visit': 'last_active',
      'last activity': 'last_active',
      'last seen': 'last_active',
      'total rsvps': 'total_responses',
      'rsvps total': 'total_responses',
      'yes rsvps': 'responded_yes',
      'no rsvps': 'responded_no',
      'maybe rsvps': 'responded_maybe',
      'attended events': 'meetups_attended',
      'events participated': 'meetups_attended',
      'meetups participated': 'meetups_attended'
    }
    
    // Find column indices
    const columnIndices: Record<string, number> = {}
    headers.forEach((header, index) => {
      const mappedColumn = headerMapping[header]
      if (mappedColumn) {
        columnIndices[mappedColumn] = index
        console.log(`Mapped column "${header}" (index ${index}) -> ${mappedColumn}`)
      } else {
        console.log(`Unmapped column: "${header}" (index ${index})`)
      }
    })
    
    console.log('Final column indices:', columnIndices)
    
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
          if (joinDateStr && joinDateStr.trim()) {
            try {
              console.log('Parsing join date:', joinDateStr)
              const date = parseFrenchDate(joinDateStr)
              if (date) {
                join_date = date.toISOString()
                console.log('Successfully parsed join date:', join_date)
              } else {
                console.log('Failed to parse join date, using current date')
              }
            } catch (e) {
              console.log('Could not parse join date:', joinDateStr, 'Error:', e)
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
        
        // Parse last attended date
        let last_attended = null
        if (columnIndices.last_attended !== undefined) {
          const lastAttendedStr = values[columnIndices.last_attended]
          if (lastAttendedStr && lastAttendedStr.trim()) {
            try {
              const date = parseFrenchDate(lastAttendedStr)
              if (date) {
                last_attended = date.toISOString()
              }
            } catch (e) {
              console.log('Could not parse last attended date:', lastAttendedStr)
            }
          }
        }
        
        // Extract numeric values with better parsing
        const total_responses = parseNumericValue(values[columnIndices.total_responses], 'total_responses')
        const responded_yes = parseNumericValue(values[columnIndices.responded_yes], 'responded_yes')
        const responded_maybe = parseNumericValue(values[columnIndices.responded_maybe], 'responded_maybe')
        const responded_no = parseNumericValue(values[columnIndices.responded_no], 'responded_no')
        const meetups_attended = parseNumericValue(values[columnIndices.meetups_attended], 'meetups_attended')
        const absences = parseNumericValue(values[columnIndices.absences], 'absences')
        
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
          last_attended: last_attended,
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

// Helper function to parse numeric values with better error handling
function parseNumericValue(value: string | undefined, fieldName: string): number {
  if (!value || value.trim() === '') {
    return 0
  }
  
  try {
    // Remove any non-numeric characters except minus sign
    const cleanValue = value.trim().replace(/[^\d-]/g, '')
    const parsed = parseInt(cleanValue)
    
    if (isNaN(parsed)) {
      console.log(`Could not parse ${fieldName}: "${value}", using 0`)
      return 0
    }
    
    console.log(`Parsed ${fieldName}: "${value}" -> ${parsed}`)
    return parsed
  } catch (e) {
    console.log(`Error parsing ${fieldName}: "${value}", using 0`)
    return 0
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

// Helper function to parse French and English dates
function parseFrenchDate(dateStr: string): Date | null {
  if (!dateStr) return null
  
  // French month names
  const frenchMonths: Record<string, number> = {
    'janvier': 0, 'février': 1, 'fevrier': 1, 'mars': 2, 'avril': 3, 'mai': 4, 'juin': 5,
    'juillet': 6, 'aout': 7, 'août': 7, 'septembre': 8, 'octobre': 9, 'novembre': 10, 'décembre': 11, 'decembre': 11
  }
  
  // English month names
  const englishMonths: Record<string, number> = {
    'january': 0, 'february': 1, 'march': 2, 'april': 3, 'may': 4, 'june': 5,
    'july': 6, 'august': 7, 'september': 8, 'october': 9, 'november': 10, 'december': 11
  }
  
  try {
    const cleanDateStr = dateStr.trim().replace(/['"]/g, '').toLowerCase()
    
    // Handle format like "6 juin 2024" (French) or "6 june 2024" (English)
    const parts = cleanDateStr.split(' ')
    if (parts.length === 3) {
      const day = parseInt(parts[0])
      const monthName = parts[1]
      const year = parseInt(parts[2])
      
      if (!isNaN(day) && !isNaN(year)) {
        if (frenchMonths[monthName] !== undefined) {
          return new Date(year, frenchMonths[monthName], day)
        }
        if (englishMonths[monthName] !== undefined) {
          return new Date(year, englishMonths[monthName], day)
        }
      }
    }
    
    // Handle format like "June 6, 2024" (English)
    if (cleanDateStr.includes(',')) {
      const commaParts = cleanDateStr.split(',')
      if (commaParts.length === 2) {
        const monthDayPart = commaParts[0].trim()
        const year = parseInt(commaParts[1].trim())
        const monthDayParts = monthDayPart.split(' ')
        
        if (monthDayParts.length === 2 && !isNaN(year)) {
          const monthName = monthDayParts[0]
          const day = parseInt(monthDayParts[1])
          
          if (!isNaN(day) && englishMonths[monthName] !== undefined) {
            return new Date(year, englishMonths[monthName], day)
          }
        }
      }
    }
    
    // Handle format like "2024-06-06" (ISO format)
    if (cleanDateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const date = new Date(cleanDateStr)
      if (!isNaN(date.getTime())) {
        return date
      }
    }
    
    // Handle format like "06/06/2024" (MM/DD/YYYY or DD/MM/YYYY)
    if (cleanDateStr.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
      const parts = cleanDateStr.split('/')
      const month = parseInt(parts[0]) - 1 // JavaScript months are 0-indexed
      const day = parseInt(parts[1])
      const year = parseInt(parts[2])
      
      if (!isNaN(month) && !isNaN(day) && !isNaN(year)) {
        // Try MM/DD/YYYY first
        let date = new Date(year, month, day)
        if (!isNaN(date.getTime())) {
          return date
        }
        
        // Try DD/MM/YYYY if MM/DD/YYYY doesn't make sense
        if (month > 12) {
          date = new Date(year, day - 1, month)
          if (!isNaN(date.getTime())) {
            return date
          }
        }
      }
    }
    
    // Fallback to regular date parsing
    const fallbackDate = new Date(cleanDateStr)
    if (!isNaN(fallbackDate.getTime())) {
      return fallbackDate
    }
    
    return null
  } catch (e) {
    console.log('Date parsing error:', e)
    return null
  }
}
