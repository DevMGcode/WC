-- api-football returns duplicate `code` for distinct national teams
-- (e.g. AUS = Australia / Austria, IRA = Iran / Iraq) plus some null codes.
-- The original UNIQUE constraint blocks team sync. We keep the column for
-- display but drop the uniqueness — the real PK uniqueness lives in
-- `external_provider_id`.
ALTER TABLE team DROP CONSTRAINT IF EXISTS team_fifa_code_key;
