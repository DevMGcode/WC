UPDATE app_user
SET password_hash = '$2a$10$KeuXSTa8G3VNsAnXoXs9Ze9APPmqiEs/a3YuF//YJ7MFJjn87y.rK'
WHERE username = 'admin'
   OR email = 'admin@example.com';