-- Add host_email column to events table
ALTER TABLE events
ADD COLUMN host_email VARCHAR(255);
