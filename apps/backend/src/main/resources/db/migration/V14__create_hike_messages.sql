CREATE TABLE hike_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hike_id UUID NOT NULL REFERENCES hikes(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  body VARCHAR(2000) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by VARCHAR(255),
  updated_by VARCHAR(255),
  CONSTRAINT ck_hike_message_body CHECK (length(trim(body)) > 0)
);

CREATE INDEX idx_hike_messages_hike_created
  ON hike_messages (hike_id, created_at DESC);
