package com.mundial2026.backend.tournament.integration.port;

import java.util.List;

public interface MatchEventDataPort {

    List<ExternalMatchEvent> fetchEventsByFixture(Long fixtureId);
}
