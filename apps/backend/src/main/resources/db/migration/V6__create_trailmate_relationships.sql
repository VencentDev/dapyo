CREATE TABLE trailmate_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_a_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  member_b_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(16) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by VARCHAR(255),
  updated_by VARCHAR(255),
  CONSTRAINT ck_trailmate_member_order CHECK (member_a_id < member_b_id),
  CONSTRAINT ck_trailmate_requester CHECK (requester_id IN (member_a_id, member_b_id)),
  CONSTRAINT ck_trailmate_status CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED')),
  CONSTRAINT uq_trailmate_pair UNIQUE (member_a_id, member_b_id)
);

CREATE INDEX idx_trailmate_member_a_status
  ON trailmate_relationships (member_a_id, status, created_at DESC);
CREATE INDEX idx_trailmate_member_b_status
  ON trailmate_relationships (member_b_id, status, created_at DESC);
CREATE INDEX idx_trailmate_requester_status
  ON trailmate_relationships (requester_id, status);
