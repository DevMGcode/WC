package com.mundial2026.backend.tournament.integration.port;

import java.util.List;

public interface MatchStatisticsDataPort {

    List<ExternalMatchStatistic> fetchStatisticsByFixture(Long fixtureId);
}
