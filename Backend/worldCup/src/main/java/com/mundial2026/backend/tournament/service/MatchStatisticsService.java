package com.mundial2026.backend.tournament.service;

import com.mundial2026.backend.config.CacheConfig;
import com.mundial2026.backend.tournament.api.dto.MatchStatisticResponse;
import com.mundial2026.backend.tournament.integration.port.ExternalMatchStatistic;
import com.mundial2026.backend.tournament.integration.port.MatchStatisticsDataPort;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MatchStatisticsService {

    private final MatchStatisticsDataPort matchStatisticsDataPort;

    @Cacheable(value = CacheConfig.MATCH_STATISTICS, key = "#fixtureExternalId", unless = "#result.isEmpty()")
    public List<MatchStatisticResponse> findByFixture(Long fixtureExternalId) {
        return matchStatisticsDataPort.fetchStatisticsByFixture(fixtureExternalId).stream()
                .map(this::toResponse)
                .toList();
    }

    private MatchStatisticResponse toResponse(ExternalMatchStatistic e) {
        return new MatchStatisticResponse(
                e.teamId(),
                e.teamName(),
                e.teamLogoUrl(),
                e.statistics()
        );
    }
}
