import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Try to get the table structure by selecting one record
    const { data, error } = await supabase
      .from('community_members')
      .select('*')
      .limit(1)
    
    if (error) {
      return NextResponse.json({ 
        error: 'Database error',
        details: error.message,
        code: error.code
      }, { status: 500 })
    }
    
    // If no data, try to insert a test record to see what columns are available
    if (!data || data.length === 0) {
      const testMember = {
        name: 'Test User',
        email: 'test@example.com',
        phone: null,
        company: null,
        interests: [],
        join_date: new Date().toISOString(),
        last_active: new Date().toISOString()
      }
      
      const { data: insertData, error: insertError } = await supabase
        .from('community_members')
        .insert(testMember)
        .select()
        .single()
      
      if (insertError) {
        return NextResponse.json({ 
          error: 'Insert test failed',
          details: insertError.message,
          code: insertError.code,
          attemptedData: testMember
        }, { status: 500 })
      }
      
      return NextResponse.json({
        success: true,
        message: 'Test record inserted successfully',
        data: insertData,
        availableColumns: Object.keys(insertData)
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      sampleData: data[0],
      availableColumns: Object.keys(data[0])
    })
    
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
