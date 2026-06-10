package com.mundial2026.backend.tournament.integration.sync;

import com.mundial2026.backend.config.CacheConfig;
import com.mundial2026.backend.tournament.integration.apifootball.ApiFootballClient;
import com.mundial2026.backend.tournament.integration.apifootball.ApiFootballProperties;
import com.mundial2026.backend.tournament.integration.apifootball.dto.LeagueItem;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Wrapper sobre {@code GET /leagues?id=...} que cachea los flags
 * {@code coverage.*} declarados por API-Football para la temporada activa.
 *
 * <h3>¿Por qué importa?</h3>
 * Antes de que arranque un Mundial, la API ya devuelve el calendario y la
 * estructura de grupos, pero NO los datos en vivo: para el Mundial 2026
 * (en mayo/junio 2026) los flags eran:
 * <pre>
 *   fixtures.events           = false
 *   fixtures.lineups          = false
 *   fixtures.statistics_*     = false
 *   players                   = false
 *   top_scorers / top_assists = false
 *   standings                 = true
 *   predictions               = true
 * </pre>
 * Llamar igual a {@code /fixtures/events}, {@code /players/topscorers}, etc.
 * cuando la propia API te avisa que devolverá {@code []} es desperdicio puro
 * de cuota diaria. Estos métodos exponen banderas sencillas
 * ({@link #canFetchEvents()}, {@link #canFetchTopScorers()}, etc.) para que
 * los services llamen la API solo cuando hay datos reales.
 *
 * <h3>Compatibilidad histórica</h3>
 * Para temporadas pasadas (2018, 2022) todos los flags ya están en {@code true}
 * y se mantienen así para siempre, así que estas comprobaciones son no-op
 * para data histórica — solo aportan en la temporada activa antes del kick-off.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CoverageService {

    private final ApiFootballClient apiFootballClient;
    private final ApiFootballProperties props;

    // ─── Acceso crudo a la cobertura cacheada ────────────────────────────────

    /**
     * Devuelve el bloque {@code coverage} de la temporada configurada.
     * Cachea por 6h (ver {@link CacheConfig#LEAGUE_COVERAGE}).
     * Si la API falla, devuelve {@link Optional#empty()} y el código que
     * lo consume debe decidir su default — para no romper el flujo lo
     * sensato suele ser "asumir disponible".
     */
    @Cacheable(value = CacheConfig.LEAGUE_COVERAGE, key = "#root.target.props.season()")
    public Optional<LeagueItem.Coverage> currentSeasonCoverage() {
        try {
            return apiFootballClient.fetchLeagueCoverage()
                    .flatMap(this::extractCoverageForActiveSeason);
        } catch (Exception ex) {
            log.warn("Could not fetch league coverage from API-Football: {}", ex.getMessage());
            return Optional.empty();
        }
    }

    private Optional<LeagueItem.Coverage> extractCoverageForActiveSeason(LeagueItem item) {
        if (item.seasons() == null) return Optional.empty();
        int season = props.season();
        return item.seasons().stream()
                .filter(s -> s != null && s.year() != null && s.year() == season)
                .findFirst()
                .map(LeagueItem.SeasonBlock::coverage);
    }

    // ─── Banderas convenientes (default permisivo) ───────────────────────────
    //
    // Si la API no responde o no se sabe, devolvemos true para no bloquear
    // funcionalidad por un fallo transitorio. El caso que queremos evitar es
    // "la API dijo claramente false y aún así llamamos".

    public boolean canFetchEvents() {
        return flag(c -> c.fixtures() != null ? c.fixtures().events() : null);
    }

    public boolean canFetchLineups() {
        return flag(c -> c.fixtures() != null ? c.fixtures().lineups() : null);
    }

    public boolean canFetchFixtureStatistics() {
        return flag(c -> c.fixtures() != null ? c.fixtures().statisticsFixtures() : null);
    }

    public boolean canFetchFixturePlayers() {
        return flag(c -> c.fixtures() != null ? c.fixtures().statisticsPlayers() : null);
    }

    public boolean canFetchPlayers() {
        return flag(LeagueItem.Coverage::players);
    }

    public boolean canFetchTopScorers() {
        return flag(LeagueItem.Coverage::topScorers);
    }

    public boolean canFetchTopAssists() {
        return flag(LeagueItem.Coverage::topAssists);
    }

    public boolean canFetchStandings() {
        return flag(LeagueItem.Coverage::standings);
    }

    public boolean canFetchPredictions() {
        return flag(LeagueItem.Coverage::predictions);
    }

    private boolean flag(java.util.function.Function<LeagueItem.Coverage, Boolean> extractor) {
        return currentSeasonCoverage()
                .map(extractor)
                .map(Boolean::booleanValue)
                .orElse(true); // default permisivo si no hay info
    }

    // Lombok @RequiredArgsConstructor genera el ctor con props, pero el
    // SpEL key="#root.target.props.season()" necesita acceso al field.
    // Spring Cache lo resuelve sin reflection adicional gracias al getter:
    ApiFootballProperties props() { return props; }
}
