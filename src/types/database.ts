export interface Host {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  venue_name?: string;
  venue_address?: string;
  capacity?: number;
  amenities?: string[];
  preferences?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Speaker {
  id: string;
  name: string;
  email: string;
  bio?: string;
  expertise?: string[];
  social_links?: Record<string, string>;
  availability?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Talk {
  id: string;
  speaker_id: string;
  title: string;
  abstract?: string;
  duration_minutes: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
  slides_url?: string;
  video_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  host_id?: string;
  venue_name?: string;
  venue_address?: string;
  event_date: string;
  start_time?: string;
  end_time?: string;
  max_capacity?: number;
  registration_deadline?: string;
  status: 'planned' | 'confirmed' | 'cancelled' | 'completed';
  meetup_url?: string;
  luma_url?: string;
  linkedin_url?: string;
  created_at: string;
  updated_at: string;
}

export interface EventSpeaker {
  id: string;
  event_id: string;
  speaker_id: string;
  talk_id?: string;
  speaking_order: number;
  created_at: string;
}

export interface CommunityMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  interests?: string[];
  join_date: string;
  last_active?: string;
  created_at: string;
  updated_at: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  member_id: string;
  registration_date: string;
  attendance_status: 'registered' | 'attended' | 'no_show' | 'cancelled';
  notes?: string;
  created_at: string;
}

export interface Announcement {
  id: string;
  event_id: string;
  type: 'pre_event' | 'post_event' | 'reminder';
  title: string;
  content: string;
  platforms: string[];
  scheduled_for?: string;
  sent_at?: string;
  status: 'draft' | 'scheduled' | 'sent';
  created_at: string;
  updated_at: string;
}

// Extended types with relations
export interface EventWithDetails extends Event {
  host?: Host;
  speakers?: (EventSpeaker & { speaker: Speaker; talk?: Talk })[];
  registrations?: EventRegistration[];
  announcements?: Announcement[];
}

export interface SpeakerWithTalks extends Speaker {
  talks?: Talk[];
}

export interface HostWithEvents extends Host {
  events?: Event[];
}
