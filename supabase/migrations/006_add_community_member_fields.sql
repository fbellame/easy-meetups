-- Add additional fields to community_members table
ALTER TABLE community_members 
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS meetup_url TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS twitter_url TEXT,
ADD COLUMN IF NOT EXISTS github_url TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index on city for better query performance
CREATE INDEX IF NOT EXISTS idx_community_members_city ON community_members(city);

-- Create index on join_date for better query performance
CREATE INDEX IF NOT EXISTS idx_community_members_join_date ON community_members(join_date);
