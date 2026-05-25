package com.mundial2026.backend.tournament.api.dto;

import java.util.List;

public record LineupResponse(
        Long teamId,
        String teamName,
        String teamLogoUrl,
        Long coachId,
        String coachName,
        String coachPhotoUrl,
        String formation,
        List<LineupPlayer> startXI,
        List<LineupPlayer> substitutes
) {

    public record LineupPlayer(
            Long playerId,
            String playerName,
            Integer shirtNumber,
            String position,
            String grid
    ) {
    }
}
