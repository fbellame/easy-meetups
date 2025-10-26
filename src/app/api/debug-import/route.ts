import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    console.log('=== DEBUG IMPORT START ===')
    
    const supabase = await createClient()
    
    // Get the uploaded file
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      console.log('No file uploaded')
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }
    
    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    })
    
    // Read the CSV file
    const csvText = await file.text()
    console.log('CSV text length:', csvText.length)
    console.log('First 500 characters:', csvText.substring(0, 500))
    
    const lines = csvText.split('\n').filter(line => line.trim())
    console.log('Number of lines:', lines.length)
    console.log('First line (headers):', lines[0])
    
    if (lines.length < 2) {
      return NextResponse.json({ 
        error: 'CSV file must have at least a header and one data row',
        lines: lines.length
      }, { status: 400 })
    }
    
    // Parse header row - handle both comma and tab separated
    const firstLine = lines[0]
    const isTabSeparated = firstLine.includes('\t')
    const separator = isTabSeparated ? '\t' : ','
    
    console.log('Separator detected:', separator)
    
    const headers = firstLine.split(separator).map(h => h.trim().toLowerCase().replace(/['"]/g, ''))
    console.log('Headers found:', headers)
    
    // Map French headers to English
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
      'bio': 'bio'
    }
    
    // Find mapped columns
    const columnIndices: Record<string, number> = {}
    headers.forEach((header, index) => {
      const mappedColumn = headerMapping[header]
      if (mappedColumn) {
        columnIndices[mappedColumn] = index
      }
    })
    
    console.log('Column indices:', columnIndices)
    
    // Check if we have at least name or email
    const hasName = columnIndices.name !== undefined
    const hasEmail = columnIndices.email !== undefined
    const hasUserId = columnIndices.user_id !== undefined
    const hasMemberId = columnIndices.member_id !== undefined
    
    console.log('Has name:', hasName, 'Has email:', hasEmail, 'Has user_id:', hasUserId, 'Has member_id:', hasMemberId)
    
    if (!hasName && !hasEmail && !hasUserId && !hasMemberId) {
      return NextResponse.json({ 
        error: 'CSV must contain at least Name, Email, User ID, or Member ID column',
        foundHeaders: headers,
        availableMappings: Object.keys(headerMapping)
      }, { status: 400 })
    }
    
    // Parse first data row to test
    if (lines.length > 1) {
      const firstDataLine = lines[1]
      const values = firstDataLine.split(separator).map(v => v.trim().replace(/['"]/g, ''))
      console.log('First data row values:', values)
      
      // Try to create a test member
      const testMember: any = {
        name: values[columnIndices.name] || values[columnIndices.user_id] || values[columnIndices.member_id] || 'Unknown',
        email: values[columnIndices.email] || `user${Date.now()}@example.com`,
        phone: null,
        company: null,
        interests: [],
        join_date: new Date().toISOString(),
        last_active: new Date().toISOString()
      }
      
      console.log('Test member object:', testMember)
      
      // Try to insert test member
      const { data, error: insertError } = await supabase
        .from('community_members')
        .insert([testMember])
        .select()
      
      if (insertError) {
        console.error('Database insert error:', insertError)
        return NextResponse.json({ 
          error: 'Database insert failed',
          details: insertError.message,
          code: insertError.code,
          testMember
        }, { status: 500 })
      }
      
      console.log('Test insert successful:', data)
      
      // Clean up test record
      if (data && data[0]) {
        await supabase
          .from('community_members')
          .delete()
          .eq('id', data[0].id)
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Debug completed successfully',
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type
      },
      csvInfo: {
        lines: lines.length,
        separator,
        headers,
        columnIndices
      }
    })
    
  } catch (error) {
    console.error('Debug import error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
