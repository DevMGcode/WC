package com.mundial2026.backend.tournament.integration.port;

import java.util.List;

public interface PlayerDataPort {

    List<ExternalPlayerStat> fetchTopScorers();

    List<ExternalPlayerStat> fetchTopAssists();

    List<ExternalSquadPlayer> fetchSquad(Long teamId);
}
