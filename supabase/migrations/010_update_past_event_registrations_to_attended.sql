-- Update attendance_status for past events
-- For events that have already occurred, update registrations from 'registered' to 'attended'
-- This assumes that if someone registered for a past event, they likely attended
-- unless they were on a waiting list or explicitly marked as no-show

-- Update registrations for past events (where event_date < now)
-- Only update 'registered' status, not 'cancelled' or 'no_show'
UPDATE event_registrations
SET attendance_status = 'attended'
WHERE attendance_status = 'registered'
  AND event_id IN (
    SELECT id FROM events WHERE event_date < NOW()
  )
  -- Don't update if there's a note indicating they didn't attend
  AND (notes IS NULL OR notes NOT ILIKE '%no show%' AND notes NOT ILIKE '%did not attend%');

-- Log the update
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO updated_count
  FROM event_registrations
  WHERE attendance_status = 'attended'
    AND event_id IN (
      SELECT id FROM events WHERE event_date < NOW()
    );
  
  RAISE NOTICE 'Updated % past event registrations to attended status', updated_count;
END $$;

