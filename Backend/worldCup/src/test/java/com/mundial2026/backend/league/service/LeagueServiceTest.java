package com.mundial2026.backend.league.service;

import com.mundial2026.backend.common.exception.BusinessRuleException;
import com.mundial2026.backend.league.repository.PrivateLeagueMemberRepository;
import com.mundial2026.backend.league.repository.PrivateLeagueRepository;
import com.mundial2026.backend.scoring.service.ScoringService;
import com.mundial2026.backend.subscription.service.PremiumGuard;
import com.mundial2026.backend.tournament.repository.TournamentRepository;
import com.mundial2026.backend.user.repository.AppUserRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Tests del gate de visibilidad de ligas (Fase 2).
 *
 * Regla cubierta — requireCanViewLeague(leagueId, userId):
 *   - Premium (incluye admin): ve el ranking/miembros de CUALQUIER liga.
 *   - Free: solo si es MIEMBRO de esa liga.
 *   - Free no-miembro: rechazado con BusinessRuleException.
 */
@ExtendWith(MockitoExtension.class)
class LeagueServiceTest {

    @Mock PrivateLeagueRepository privateLeagueRepository;
    @Mock PrivateLeagueMemberRepository privateLeagueMemberRepository;
    @Mock TournamentRepository tournamentRepository;
    @Mock AppUserRepository appUserRepository;
    @Mock ScoringService scoringService;
    @Mock EntityManager entityManager;
    @Mock PremiumGuard premiumGuard;

    @InjectMocks LeagueService leagueService;

    private static final Long LEAGUE_ID = 7L;
    private static final Long USER_ID = 42L;

    @Test
    void requireCanViewLeague_premiumUser_seesAnyLeague() {
        // Premium pasa sin importar si es miembro (Tabla 2: ranking de cualquier liga).
        when(premiumGuard.isPremium(USER_ID)).thenReturn(true);

        assertThatCode(() -> leagueService.requireCanViewLeague(LEAGUE_ID, USER_ID))
                .doesNotThrowAnyException();

        // No debe ni consultar membresía: Premium ya tiene acceso.
        verify(privateLeagueMemberRepository, never()).existsByLeagueIdAndUserId(LEAGUE_ID, USER_ID);
    }

    @Test
    void requireCanViewLeague_freeMember_seesOwnLeague() {
        // Free que SÍ es miembro de la liga puede verla (Tabla 1).
        when(premiumGuard.isPremium(USER_ID)).thenReturn(false);
        when(privateLeagueMemberRepository.existsByLeagueIdAndUserId(LEAGUE_ID, USER_ID)).thenReturn(true);

        assertThatCode(() -> leagueService.requireCanViewLeague(LEAGUE_ID, USER_ID))
                .doesNotThrowAnyException();
    }

    @Test
    void requireCanViewLeague_freeNonMember_isRejected() {
        // Free que NO es miembro: rechazado (privacidad de ligas ajenas).
        when(premiumGuard.isPremium(USER_ID)).thenReturn(false);
        when(privateLeagueMemberRepository.existsByLeagueIdAndUserId(LEAGUE_ID, USER_ID)).thenReturn(false);

        assertThatThrownBy(() -> leagueService.requireCanViewLeague(LEAGUE_ID, USER_ID))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("ligas a las que perteneces");
    }
}
