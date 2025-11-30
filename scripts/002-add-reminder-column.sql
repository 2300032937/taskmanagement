-- Add reminder column to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reminder TIMESTAMP;

-- Create index for faster reminder queries
CREATE INDEX IF NOT EXISTS idx_tasks_reminder ON tasks(reminder);
