
-- Create a function to increment the event attendees count
CREATE OR REPLACE FUNCTION increment_event_attendees(event_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE events
  SET attendees = COALESCE(attendees, 0) + 1
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql;
