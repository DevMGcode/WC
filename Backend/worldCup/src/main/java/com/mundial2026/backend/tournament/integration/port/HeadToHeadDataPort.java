package com.mundial2026.backend.tournament.integration.port;

import java.util.List;

public interface HeadToHeadDataPort {

    List<ExternalMatch> fetchHeadToHead(Long homeTeamId, Long awayTeamId, int last);
}
