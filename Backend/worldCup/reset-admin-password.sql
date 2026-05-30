-- ╔══════════════════════════════════════════════════════════════╗
-- ║   Reset admin@example.com password → "admin"                ║
-- ║   Uso:                                                       ║
-- ║   docker exec mundial2026-postgres-dev psql -U postgres \   ║
-- ║     -d worldcup2026_db -f /reset-admin-password.sql         ║
-- ║                                                              ║
-- ║   O desde Windows:                                           ║
-- ║   Get-Content reset-admin-password.sql | docker exec -i \   ║
-- ║     mundial2026-postgres-dev psql -U postgres -d worldcup2026_db
-- ╚══════════════════════════════════════════════════════════════╝

UPDATE app_user
SET password_hash = '$2a$10$KeuXSTa8G3VNsAnXoXs9Ze9APPmqiEs/a3YuF//YJ7MFJjn87y.rK',
    email_verified = true,
    status = 'ACTIVE'
WHERE email = 'admin@example.com'
RETURNING id, username, email, status, email_verified;

-- El hash de arriba corresponde a la contraseña "admin" (BCrypt rounds 10).
-- Es el mismo hash del seed inicial en V1__init.sql, así que reiniciar la
-- base de datos también restaura este password.
