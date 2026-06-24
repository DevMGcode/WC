package com.mundial2026.backend.tournament.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;

@Getter
@Setter
@Entity
@Table(name = "match_event")
public class MatchEvent {

    public enum Source { MANUAL, API }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fixture_id", nullable = false)
    private Fixture fixture;

    @Column(name = "player_name", nullable = false, length = 150)
    private String playerName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    private Team team;

    @Column
    private Integer minute;

    @Column(name = "extra_minute")
    private Integer extraMinute;

    @Column(name = "event_type", nullable = false, length = 30)
    private String eventType = "GOAL";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Source source = Source.MANUAL;

    @Column(nullable = false)
    private Boolean verified = false;

    @Column(name = "api_player_name", length = 150)
    private String apiPlayerName;

    @Column(name = "player_out", length = 150)
    private String playerOut;

    @Column(length = 100)
    private String detail;

    @Column(name = "home_score_at_event")
    private Integer homeScoreAtEvent;

    @Column(name = "away_score_at_event")
    private Integer awayScoreAtEvent;

    @Column(nullable = false)
    private Boolean mismatch = false;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();
}
