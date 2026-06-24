package com.mundial2026.backend.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.List;

/**
 * Per-cache TTL. Static data (squad, head-to-head) lives for hours; volatile data (standings) refreshes fast.
 * Pre-warmed cache names — Caffeine creates the bucket at startup so first request doesn't pay creation cost.
 */
@Configuration
@EnableCaching
public class CacheConfig {

    public static final String STANDINGS = "standings";
    public static final String TOP_SCORERS = "topScorers";
    public static final String TOP_ASSISTS = "topAssists";
    public static final String SQUAD = "squad";
    public static final String LINEUPS = "lineups";
    public static final String HEAD_TO_HEAD = "headToHead";
    public static final String FIXTURE_PREDICTIONS = "fixturePredictions";
    public static final String MATCH_EVENTS = "matchEvents";
    public static final String MATCH_STATISTICS = "matchStatistics";
    public static final String MATCH_PLAYER_STATS = "matchPlayerStats";
    /** Cobertura declarada por API-Football para la temporada activa
     *  (coverage.events, coverage.top_scorers, coverage.players, ...).
     *  TTL largo (6h) porque la cobertura cambia muy poco — la API la activa
     *  cuando se publican los primeros datos del torneo. */
    public static final String LEAGUE_COVERAGE = "leagueCoverage";

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager mgr = new CaffeineCacheManager() {
            @Override
            protected org.springframework.cache.Cache createCaffeineCache(String name) {
                return new CaffeineCache(name, buildCaffeine(name).build());
            }
        };
        mgr.setCacheNames(List.of(
                STANDINGS, TOP_SCORERS, TOP_ASSISTS, SQUAD,
                LINEUPS, HEAD_TO_HEAD, FIXTURE_PREDICTIONS,
                MATCH_EVENTS, MATCH_STATISTICS, MATCH_PLAYER_STATS,
                LEAGUE_COVERAGE));
        return mgr;
    }

    private Caffeine<Object, Object> buildCaffeine(String name) {
        Caffeine<Object, Object> base = Caffeine.newBuilder().maximumSize(500);
        return switch (name) {
            case STANDINGS               -> base.expireAfterWrite(Duration.ofMinutes(5));
            case TOP_SCORERS, TOP_ASSISTS -> base.expireAfterWrite(Duration.ofMinutes(10));
            case LINEUPS                 -> base.expireAfterWrite(Duration.ofMinutes(30));
            case FIXTURE_PREDICTIONS     -> base.expireAfterWrite(Duration.ofHours(1));
            case SQUAD, HEAD_TO_HEAD     -> base.expireAfterWrite(Duration.ofHours(24));
            case MATCH_EVENTS            -> base.expireAfterWrite(Duration.ofSeconds(30));
            case MATCH_STATISTICS        -> base.expireAfterWrite(Duration.ofMinutes(1));
            // 60s para que minutos y rating se refresquen durante partidos en vivo.
            // Antes eran 6h, que congelaba la tabla de jugadores todo el partido.
            // El costo en cuota es mínimo (plan Mega, 150k/día): ~1 llamada/min por
            // partido en vivo que alguien esté mirando, y el caché es compartido.
            case MATCH_PLAYER_STATS      -> base.expireAfterWrite(Duration.ofSeconds(60));
            // TTL corto pre-Mundial: cuando API-Football active los flags el día del kick-off
            // (11-jun-2026), queremos verlo en ≤30 min, no hasta 6h después. Post-Mundial se
            // puede subir a 6h sin urgencia — la cobertura ya no cambia.
            case LEAGUE_COVERAGE         -> base.expireAfterWrite(Duration.ofMinutes(30));
            default                      -> base.expireAfterWrite(Duration.ofMinutes(10));
        };
    }
}
