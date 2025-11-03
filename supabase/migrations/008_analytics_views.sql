-- Analytics Views: org-wide facts for members, events, and attendance

-- Members fact view: one row per member with key attributes and derived month
CREATE OR REPLACE VIEW org_member_facts_v AS
SELECT
  m.id                    AS member_id,
  m.city                  AS member_city,
  m.join_date             AS joined_at,
  date_trunc('month', COALESCE(m.join_date, m.created_at)) AS joined_month,
  m.meetups_attended      AS total_meetups_attended,
  m.last_attended         AS last_attended_at
FROM community_members m;


-- Events fact view: one row per event with derived month
CREATE OR REPLACE VIEW org_event_facts_v AS
SELECT
  e.id                    AS event_id,
  e.event_date            AS event_datetime,
  date_trunc('month', e.event_date) AS event_month,
  e.host_id,
  e.status
FROM events e;


-- Attendance fact view: one row per (member, event) attendance
-- Uses event_registrations with attendance_status = 'attended'
CREATE OR REPLACE VIEW org_attendance_facts_v AS
SELECT
  r.event_id,
  r.member_id,
  e.event_date            AS attended_at,
  date_trunc('month', e.event_date) AS event_month,
  m.city                  AS member_city
FROM event_registrations r
JOIN events e ON e.id = r.event_id
JOIN community_members m ON m.id = r.member_id
WHERE r.attendance_status = 'attended';


-- Convenience view for monthly member growth (new members per month)
CREATE OR REPLACE VIEW org_member_growth_monthly_v AS
SELECT
  date_trunc('month', COALESCE(m.join_date, m.created_at)) AS month,
  COUNT(*) AS new_members
FROM community_members m
GROUP BY 1
ORDER BY 1;


-- Convenience view for monthly attendance
CREATE OR REPLACE VIEW org_attendance_monthly_v AS
SELECT
  date_trunc('month', e.event_date) AS month,
  COUNT(DISTINCT r.member_id) AS attendees,
  COUNT(DISTINCT r.event_id)  AS events
FROM events e
LEFT JOIN event_registrations r
  ON r.event_id = e.id AND r.attendance_status = 'attended'
GROUP BY 1
ORDER BY 1;


-- RLS note: These are views over existing tables which already have policies.
-- Ensure downstream queries only expose aggregates where necessary in API layer.


