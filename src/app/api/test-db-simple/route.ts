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
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      hasData: data && data.length > 0,
      sampleData: data && data.length > 0 ? data[0] : null,
      availableColumns: data && data.length > 0 ? Object.keys(data[0]) : []
    })
    
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
