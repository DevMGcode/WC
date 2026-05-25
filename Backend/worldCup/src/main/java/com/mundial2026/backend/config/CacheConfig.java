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
                MATCH_EVENTS, MATCH_STATISTICS, MATCH_PLAYER_STATS));
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
            case MATCH_PLAYER_STATS      -> base.expireAfterWrite(Duration.ofHours(6));
            default                      -> base.expireAfterWrite(Duration.ofMinutes(10));
        };
    }
}
