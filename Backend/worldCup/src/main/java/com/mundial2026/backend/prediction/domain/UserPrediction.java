package com.mundial2026.backend.prediction.domain;

import com.mundial2026.backend.tournament.domain.Fixture;
import com.mundial2026.backend.tournament.domain.Team;
import com.mundial2026.backend.tournament.domain.Tournament;
import com.mundial2026.backend.user.domain.AppUser;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;

@Getter
@Setter
@Entity
@Table(name = "user_prediction",
       uniqueConstraints = @UniqueConstraint(name = "ux_user_prediction_user_fixture", columnNames = {"user_id", "fixture_id"}))
public class UserPrediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tournament_id", nullable = false)
    private Tournament tournament;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fixture_id", nullable = false)
    private Fixture fixture;

    @Column(name = "predicted_home_score", nullable = false)
    private Integer predictedHomeScore;

    @Column(name = "predicted_away_score", nullable = false)
    private Integer predictedAwayScore;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "predicted_winner_team_id")
    private Team predictedWinnerTeam;

    @Column(name = "submitted_at", nullable = false)
    private OffsetDateTime submittedAt;

    @Column(name = "locked_at", nullable = false)
    private OffsetDateTime lockedAt;

    @Column(name = "is_locked", nullable = false)
    private Boolean isLocked = false;

    @Column(name = "lock_reason", length = 50)
    private String lockReason;

    @Version
    @Column(nullable = false)
    private Long version = 0L;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private OffsetDateTime updatedAt;
}
