import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    // Create Supabase client
    const supabase = await createClient()

    try {
      // Generate unique filename
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      const fileExtension = file.name.split('.').pop()
      const fileName = `event-images/${timestamp}-${randomString}.${fileExtension}`

      // Convert file to buffer
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('event-images')
        .upload(fileName, buffer, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Supabase upload error:', error)
        throw new Error(`Storage upload failed: ${error.message}`)
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('event-images')
        .getPublicUrl(data.path)

      return NextResponse.json({ 
        success: true, 
        url: urlData.publicUrl,
        filename: file.name,
        size: file.size,
        type: file.type,
        path: data.path
      })

    } catch (storageError) {
      console.error('Storage error, falling back to base64:', storageError)
      
      // Fallback to base64 if storage fails (for development)
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64 = buffer.toString('base64')
      const dataUrl = `data:${file.type};base64,${base64}`

      return NextResponse.json({ 
        success: true, 
        url: dataUrl,
        filename: file.name,
        size: file.size,
        type: file.type,
        fallback: true
      })
    }

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { url } = await request.json()
    
    if (!url) {
      return NextResponse.json({ error: 'No URL provided' }, { status: 400 })
    }

    // Only delete Supabase storage URLs (skip base64 data URLs)
    if (!url.includes('supabase')) {
      return NextResponse.json({ success: true, message: 'Not a Supabase URL, skipping deletion' })
    }

    try {
      // Extract the file path from the URL
      const urlParts = url.split('/')
      const fileName = urlParts[urlParts.length - 1]
      const filePath = `event-images/${fileName}`

      // Create Supabase client
      const supabase = await createClient()

      // Delete from Supabase Storage
      const { error } = await supabase.storage
        .from('event-images')
        .remove([filePath])

      if (error) {
        console.error('Supabase delete error:', error)
        return NextResponse.json({ error: 'Failed to delete from storage' }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Image deleted successfully' 
      })

    } catch (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json({ success: true, message: 'Delete failed but continuing' })
    }

  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
