import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Try to insert a test record with minimal fields first
    const testMember = {
      name: 'Test User',
      email: 'test@example.com',
      phone: null,
      company: null,
      interests: [],
      join_date: new Date().toISOString(),
      last_active: new Date().toISOString()
    }
    
    console.log('Testing basic insert with minimal fields...')
    const { data: basicData, error: basicError } = await supabase
      .from('community_members')
      .insert([testMember])
      .select()
      .single()
    
    if (basicError) {
      return NextResponse.json({ 
        error: 'Basic insert failed',
        details: basicError.message,
        code: basicError.code,
        testData: testMember
      }, { status: 500 })
    }
    
    console.log('Basic insert successful:', basicData)
    
    // Now try to update with additional fields
    const updateData = {
      city: 'Test City',
      meetup_url: 'https://example.com',
      bio: 'Test bio'
    }
    
    console.log('Testing update with additional fields...')
    const { data: updateResult, error: updateError } = await supabase
      .from('community_members')
      .update(updateData)
      .eq('id', basicData.id)
      .select()
      .single()
    
    if (updateError) {
      // Clean up test record
      await supabase.from('community_members').delete().eq('id', basicData.id)
      
      return NextResponse.json({ 
        error: 'Update with new fields failed - columns may not exist',
        details: updateError.message,
        code: updateError.code,
        updateData: updateData,
        suggestion: 'Run the database migration to add new columns'
      }, { status: 500 })
    }
    
    // Clean up test record
    await supabase.from('community_members').delete().eq('id', basicData.id)
    
    return NextResponse.json({
      success: true,
      message: 'Database schema is up to date',
      basicInsert: basicData,
      updateResult: updateResult,
      availableColumns: Object.keys(updateResult)
    })
    
  } catch (error) {
    console.error('Schema test error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
