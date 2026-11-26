ALTER TABLE hikes
  ADD COLUMN difficulty_rating INTEGER NOT NULL DEFAULT 3;

UPDATE hikes
SET difficulty_rating = CASE difficulty
  WHEN 'EASY' THEN 2
  WHEN 'MODERATE' THEN 3
  WHEN 'CHALLENGING' THEN 5
  ELSE 3
END;

ALTER TABLE hikes
  ADD CONSTRAINT ck_hikes_difficulty_rating
  CHECK (difficulty_rating BETWEEN 1 AND 5);
