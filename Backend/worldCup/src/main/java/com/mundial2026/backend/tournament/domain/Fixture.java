package com.mundial2026.backend.tournament.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;

@Getter
@Setter
@Entity
@Table(name = "fixture")
public class Fixture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "external_provider_id", unique = true)
    private Long externalProviderId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tournament_id", nullable = false)
    private Tournament tournament;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stage_id", nullable = false)
    private Stage stage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_stage_id")
    private GroupStage groupStage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venue_id")
    private Venue venue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "home_team_id", nullable = false)
    private Team homeTeam;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "away_team_id", nullable = false)
    private Team awayTeam;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "kickoff_at", nullable = false)
    private OffsetDateTime kickoffAt;

    @Column(name = "prediction_lock_minutes_before", nullable = false)
    private Integer predictionLockMinutesBefore = 5;

    @Column(name = "prediction_locked_at", nullable = false)
    private OffsetDateTime predictionLockedAt;

    @Column(name = "home_score")
    private Integer homeScore;

    @Column(name = "away_score")
    private Integer awayScore;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private FixtureStatus status = FixtureStatus.SCHEDULED;

    @Column(name = "extra_minutes", nullable = false)
    private Integer extraMinutes = 0;

    /** Ya se envió el recordatorio push de este partido (evita duplicados). */
    @Column(name = "reminder_notified", nullable = false)
    private Boolean reminderNotified = false;

    /** Ya se envió el aviso push de resultado de este partido. */
    @Column(name = "result_notified", nullable = false)
    private Boolean resultNotified = false;
}
