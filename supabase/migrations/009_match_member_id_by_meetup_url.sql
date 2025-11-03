-- Match member_id in meetup_import_staging by using "URL of Member Profile" column
-- This updates the member_id field in meetup_import_staging by matching
-- with community_members table based on the extracted ID from the member profile URL
-- 
-- URL format: https://www.meetup.com/{group-name}/members/{id}
-- We extract the ID (number after /members/) and match on that

-- Helper function to extract member ID from meetup URL
-- Extracts the numeric ID from URLs like:
-- https://www.meetup.com/generative-ai-montreal/members/414496822
CREATE OR REPLACE FUNCTION extract_meetup_member_id(url TEXT)
RETURNS TEXT AS $$
BEGIN
  IF url IS NULL OR TRIM(url) = '' THEN
    RETURN NULL;
  END IF;
  
  -- Extract the ID after /members/ using regex
  -- Pattern: /members/ followed by digits
  RETURN (regexp_match(TRIM(url), '/members/(\d+)'))[1];
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update member_id by matching extracted ID from "URL of Member Profile"
-- Matching with community_members.meetup_url based on extracted member ID
UPDATE meetup_import_staging
SET member_id = cm.id
FROM community_members cm
WHERE extract_meetup_member_id(meetup_import_staging."URL of Member Profile") IS NOT NULL
  AND extract_meetup_member_id(meetup_import_staging."URL of Member Profile") = extract_meetup_member_id(cm.meetup_url)
  AND cm.meetup_url IS NOT NULL
  AND extract_meetup_member_id(cm.meetup_url) IS NOT NULL;

-- Log the results
DO $$
DECLARE
  matched_count INTEGER;
  unmatched_count INTEGER;
  total_with_url INTEGER;
BEGIN
  -- Count matched records
  SELECT COUNT(*) INTO matched_count
  FROM meetup_import_staging
  WHERE member_id IS NOT NULL;
  
  -- Count unmatched records (have URL but no matching member)
  SELECT COUNT(*) INTO unmatched_count
  FROM meetup_import_staging
  WHERE "URL of Member Profile" IS NOT NULL
    AND TRIM("URL of Member Profile") != ''
    AND member_id IS NULL;
  
  -- Count total records with URL
  SELECT COUNT(*) INTO total_with_url
  FROM meetup_import_staging
  WHERE "URL of Member Profile" IS NOT NULL
    AND TRIM("URL of Member Profile") != '';
  
  RAISE NOTICE 'Total records with URL: %', total_with_url;
  RAISE NOTICE 'Matched % records with member_id', matched_count;
  RAISE NOTICE 'Unmatched % records (have URL but no matching member)', unmatched_count;
END $$;

-- Insert event registrations from meetup_import_staging
-- This assumes:
-- 1. event_id column exists in meetup_import_staging (should be set before running this migration)
-- 2. member_id has been populated by the previous UPDATE statement
-- 3. RSVP column indicates registration status ("Yes", "Waiting List", etc.)
-- 4. "RSVPed on" column contains the registration date

-- Helper function to parse RSVP status and map to attendance_status
CREATE OR REPLACE FUNCTION map_rsvp_to_attendance_status(rsvp TEXT)
RETURNS VARCHAR(50) AS $$
BEGIN
  IF rsvp IS NULL OR TRIM(rsvp) = '' THEN
    RETURN 'registered';
  END IF;
  
  CASE UPPER(TRIM(rsvp))
    WHEN 'YES' THEN
      RETURN 'registered';
    WHEN 'WAITING LIST' THEN
      RETURN 'registered'; -- Waiting list is still a registration
    WHEN 'NO' THEN
      RETURN NULL; -- Don't insert if they didn't RSVP
    ELSE
      RETURN 'registered'; -- Default to registered for other statuses
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Helper function to parse registration date from "RSVPed on" column
CREATE OR REPLACE FUNCTION parse_registration_date(date_str TEXT)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
DECLARE
  parsed_date TIMESTAMP WITH TIME ZONE;
BEGIN
  IF date_str IS NULL OR TRIM(date_str) = '' THEN
    RETURN NOW();
  END IF;
  
  BEGIN
    -- Try to parse the date string
    -- Handle formats like "October 22, 2024 8:33" or "November 2, 2024 8:38"
    parsed_date := date_str::TIMESTAMP WITH TIME ZONE;
    RETURN parsed_date;
  EXCEPTION
    WHEN OTHERS THEN
      -- If parsing fails, return current timestamp
      RETURN NOW();
  END;
END;
$$ LANGUAGE plpgsql;

-- Insert registrations for members who have RSVP'd "Yes" or are on "Waiting List"
-- Only insert if both event_id and member_id are present
INSERT INTO event_registrations (event_id, member_id, registration_date, attendance_status, notes)
SELECT
  st.event_id,
  st.member_id,
  COALESCE(
    parse_registration_date(st."RSVPed on"),
    NOW()
  ) AS registration_date,
  map_rsvp_to_attendance_status(st."RSVP") AS attendance_status,
  CASE 
    WHEN st."RSVP" IS NOT NULL AND UPPER(TRIM(st."RSVP")) = 'WAITING LIST' THEN
      'Waiting list registration'
    WHEN st."Guests" IS NOT NULL AND TRIM(st."Guests") != '' THEN
      'Registered with ' || st."Guests" || ' guest(s)'
    ELSE
      NULL
  END AS notes
FROM meetup_import_staging st
WHERE st.event_id IS NOT NULL
  AND st.member_id IS NOT NULL
  AND map_rsvp_to_attendance_status(st."RSVP") IS NOT NULL
  -- Avoid duplicates: check if registration already exists
  AND NOT EXISTS (
    SELECT 1 
    FROM event_registrations er 
    WHERE er.event_id = st.event_id 
      AND er.member_id = st.member_id
  );

-- Log the insertion results
DO $$
DECLARE
  inserted_count INTEGER;
  skipped_count INTEGER;
BEGIN
  -- Count inserted registrations
  SELECT COUNT(*) INTO inserted_count
  FROM meetup_import_staging st
  WHERE st.event_id IS NOT NULL
    AND st.member_id IS NOT NULL
    AND map_rsvp_to_attendance_status(st."RSVP") IS NOT NULL;
  
  -- Count skipped (no event_id or no member_id)
  SELECT COUNT(*) INTO skipped_count
  FROM meetup_import_staging st
  WHERE (st.event_id IS NULL OR st.member_id IS NULL)
    OR map_rsvp_to_attendance_status(st."RSVP") IS NULL;
  
  RAISE NOTICE 'Inserted % event registrations', inserted_count;
  RAISE NOTICE 'Skipped % records (missing event_id, member_id, or invalid RSVP)', skipped_count;
END $$;
