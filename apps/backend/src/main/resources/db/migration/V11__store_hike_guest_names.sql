ALTER TABLE hikes
  ADD COLUMN external_guest_names JSONB NOT NULL DEFAULT '[]'::JSONB;
