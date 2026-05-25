package com.mundial2026.backend.tournament.integration.port;

import java.util.List;

public record ExternalLineup(
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
