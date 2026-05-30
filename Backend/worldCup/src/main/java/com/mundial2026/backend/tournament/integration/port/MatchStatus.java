package com.mundial2026.backend.tournament.integration.port;

public enum MatchStatus {
    SCHEDULED,
    LIVE,
    HALFTIME,
    BREAK,
    PENALTY_SHOOTOUT,
    FINISHED,
    POSTPONED,
    CANCELLED,
    ABANDONED,
    UNKNOWN;

    public boolean isLive() {
        return this == LIVE || this == HALFTIME || this == BREAK || this == PENALTY_SHOOTOUT;
    }

    public boolean isFinished() {
        return this == FINISHED;
    }
}