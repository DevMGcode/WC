package com.mundial2026.backend.tournament.service;

import com.mundial2026.backend.config.CacheConfig;
import com.mundial2026.backend.tournament.api.dto.FixturePredictionResponse;
import com.mundial2026.backend.tournament.integration.port.PredictionDataPort;
import com.mundial2026.backend.tournament.repository.FixtureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FixturePredictionService {

    private static final Duration PRE_KICKOFF_WINDOW = Duration.ofHours(24);
    private static final Duration POST_KICKOFF_WINDOW = Duration.ofHours(3);

    private final PredictionDataPort predictionDataPort;
    private final FixtureRepository fixtureRepository;

    @Cacheable(value = CacheConfig.FIXTURE_PREDICTIONS, key = "#fixtureExternalId", unless = "#result.isEmpty()")
    public Optional<FixturePredictionResponse> findByFixture(Long fixtureExternalId) {
        if (!isWithinUsefulWindow(fixtureExternalId)) {
            return Optional.empty();
        }
        return predictionDataPort.fetchPredictionByFixture(fixtureExternalId)
                .map(e -> new FixturePredictionResponse(
                        e.winnerTeamId(),
                        e.winnerTeamName(),
                        e.winnerComment(),
                        e.winOrDraw(),
                        e.advice(),
                        e.homeWinPercent(),
                        e.drawPercent(),
                        e.awayWinPercent()
                ));
    }

    private boolean isWithinUsefulWindow(Long fixtureExternalId) {
        return fixtureRepository.findByExternalProviderId(fixtureExternalId)
                .map(f -> {
                    OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
                    OffsetDateTime windowStart = f.getKickoffAt().minus(PRE_KICKOFF_WINDOW);
                    OffsetDateTime windowEnd = f.getKickoffAt().plus(POST_KICKOFF_WINDOW);
                    return !now.isBefore(windowStart) && !now.isAfter(windowEnd);
                })
                .orElse(true);
    }
}
