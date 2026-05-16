-- V12: Traducir nombres de equipos al español y normalizar short_name al código FIFA

UPDATE team SET name = 'Argelia',                    country_name = 'Argelia'                    WHERE fifa_code = 'ALG';
UPDATE team SET name = 'Australia',                  country_name = 'Australia'                  WHERE fifa_code = 'AUS';
UPDATE team SET name = 'Bosnia y Herzegovina',       country_name = 'Bosnia y Herzegovina'       WHERE fifa_code = 'BIH';
UPDATE team SET name = 'Cabo Verde',                 country_name = 'Cabo Verde'                 WHERE fifa_code = 'CPV';
UPDATE team SET name = 'Rep. Democrática del Congo', country_name = 'Rep. Democrática del Congo' WHERE fifa_code = 'COD';
UPDATE team SET name = 'Croacia',                    country_name = 'Croacia'                    WHERE fifa_code = 'CRO';
UPDATE team SET name = 'Curazao',                    country_name = 'Curazao'                    WHERE fifa_code = 'CUR';
UPDATE team SET name = 'República Checa',            country_name = 'República Checa'            WHERE fifa_code = 'CZE';
UPDATE team SET name = 'Egipto',                     country_name = 'Egipto'                     WHERE fifa_code = 'EGY';
UPDATE team SET name = 'Inglaterra',                 country_name = 'Inglaterra'                 WHERE fifa_code = 'ENG';
UPDATE team SET name = 'Ghana',                      country_name = 'Ghana'                      WHERE fifa_code = 'GHA';
UPDATE team SET name = 'Haití',                      country_name = 'Haití'                      WHERE fifa_code = 'HAI';
UPDATE team SET name = 'Irán',                       country_name = 'Irán'                       WHERE fifa_code = 'IRN';
UPDATE team SET name = 'Irak',                       country_name = 'Irak'                       WHERE fifa_code = 'IRQ';
UPDATE team SET name = 'Costa de Marfil',            country_name = 'Costa de Marfil'            WHERE fifa_code = 'CIV';
UPDATE team SET name = 'Jordania',                   country_name = 'Jordania'                   WHERE fifa_code = 'JOR';
UPDATE team SET name = 'Nueva Zelanda',              country_name = 'Nueva Zelanda'              WHERE fifa_code = 'NZL';
UPDATE team SET name = 'Noruega',                    country_name = 'Noruega'                    WHERE fifa_code = 'NOR';
UPDATE team SET name = 'Panamá',                     country_name = 'Panamá'                     WHERE fifa_code = 'PAN';
UPDATE team SET name = 'Catar',                      country_name = 'Catar'                      WHERE fifa_code = 'QAT';
UPDATE team SET name = 'Arabia Saudita',             country_name = 'Arabia Saudita'             WHERE fifa_code = 'KSA';
UPDATE team SET name = 'Escocia',                    country_name = 'Escocia'                    WHERE fifa_code = 'SCO';
UPDATE team SET name = 'Senegal',                    country_name = 'Senegal'                    WHERE fifa_code = 'SEN';
UPDATE team SET name = 'Sudáfrica',                  country_name = 'Sudáfrica'                  WHERE fifa_code = 'RSA';
UPDATE team SET name = 'Suecia',                     country_name = 'Suecia'                     WHERE fifa_code = 'SWE';
UPDATE team SET name = 'Túnez',                      country_name = 'Túnez'                      WHERE fifa_code = 'TUN';
UPDATE team SET name = 'Turquía',                    country_name = 'Turquía'                    WHERE fifa_code = 'TUR';
UPDATE team SET name = 'Estados Unidos',             country_name = 'Estados Unidos'             WHERE fifa_code = 'USA';
UPDATE team SET name = 'Uzbekistán',                 country_name = 'Uzbekistán'                 WHERE fifa_code = 'UZB';

-- Normalizar short_name al código FIFA (3 letras) para todos los equipos
UPDATE team SET short_name = fifa_code WHERE fifa_code IS NOT NULL;

-- Actualizar nombres de fixtures ya creados por el sync que usan nombre en inglés
UPDATE fixture SET name = home_t.name || ' vs ' || away_t.name
FROM team home_t, team away_t
WHERE fixture.home_team_id = home_t.id
  AND fixture.away_team_id = away_t.id
  AND fixture.external_provider_id IS NOT NULL;
