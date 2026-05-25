package com.mundial2026.backend.realtime.event;

import com.mundial2026.backend.realtime.payload.MatchLiveDelta;

/** Published by FixtureSyncService when a live fixture's score/minute/status changes. */
public record FixtureScoreUpdatedEvent(MatchLiveDelta delta) {
}
