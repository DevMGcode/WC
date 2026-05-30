package com.mundial2026.backend.tournament.integration.port;

import java.util.Optional;

public interface PredictionDataPort {

    Optional<ExternalPrediction> fetchPredictionByFixture(Long fixtureId);
}
