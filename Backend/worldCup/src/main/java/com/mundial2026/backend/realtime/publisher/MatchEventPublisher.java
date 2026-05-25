package com.mundial2026.backend.realtime.publisher;

import com.mundial2026.backend.realtime.event.FixtureEventOccurredEvent;
import com.mundial2026.backend.realtime.event.FixtureScoreUpdatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class MatchEventPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    @EventListener
    public void onScoreUpdated(FixtureScoreUpdatedEvent event) {
        var delta = event.delta();
        String destination = "/topic/matches/" + delta.matchId() + "/live";
        messagingTemplate.convertAndSend(destination, delta);
        log.debug("Pushed score delta to {}", destination);
    }

    @EventListener
    public void onMatchEvent(FixtureEventOccurredEvent event) {
        var ev = event.event();
        String destination = "/topic/matches/" + ev.matchId() + "/events";
        messagingTemplate.convertAndSend(destination, ev);
        log.info("Pushed match event {} to {}", ev.type(), destination);
    }
}
