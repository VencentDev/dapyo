ALTER TABLE hikes
  ADD COLUMN mountain_name VARCHAR(200),
  ADD COLUMN distance_km NUMERIC(7, 2);

UPDATE hikes
SET mountain_name = location_name
WHERE mountain_name IS NULL;

ALTER TABLE hikes
  ALTER COLUMN mountain_name SET NOT NULL,
  ADD CONSTRAINT ck_hikes_distance CHECK (distance_km IS NULL OR distance_km >= 0.1);
