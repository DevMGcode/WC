WITH existing_user AS (
    SELECT id
    FROM app_user
    WHERE username = 'admin'
       OR email = 'admin@example.com'
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
        'admin',
        'admin@example.com',
        '$2a$10$13ePyMypo0NDLnVAUnLluuXjt.Yyra65ZGjwKnNEBthHCWyQiEDFG',
        'Admin',
        'Mundial',
        'Colombia',
        'CO',
        'Andina',
        'Bogota D.C.',
        'Bogota',
        '+57',
        '3000000000',
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
JOIN role AS role_entity ON role_entity.code = 'ADMIN'
ON CONFLICT DO NOTHING;