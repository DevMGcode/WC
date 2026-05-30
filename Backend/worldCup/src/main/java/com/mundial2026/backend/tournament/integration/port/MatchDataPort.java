package com.mundial2026.backend.tournament.integration.port;

import java.util.List;
import java.util.Optional;

public interface MatchDataPort {

    List<ExternalMatch> fetchLiveMatches();

    Optional<ExternalMatch> fetchById(String externalId);
}