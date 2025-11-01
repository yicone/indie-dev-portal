-- Migrate session states from 5-state to 4-state model
-- completed → active (allow continuation)
-- cancelled → archived (user archived)
-- suspended → suspended (unchanged)
-- active → active (unchanged)
-- error → error (unchanged)

UPDATE AgentSession 
SET status = CASE
  WHEN status = 'completed' THEN 'active'
  WHEN status = 'cancelled' THEN 'archived'
  ELSE status
END
WHERE status IN ('completed', 'cancelled');