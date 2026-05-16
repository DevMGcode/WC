WITH existing_user AS (
    SELECT id
    FROM app_user
    WHERE username = 'melissa.bonilla'
       OR email = 'melissa.bonilla@example.com'
    ORDER BY id
    LIMIT 1
), seeded_user AS (
    INSERT INTO app_user (
        username,
        email,
        password_hash,
        first_name,
        last_name,
        country_name,
        country_code,
        region_name,
        department_name,
        city_name,
        phone_country_code,
        phone_number,
        preferred_language,
        time_zone,
        status,
        email_verified
    )
    SELECT
        'melissa.bonilla',
        'melissa.bonilla@example.com',
        'Password123',
        'Melisa',
        'Bonilla',
        'Colombia',
        'CO',
        'Pacifica',
        'Valle del Cauca',
        'Cali',
        '+57',
        '3225412641',
        'es',
        'America/Bogota',
        'ACTIVE',
        FALSE
    WHERE NOT EXISTS (
        SELECT 1
        FROM existing_user
    )
    RETURNING id
), user_to_role AS (
    SELECT id FROM seeded_user
    UNION ALL
    SELECT id FROM existing_user
)
INSERT INTO user_role (user_id, role_id)
SELECT user_to_role.id, role_entity.id
FROM user_to_role
JOIN role AS role_entity ON role_entity.code = 'USER'
ON CONFLICT DO NOTHING;