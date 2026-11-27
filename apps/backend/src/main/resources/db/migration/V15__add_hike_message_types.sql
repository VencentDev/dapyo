ALTER TABLE hike_messages
  ADD COLUMN message_type VARCHAR(24) NOT NULL DEFAULT 'MESSAGE';

ALTER TABLE hike_messages
  ADD CONSTRAINT ck_hike_message_type
    CHECK (message_type IN ('MESSAGE', 'MEMBER_JOINED'));
