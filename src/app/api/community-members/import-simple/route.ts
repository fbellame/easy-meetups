import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    console.log('Simple CSV import request started')
    
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
    
    // Find name and email columns
    const nameIndex = headers.findIndex(h => h === 'name')
    const emailIndex = headers.findIndex(h => h === 'email')
    
    if (nameIndex === -1 || emailIndex === -1) {
      console.log('Missing required columns. Name index:', nameIndex, 'Email index:', emailIndex)
      return NextResponse.json({ 
        error: 'CSV must contain at least "Name" and "Email" columns',
        foundHeaders: headers
      }, { status: 400 })
    }
    
    // Parse data rows - only use existing columns
    const members = []
    const errors = []
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/['"]/g, ''))
      
      try {
        const member = {
          name: values[nameIndex] || '',
          email: values[emailIndex] || '',
          phone: null,
          company: null,
          interests: [],
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
