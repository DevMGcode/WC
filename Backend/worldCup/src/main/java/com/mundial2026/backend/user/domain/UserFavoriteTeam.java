package com.mundial2026.backend.user.domain;

import com.mundial2026.backend.tournament.domain.Team;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;

/**
 * Equipo favorito del usuario. Un usuario puede tener varios
 * favoritos (cap 3 para Free), y solo UNO es is_primary=true.
 *
 * El principal se sincroniza con AppUser.favoriteTeam (campo unico)
 * que ya existe en V3 y se usa para determinar los 3 partidos
 * predecibles del plan Free.
 */
@Getter
@Setter
@Entity
@Table(
        name = "user_favorite_team",
        uniqueConstraints = @UniqueConstraint(
                name = "ux_user_favorite_team_unique",
                columnNames = {"user_id", "team_id"}
        )
)
public class UserFavoriteTeam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @Column(name = "is_primary", nullable = false)
    private Boolean isPrimary = false;

    @Column(nullable = false)
    private Integer position = 0;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;
}
