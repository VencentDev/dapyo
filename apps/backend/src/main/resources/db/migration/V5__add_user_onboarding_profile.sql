CREATE TABLE user_onboarding_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  experience_level VARCHAR(32),
  preferred_difficulty VARCHAR(32),
  analytics_consent BOOLEAN,
  analytics_consent_version VARCHAR(64),
  analytics_consent_at TIMESTAMPTZ,
  age_range VARCHAR(32),
  referral_source VARCHAR(32),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by VARCHAR(255),
  updated_by VARCHAR(255)
);

CREATE TABLE user_onboarding_interests (
  user_id UUID NOT NULL REFERENCES user_onboarding_profiles(user_id) ON DELETE CASCADE,
  interest VARCHAR(32) NOT NULL,
  PRIMARY KEY (user_id, interest)
);

INSERT INTO user_onboarding_profiles (user_id, completed_at, created_at, updated_at)
SELECT id, created_at, now(), now()
FROM users;
