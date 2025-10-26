-- Add attendance and engagement fields to community_members table
-- These fields correspond to the data from the member attendance export

-- Last attended event date
ALTER TABLE community_members 
ADD COLUMN IF NOT EXISTS last_attended TIMESTAMP WITH TIME ZONE;

-- RSVP and attendance statistics
ALTER TABLE community_members 
ADD COLUMN IF NOT EXISTS total_responses INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS responded_yes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS responded_maybe INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS responded_no INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS meetups_attended INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS absences INTEGER DEFAULT 0;

-- Additional member metadata
ALTER TABLE community_members 
ADD COLUMN IF NOT EXISTS has_photo BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_assistant_organizer BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_on_mailing_list BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS meetup_user_id TEXT,
ADD COLUMN IF NOT EXISTS meetup_member_id TEXT,
ADD COLUMN IF NOT EXISTS title TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_community_members_last_attended ON community_members(last_attended);
CREATE INDEX IF NOT EXISTS idx_community_members_meetups_attended ON community_members(meetups_attended);
CREATE INDEX IF NOT EXISTS idx_community_members_total_responses ON community_members(total_responses);
CREATE INDEX IF NOT EXISTS idx_community_members_meetup_user_id ON community_members(meetup_user_id);

-- Add comments to clarify field purposes
COMMENT ON COLUMN community_members.last_attended IS 'Date when the member last attended an event';
COMMENT ON COLUMN community_members.total_responses IS 'Total number of RSVPs (Yes + Maybe + No)';
COMMENT ON COLUMN community_members.responded_yes IS 'Number of Yes RSVPs';
COMMENT ON COLUMN community_members.responded_maybe IS 'Number of Maybe RSVPs';
COMMENT ON COLUMN community_members.responded_no IS 'Number of No RSVPs';
COMMENT ON COLUMN community_members.meetups_attended IS 'Total number of events attended';
COMMENT ON COLUMN community_members.absences IS 'Number of events where member was absent';
COMMENT ON COLUMN community_members.has_photo IS 'Whether the member has a profile photo';
COMMENT ON COLUMN community_members.is_assistant_organizer IS 'Whether the member is an assistant organizer';
COMMENT ON COLUMN community_members.is_on_mailing_list IS 'Whether the member is on the mailing list';
COMMENT ON COLUMN community_members.meetup_user_id IS 'Meetup.com user ID';
COMMENT ON COLUMN community_members.meetup_member_id IS 'Meetup.com member ID';
COMMENT ON COLUMN community_members.title IS 'Member title or job position';
