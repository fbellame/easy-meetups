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
    
    if (error) throw error
    return data || []
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
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('speakers')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
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
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Database connection error:', error)
    // Return empty array if database is not connected
    return []
  }
}

export async function getEvent(id: string): Promise<Event | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
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
