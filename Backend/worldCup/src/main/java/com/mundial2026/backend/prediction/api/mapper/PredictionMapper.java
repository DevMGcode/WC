package com.mundial2026.backend.prediction.api.mapper;

import com.mundial2026.backend.prediction.api.dto.PredictionResponse;
import com.mundial2026.backend.prediction.domain.UserPrediction;
import org.springframework.stereotype.Component;

@Component
public class PredictionMapper {

    public PredictionResponse toResponse(UserPrediction prediction) {
        return new PredictionResponse(
                prediction.getId(),
                prediction.getUser().getId(),
                prediction.getUser().getUsername(),
                prediction.getFixture().getId(),
                prediction.getFixture().getName(),
                prediction.getPredictedHomeScore(),
                prediction.getPredictedAwayScore(),
                prediction.getSubmittedAt(),
                prediction.getLockedAt(),
                prediction.getIsLocked(),
                prediction.getLockReason()
        );
    }
}
