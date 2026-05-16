package com.mundial2026.backend.tournament.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;

@Getter
@Setter
@Entity
@Table(name = "group_standing")
public class GroupStanding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tournament_id", nullable = false)
    private Tournament tournament;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_stage_id", nullable = false)
    private GroupStage groupStage;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @Column(nullable = false)
    private Integer position;

    @Column(nullable = false)
    private Integer played;

    @Column(nullable = false)
    private Integer won;

    @Column(nullable = false)
    private Integer drawn;

    @Column(nullable = false)
    private Integer lost;

    @Column(name = "goals_for", nullable = false)
    private Integer goalsFor;

    @Column(name = "goals_against", nullable = false)
    private Integer goalsAgainst;

    @Column(nullable = false)
    private Integer points;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
