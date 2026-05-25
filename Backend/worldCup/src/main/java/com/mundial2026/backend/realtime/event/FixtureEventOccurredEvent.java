package com.mundial2026.backend.realtime.event;

import com.mundial2026.backend.realtime.payload.MatchEvent;

/** Published by LiveEventPollingService for each new in-match event (goal, card, sub, VAR). */
public record FixtureEventOccurredEvent(MatchEvent event) {
}
