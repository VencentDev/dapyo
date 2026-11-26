ALTER TABLE hikes
  RENAME COLUMN scheduled_start_at TO scheduled_date;

ALTER TABLE hikes
  ALTER COLUMN scheduled_date TYPE DATE
  USING (scheduled_date AT TIME ZONE 'Asia/Manila')::DATE;

ALTER INDEX idx_hikes_status_scheduled_start
  RENAME TO idx_hikes_status_scheduled_date;
