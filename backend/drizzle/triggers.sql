-- PostgreSQL LISTEN/NOTIFY Triggers for Real-time Updates
-- This file contains triggers that automatically broadcast changes to all tables

-- =============================================================================
-- NOTIFY FUNCTION: Generic function to send notifications on table changes
-- =============================================================================
CREATE OR REPLACE FUNCTION notify_table_change()
RETURNS TRIGGER AS $$
DECLARE
  notification JSON;
  channel_name TEXT;
BEGIN
  -- Determine the channel name based on table
  channel_name := TG_TABLE_NAME || '_changes';

  -- Build notification payload
  IF (TG_OP = 'DELETE') THEN
    notification = json_build_object(
      'table', TG_TABLE_NAME,
      'operation', TG_OP,
      'record', json_build_object('id', OLD.id),
      'timestamp', NOW()
    );
  ELSE
    notification = json_build_object(
      'table', TG_TABLE_NAME,
      'operation', TG_OP,
      'record', row_to_json(NEW),
      'timestamp', NOW()
    );
  END IF;

  -- Send notification
  PERFORM pg_notify(channel_name, notification::text);

  -- Return appropriate value
  IF (TG_OP = 'DELETE') THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TRIGGERS FOR PROJECTS TABLE
-- =============================================================================
DROP TRIGGER IF EXISTS projects_notify_trigger ON projects;

CREATE TRIGGER projects_notify_trigger
AFTER INSERT OR UPDATE OR DELETE ON projects
FOR EACH ROW
EXECUTE FUNCTION notify_table_change();

-- =============================================================================
-- TRIGGERS FOR TASKS TABLE
-- =============================================================================
DROP TRIGGER IF EXISTS tasks_notify_trigger ON tasks;

CREATE TRIGGER tasks_notify_trigger
AFTER INSERT OR UPDATE OR DELETE ON tasks
FOR EACH ROW
EXECUTE FUNCTION notify_table_change();

-- =============================================================================
-- TRIGGERS FOR COMMENTS TABLE
-- =============================================================================
DROP TRIGGER IF EXISTS comments_notify_trigger ON comments;

CREATE TRIGGER comments_notify_trigger
AFTER INSERT OR UPDATE OR DELETE ON comments
FOR EACH ROW
EXECUTE FUNCTION notify_table_change();

-- =============================================================================
-- TRIGGERS FOR USERS TABLE (if needed)
-- =============================================================================
DROP TRIGGER IF EXISTS users_notify_trigger ON users;

CREATE TRIGGER users_notify_trigger
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW
EXECUTE FUNCTION notify_table_change();

-- =============================================================================
-- VERIFICATION QUERIES (run these to test triggers are working)
-- =============================================================================
-- List all triggers:
-- SELECT trigger_name, event_manipulation, event_object_table
-- FROM information_schema.triggers
-- WHERE trigger_schema = 'public';

-- Test notification (run in one psql session, then modify data in another):
-- LISTEN projects_changes;
-- Then in another session: INSERT INTO projects (name) VALUES ('Test Project');
