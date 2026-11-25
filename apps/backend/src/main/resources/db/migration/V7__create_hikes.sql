CREATE TABLE hikes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  location_name VARCHAR(200) NOT NULL,
  latitude NUMERIC(9, 6) NOT NULL,
  longitude NUMERIC(9, 6) NOT NULL,
  scheduled_start_at TIMESTAMPTZ NOT NULL,
  difficulty VARCHAR(32) NOT NULL,
  max_participants INTEGER NOT NULL,
  external_guest_count INTEGER NOT NULL DEFAULT 0,
  admission_mode VARCHAR(24) NOT NULL,
  description VARCHAR(4000) NOT NULL,
  requirements VARCHAR(4000),
  status VARCHAR(16) NOT NULL DEFAULT 'PUBLISHED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by VARCHAR(255),
  updated_by VARCHAR(255),
  CONSTRAINT ck_hikes_latitude CHECK (latitude >= -90 AND latitude <= 90),
  CONSTRAINT ck_hikes_longitude CHECK (longitude >= -180 AND longitude <= 180),
  CONSTRAINT ck_hikes_difficulty CHECK (difficulty IN ('EASY', 'MODERATE', 'CHALLENGING')),
  CONSTRAINT ck_hikes_capacity CHECK (max_participants > 0),
  CONSTRAINT ck_hikes_guest_count CHECK (external_guest_count >= 0),
  CONSTRAINT ck_hikes_admission_mode CHECK (admission_mode IN ('OPEN', 'APPROVAL')),
  CONSTRAINT ck_hikes_status CHECK (status IN ('PUBLISHED', 'CANCELLED'))
);

CREATE INDEX idx_hikes_status_scheduled_start
  ON hikes (status, scheduled_start_at);
CREATE INDEX idx_hikes_organizer_created
  ON hikes (organizer_id, created_at DESC);

CREATE TABLE hike_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hike_id UUID NOT NULL REFERENCES hikes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status VARCHAR(16) NOT NULL,
  joined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by VARCHAR(255),
  updated_by VARCHAR(255),
  CONSTRAINT uq_hike_participant_user UNIQUE (hike_id, user_id),
  CONSTRAINT ck_hike_participant_status CHECK (status IN ('PENDING', 'JOINED', 'DECLINED', 'REMOVED')),
  CONSTRAINT ck_hike_joined_timestamp CHECK (status <> 'JOINED' OR joined_at IS NOT NULL)
);

CREATE INDEX idx_hike_participants_hike_status
  ON hike_participants (hike_id, status, created_at);
CREATE INDEX idx_hike_participants_user_status
  ON hike_participants (user_id, status, joined_at DESC);

CREATE TABLE hike_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hike_id UUID NOT NULL REFERENCES hikes(id) ON DELETE CASCADE,
  storage_key VARCHAR(80) NOT NULL UNIQUE,
  mime_type VARCHAR(64) NOT NULL,
  byte_size BIGINT NOT NULL,
  caption VARCHAR(500),
  display_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by VARCHAR(255),
  updated_by VARCHAR(255),
  CONSTRAINT ck_hike_image_byte_size CHECK (byte_size > 0),
  CONSTRAINT ck_hike_image_order CHECK (display_order >= 0)
);

CREATE INDEX idx_hike_images_hike_order
  ON hike_images (hike_id, display_order, created_at);
