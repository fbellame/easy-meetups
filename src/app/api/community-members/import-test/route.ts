import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    console.log('Test CSV import request started (no auth required)')
    
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
      'interests': 'interests',
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
      'meetups participated': 'meetups_attended',
      'title': 'title',
      'meetup user id': 'meetup_user_id',
      'meetup member id': 'meetup_member_id'
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
    const members: any[] = []
    const errors: string[] = []
    
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
        
        // Extract email or generate one
        let email = ''
        if (columnIndices.email !== undefined) {
          email = values[columnIndices.email] || ''
        }
        
        if (!email.trim()) {
          // Generate unique email from name and row number
          const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '')
          email = `${cleanName}${i}@meetup-member.local`
        }
        
        // Ensure email is unique by adding timestamp if needed
        const baseEmail = email
        let uniqueEmail = baseEmail
        let emailCounter = 1
        while (members.some(m => m.email === uniqueEmail)) {
          uniqueEmail = `${baseEmail.split('@')[0]}_${emailCounter}@${baseEmail.split('@')[1]}`
          emailCounter++
        }
        email = uniqueEmail
        
        // Extract all available fields with proper handling
        let phone = null
        if (columnIndices.phone !== undefined) {
          const phoneValue = values[columnIndices.phone] || ''
          // Handle boolean values in phone field (like "False")
          if (phoneValue.toLowerCase() === 'false' || phoneValue.toLowerCase() === 'true') {
            phone = null
          } else if (phoneValue.trim()) {
            phone = phoneValue.trim()
          }
        }
        
        const company = columnIndices.company !== undefined ? (values[columnIndices.company] || '').trim() || null : null
        const city = columnIndices.city !== undefined ? (values[columnIndices.city] || '').trim() || null : null
        const meetup_url = columnIndices.meetup_url !== undefined ? (values[columnIndices.meetup_url] || '').trim() || null : null
        const bio = columnIndices.bio !== undefined ? (values[columnIndices.bio] || '').trim() || null : null
        
        // Handle LinkedIn URLs - prepend https://linkedin.com if it's just a path
        let linkedin_url = null
        if (columnIndices.linkedin_url !== undefined) {
          const linkedinValue = (values[columnIndices.linkedin_url] || '').trim()
          if (linkedinValue) {
            if (linkedinValue.startsWith('/in/')) {
              linkedin_url = `https://linkedin.com${linkedinValue}`
            } else if (linkedinValue.startsWith('http')) {
              linkedin_url = linkedinValue
            } else if (linkedinValue.startsWith('linkedin.com')) {
              linkedin_url = `https://${linkedinValue}`
            } else {
              linkedin_url = linkedinValue
            }
          }
        }
        
        const twitter_url = columnIndices.twitter_url !== undefined ? (values[columnIndices.twitter_url] || '').trim() || null : null
        const github_url = columnIndices.github_url !== undefined ? (values[columnIndices.github_url] || '').trim() || null : null
        const website_url = columnIndices.website_url !== undefined ? (values[columnIndices.website_url] || '').trim() || null : null
        
        // Parse interests
        let interests: string[] = []
        if (columnIndices.interests !== undefined) {
          const interestsStr = values[columnIndices.interests] || ''
          if (interestsStr.trim()) {
            interests = interestsStr.split(';').map(i => i.trim()).filter(i => i)
          }
        }
        
        // Parse join date - allow empty/null
        let join_date = null
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
                console.log('Failed to parse join date, leaving as null')
              }
            } catch (e) {
              console.log('Could not parse join date:', joinDateStr, 'Error:', e)
            }
          }
        }
        // If no join date found, use current date as fallback
        if (!join_date) {
          join_date = new Date().toISOString()
        }
        
        // Parse last active date - allow empty/null
        let last_active = null
        if (columnIndices.last_active !== undefined) {
          const lastActiveStr = values[columnIndices.last_active]
          if (lastActiveStr && lastActiveStr.trim()) {
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
        // If no last active date found, use current date as fallback
        if (!last_active) {
          last_active = new Date().toISOString()
        }
        
        // Parse last attended date - allow empty/null
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
        
        // Extract numeric values with better parsing - allow null for empty values
        const total_responses = columnIndices.total_responses !== undefined ? parseNumericValue(values[columnIndices.total_responses], 'total_responses') : null
        const responded_yes = columnIndices.responded_yes !== undefined ? parseNumericValue(values[columnIndices.responded_yes], 'responded_yes') : null
        const responded_maybe = columnIndices.responded_maybe !== undefined ? parseNumericValue(values[columnIndices.responded_maybe], 'responded_maybe') : null
        const responded_no = columnIndices.responded_no !== undefined ? parseNumericValue(values[columnIndices.responded_no], 'responded_no') : null
        const meetups_attended = columnIndices.meetups_attended !== undefined ? parseNumericValue(values[columnIndices.meetups_attended], 'meetups_attended') : null
        const absences = columnIndices.absences !== undefined ? parseNumericValue(values[columnIndices.absences], 'absences') : null
        
        // Extract boolean values - handle empty values properly
        const has_photo = columnIndices.has_photo !== undefined ? (values[columnIndices.has_photo] || '').toLowerCase() === 'yes' : false
        const is_assistant_organizer = columnIndices.is_assistant_organizer !== undefined ? (values[columnIndices.is_assistant_organizer] || '').toLowerCase() === 'yes' : false
        const is_on_mailing_list = columnIndices.is_on_mailing_list !== undefined ? (values[columnIndices.is_on_mailing_list] || '').toLowerCase() === 'yes' : false
        
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
          join_date: join_date,
          last_active: last_active,
          last_attended: last_attended,
          meetup_user_id: columnIndices.meetup_user_id !== undefined ? (values[columnIndices.meetup_user_id] || '').trim() || null : null,
          meetup_member_id: columnIndices.meetup_member_id !== undefined ? (values[columnIndices.meetup_member_id] || '').trim() || null : null,
          title: columnIndices.title !== undefined ? (values[columnIndices.title] || '').trim() || null : null,
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
    
    // Clear existing test data first (optional - remove this if you want to keep existing data)
    console.log('Clearing existing test data...')
    const { error: deleteError } = await supabase
      .from('community_members')
      .delete()
      .like('email', '%@meetup-member.local')
    
    if (deleteError) {
      console.log('Error clearing existing data:', deleteError)
    } else {
      console.log('Cleared existing test data')
    }
    
    // Insert members into database
    console.log('Attempting to insert', members.length, 'members')
    console.log('Sample member:', JSON.stringify(members[0], null, 2))
    
    // Insert in batches to avoid potential timeout issues
    const batchSize = 100
    const batches = []
    for (let i = 0; i < members.length; i += batchSize) {
      batches.push(members.slice(i, i + batchSize))
    }
    
    console.log(`Inserting in ${batches.length} batches of ${batchSize}`)
    
    const allInsertedData = []
    const allErrors = []
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i]
      console.log(`Inserting batch ${i + 1}/${batches.length} with ${batch.length} members`)
      
      const { data, error: insertError } = await supabase
        .from('community_members')
        .upsert(batch, { 
          onConflict: 'email',
          ignoreDuplicates: false 
        })
        .select()
      
      if (insertError) {
        console.error(`Database insert error for batch ${i + 1}:`, insertError)
        allErrors.push(`Batch ${i + 1}: ${insertError.message}`)
        continue
      }
      
      if (data) {
        allInsertedData.push(...data)
        console.log(`Successfully inserted batch ${i + 1}: ${data.length} members`)
      }
    }
    
    if (allErrors.length > 0) {
      console.error('Some batches failed:', allErrors)
      return NextResponse.json({ 
        error: 'Failed to import some members to database',
        details: allErrors,
        imported: allInsertedData.length,
        total: members.length
      }, { status: 500 })
    }
    
    console.log('Successfully inserted members:', allInsertedData.length)
    
    return NextResponse.json({
      success: true,
      imported: allInsertedData.length,
      total: members.length,
      errors: errors.length > 0 ? errors : undefined,
      data: allInsertedData
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

// Helper function to parse numeric values with better error handling
function parseNumericValue(value: string | undefined, fieldName: string): number | null {
  if (!value || value.trim() === '') {
    return null
  }
  
  try {
    // Remove any non-numeric characters except minus sign
    const cleanValue = value.trim().replace(/[^\d-]/g, '')
    const parsed = parseInt(cleanValue)
    
    if (isNaN(parsed)) {
      console.log(`Could not parse ${fieldName}: "${value}", using null`)
      return null
    }
    
    console.log(`Parsed ${fieldName}: "${value}" -> ${parsed}`)
    return parsed
  } catch (e) {
    console.log(`Error parsing ${fieldName}: "${value}", using null`)
    return null
  }
}

// Helper function to parse CSV line properly (handle quoted values and empty fields)
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
  
  // Ensure we have the right number of columns by padding with empty strings if needed
  // This handles cases where the last few columns are empty
  const expectedColumns = 25 // Based on the CSV header
  while (result.length < expectedColumns) {
    result.push('')
  }
  
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
