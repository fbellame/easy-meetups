import { createClient } from './supabase/server'
import type { 
  Host, 
  Speaker, 
  Event, 
  CommunityMember, 
  Announcement,
  EventWithDetails,
  SpeakerWithTalks,
  HostWithEvents
} from '@/types/database'

// Hosts
export async function getHosts(): Promise<Host[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('hosts')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching hosts:', error)
      throw error
    }
    
    // Ensure proper date formatting for React Server Components
    const formattedData = (data || []).map(host => ({
      ...host,
      created_at: host.created_at ? new Date(host.created_at).toISOString() : host.created_at,
      updated_at: host.updated_at ? new Date(host.updated_at).toISOString() : host.updated_at
    }))
    
    return formattedData
  } catch (error) {
    console.error('Database connection error:', error)
    // Return empty array if database is not connected
    return []
  }
}

export async function getHost(id: string): Promise<Host | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('hosts')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Database connection error:', error)
    return null
  }
}

export async function createHost(host: Omit<Host, 'id' | 'created_at' | 'updated_at'>): Promise<Host> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('hosts')
    .insert(host)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateHost(id: string, updates: Partial<Host>): Promise<Host> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('hosts')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteHost(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('hosts')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Speakers
export async function getSpeakers(): Promise<Speaker[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('speakers')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching speakers:', error)
      throw error
    }
    
    // Ensure proper date formatting for React Server Components
    const formattedData = (data || []).map(speaker => ({
      ...speaker,
      created_at: speaker.created_at ? new Date(speaker.created_at).toISOString() : speaker.created_at,
      updated_at: speaker.updated_at ? new Date(speaker.updated_at).toISOString() : speaker.updated_at
    }))
    
    return formattedData
  } catch (error) {
    console.error('Database connection error:', error)
    return []
  }
}

export async function getSpeaker(id: string): Promise<Speaker | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('speakers')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export async function createSpeaker(speaker: Omit<Speaker, 'id' | 'created_at' | 'updated_at'>): Promise<Speaker> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('speakers')
    .insert(speaker)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateSpeaker(id: string, updates: Partial<Speaker>): Promise<Speaker> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('speakers')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteSpeaker(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('speakers')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Events
export async function getEvents(): Promise<Event[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: false })
    
    if (error) {
      console.error('Error fetching events:', error)
      throw error
    }
    
    // Ensure proper date formatting for React Server Components
    const formattedData = (data || []).map(event => ({
      ...event,
      event_date: event.event_date ? new Date(event.event_date).toISOString().split('T')[0] : event.event_date,
      registration_deadline: event.registration_deadline ? new Date(event.registration_deadline).toISOString() : event.registration_deadline,
      created_at: event.created_at ? new Date(event.created_at).toISOString() : event.created_at,
      updated_at: event.updated_at ? new Date(event.updated_at).toISOString() : event.updated_at
    }))
    
    return formattedData
  } catch (error) {
    console.error('Database connection error:', error)
    // Return empty array if database is not connected
    return []
  }
}

export async function getEvent(id: string): Promise<Event | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('Error fetching event:', error)
      throw error
    }
    
    if (!data) return null
    
    // Ensure proper date formatting for React Server Components
    const formattedData = {
      ...data,
      event_date: data.event_date ? new Date(data.event_date).toISOString().split('T')[0] : data.event_date,
      registration_deadline: data.registration_deadline ? new Date(data.registration_deadline).toISOString() : data.registration_deadline,
      created_at: data.created_at ? new Date(data.created_at).toISOString() : data.created_at,
      updated_at: data.updated_at ? new Date(data.updated_at).toISOString() : data.updated_at
    }
    
    return formattedData
  } catch (error) {
    console.error('Database connection error:', error)
    return null
  }
}

