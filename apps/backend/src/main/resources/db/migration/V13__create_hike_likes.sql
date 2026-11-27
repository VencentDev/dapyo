CREATE TABLE hike_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hike_id UUID NOT NULL REFERENCES hikes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by VARCHAR(255),
  updated_by VARCHAR(255),
  CONSTRAINT uq_hike_like_user UNIQUE (hike_id, user_id)
);

CREATE INDEX idx_hike_likes_user ON hike_likes(user_id, hike_id);
