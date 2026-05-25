package com.mundial2026.backend.tournament.integration.sync;

import com.mundial2026.backend.tournament.integration.apifootball.ApiFootballClient;
import com.mundial2026.backend.tournament.integration.apifootball.dto.StatusResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "tournament.sync.enabled", havingValue = "true")
public class QuotaMonitorJob {

    private static final double WARN_THRESHOLD_PCT = 80.0;

    private final ApiFootballClient client;

    @Scheduled(initialDelayString = "PT2M", fixedDelayString = "PT1H")
    public void monitor() {
        try {
            client.fetchAccountStatus().ifPresent(this::logQuota);
        } catch (Exception ex) {
            log.warn("Quota monitor failed: {}", ex.getMessage());
        }
    }

    private void logQuota(StatusResponse status) {
        StatusResponse.Subscription subscription = status.subscription();
        StatusResponse.Requests requests = status.requests();
        if (requests == null) {
            return;
        }
        int current = requests.current() != null ? requests.current() : 0;
        int limit = requests.limitDay() != null ? requests.limitDay() : 0;
        double pct = limit > 0 ? (100.0 * current / limit) : 0;

        log.info("API-Football quota: {}/{} ({}%) | plan={} | active={} | endsAt={}",
                current,
                limit,
                String.format("%.1f", pct),
                subscription != null ? subscription.plan() : "?",
                subscription != null ? subscription.active() : "?",
                subscription != null ? subscription.end() : "?");

        if (pct >= WARN_THRESHOLD_PCT) {
            log.warn("API-Football quota >= {}% — usage {}/{}", WARN_THRESHOLD_PCT, current, limit);
        }
    }
}