export async function createEvent(event: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Promise<Event> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('events')
    .insert(event)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateEvent(id: string, updates: Partial<Event>): Promise<Event> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('events')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteEvent(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Community Members
export async function getCommunityMembers(): Promise<CommunityMember[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('community_members')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function getCommunityMember(id: string): Promise<CommunityMember | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('community_members')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export async function createCommunityMember(member: Omit<CommunityMember, 'id' | 'created_at' | 'updated_at'>): Promise<CommunityMember> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('community_members')
    .insert(member)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateCommunityMember(id: string, updates: Partial<CommunityMember>): Promise<CommunityMember> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('community_members')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteCommunityMember(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('community_members')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Announcements
export async function getAnnouncements(): Promise<Announcement[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function getAnnouncement(id: string): Promise<Announcement | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export async function createAnnouncement(announcement: Omit<Announcement, 'id' | 'created_at' | 'updated_at'>): Promise<Announcement> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('announcements')
    .insert(announcement)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateAnnouncement(id: string, updates: Partial<Announcement>): Promise<Announcement> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('announcements')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteAnnouncement(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('announcements')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Event Speakers
export async function getEventSpeakers(eventId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('event_speakers')
      .select(`
        *,
        speakers (
          id,
          name,
          email,
          bio,
          expertise,
          profile_photo_url
        )
      `)
      .eq('event_id', eventId)
      .order('speaking_order')
    
    if (error) {
      console.error('Error fetching event speakers:', error)
      throw error
    }
    
    // Ensure proper data formatting
    const formattedData = (data || []).map(item => ({
      ...item,
      created_at: item.created_at ? new Date(item.created_at).toISOString() : item.created_at
    }))
    
    return formattedData
  } catch (error) {
    console.error('Database connection error:', error)
    return []
  }
}

export async function createEventSpeakers(eventId: string, speakerIds: string[]) {
  const supabase = await createClient()
  
  // First, remove existing speaker assignments for this event
  await supabase
    .from('event_speakers')
    .delete()
    .eq('event_id', eventId)

  // Then, add new speaker assignments
  const eventSpeakers = speakerIds.map((speaker_id, index) => ({
    event_id: eventId,
    speaker_id,
    speaking_order: index + 1
  }))

  const { data, error } = await supabase
    .from('event_speakers')
    .insert(eventSpeakers)
    .select()
  
  if (error) throw error
  return data
}

export async function getEventWithDetails(id: string): Promise<EventWithDetails | null> {
  try {
    // Validate the ID parameter
    if (!id || id === 'undefined' || id === 'null') {
      console.error('Invalid event ID provided:', id)
      return null
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        hosts (
          id,
          name,
          email,
          company,
          venue_name,
          venue_address,
          capacity
        )
      `)
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('Error fetching event with details:', error)
      throw error
    }
    if (!data) return null

    // Get speakers for this event
    const speakers = await getEventSpeakers(id)
    
    // Ensure proper date formatting for React Server Components
    const formattedData = {
      ...data,
      event_date: data.event_date ? new Date(data.event_date).toISOString().split('T')[0] : data.event_date,
      registration_deadline: data.registration_deadline ? new Date(data.registration_deadline).toISOString() : data.registration_deadline,
      created_at: data.created_at ? new Date(data.created_at).toISOString() : data.created_at,
      updated_at: data.updated_at ? new Date(data.updated_at).toISOString() : data.updated_at
    }
    
    return {
      ...formattedData,
      speakers
    }
  } catch (error) {
    console.error('Database connection error:', error)
    return null
  }
}

// Dashboard Stats
export async function getDashboardStats() {
  try {
    const supabase = await createClient()
    const [eventsResult, hostsResult, speakersResult, membersResult] = await Promise.all([
      supabase.from('events').select('id', { count: 'exact' }),
      supabase.from('hosts').select('id', { count: 'exact' }),
      supabase.from('speakers').select('id', { count: 'exact' }),
      supabase.from('community_members').select('id', { count: 'exact' })
    ])

    return {
      events: eventsResult.count || 0,
      hosts: hostsResult.count || 0,
      speakers: speakersResult.count || 0,
      members: membersResult.count || 0
    }
  } catch (error) {
    console.error('Database connection error:', error)
    // Return mock data if database is not connected
    return {
      events: 0,
      hosts: 0,
      speakers: 0,
      members: 0
    }
  }
}
