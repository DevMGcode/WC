-- Mark all existing users as verified (they predate the verification requirement)
ALTER TABLE app_user ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE;
UPDATE app_user SET email_verified = TRUE WHERE email_verified = FALSE;

-- Column to store the one-time verification token for new registrations
ALTER TABLE app_user ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(64);
