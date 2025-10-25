-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create hosts table
CREATE TABLE hosts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  company VARCHAR(255),
  venue_name VARCHAR(255),
  venue_address TEXT,
  capacity INTEGER,
  amenities TEXT[],
  preferences JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create speakers table
CREATE TABLE speakers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  bio TEXT,
  expertise TEXT[],
  social_links JSONB,
  availability JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create talks table
CREATE TABLE talks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  speaker_id UUID REFERENCES speakers(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  abstract TEXT,
  duration_minutes INTEGER DEFAULT 30,
  difficulty_level VARCHAR(50) DEFAULT 'beginner',
  tags TEXT[],
  slides_url VARCHAR(500),
  video_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table
CREATE TABLE events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  host_id UUID REFERENCES hosts(id),
  venue_name VARCHAR(255),
  venue_address TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  start_time TIME,
  end_time TIME,
  max_capacity INTEGER,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'planned',
  meetup_url VARCHAR(500),
  luma_url VARCHAR(500),
  linkedin_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create event_speakers junction table
CREATE TABLE event_speakers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  speaker_id UUID REFERENCES speakers(id) ON DELETE CASCADE,
  talk_id UUID REFERENCES talks(id),
  speaking_order INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create community_members table
CREATE TABLE community_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  company VARCHAR(255),
  interests TEXT[],
  join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create event_registrations table
CREATE TABLE event_registrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  member_id UUID REFERENCES community_members(id) ON DELETE CASCADE,
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  attendance_status VARCHAR(50) DEFAULT 'registered',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create announcements table
CREATE TABLE announcements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'pre_event', 'post_event', 'reminder'
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  platforms TEXT[], -- ['meetup', 'luma', 'linkedin']
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_event_speakers_event_id ON event_speakers(event_id);
CREATE INDEX idx_event_speakers_speaker_id ON event_speakers(speaker_id);
CREATE INDEX idx_registrations_event_id ON event_registrations(event_id);
CREATE INDEX idx_registrations_member_id ON event_registrations(member_id);
CREATE INDEX idx_announcements_event_id ON announcements(event_id);
CREATE INDEX idx_announcements_type ON announcements(type);

-- Enable Row Level Security
ALTER TABLE hosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE talks ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now, can be restricted later)
CREATE POLICY "Allow all operations on hosts" ON hosts FOR ALL USING (true);
CREATE POLICY "Allow all operations on speakers" ON speakers FOR ALL USING (true);
CREATE POLICY "Allow all operations on talks" ON talks FOR ALL USING (true);
CREATE POLICY "Allow all operations on events" ON events FOR ALL USING (true);
CREATE POLICY "Allow all operations on event_speakers" ON event_speakers FOR ALL USING (true);
CREATE POLICY "Allow all operations on community_members" ON community_members FOR ALL USING (true);
CREATE POLICY "Allow all operations on event_registrations" ON event_registrations FOR ALL USING (true);
CREATE POLICY "Allow all operations on announcements" ON announcements FOR ALL USING (true);
