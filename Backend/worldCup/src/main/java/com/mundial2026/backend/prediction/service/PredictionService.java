package com.mundial2026.backend.prediction.service;

import com.mundial2026.backend.common.exception.BusinessRuleException;
import com.mundial2026.backend.common.exception.ResourceNotFoundException;
import com.mundial2026.backend.prediction.api.dto.CreatePredictionRequest;
import com.mundial2026.backend.prediction.api.dto.UpdatePredictionRequest;
import com.mundial2026.backend.prediction.domain.UserPrediction;
import com.mundial2026.backend.prediction.repository.UserPredictionRepository;
import com.mundial2026.backend.subscription.service.PremiumGuard;
import com.mundial2026.backend.tournament.domain.Fixture;
import com.mundial2026.backend.tournament.repository.FixtureRepository;
import com.mundial2026.backend.user.domain.AppUser;
import com.mundial2026.backend.user.domain.UserFavoriteTeam;
import com.mundial2026.backend.user.repository.AppUserRepository;
import com.mundial2026.backend.user.repository.UserFavoriteTeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PredictionService {

    private final UserPredictionRepository userPredictionRepository;
    private final AppUserRepository appUserRepository;
    private final FixtureRepository fixtureRepository;
    private final PremiumGuard premiumGuard;
    private final UserFavoriteTeamRepository userFavoriteTeamRepository;

    @Transactional
    public UserPrediction create(CreatePredictionRequest request) {
        userPredictionRepository.findByUserIdAndFixtureId(request.userId(), request.fixtureId())
                .ifPresent(prediction -> {
                    throw new BusinessRuleException("El usuario ya tiene una porra para este partido");
                });

        AppUser user = appUserRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Fixture fixture = fixtureRepository.findById(request.fixtureId())
                .orElseThrow(() -> new ResourceNotFoundException("Partido no encontrado"));

        if (fixture.getStatus() == com.mundial2026.backend.tournament.domain.FixtureStatus.FINISHED) {
            throw new BusinessRuleException("La porra ya está bloqueada: el partido ha finalizado");
        }
        validatePredictionWindow(fixture.getPredictionLockedAt());

        // ── Gate Free/Premium ──────────────────────────────────────────────
        // Premium: predice cualquier partido sin límite.
        // Free:    puede predecir cualquier partido donde participe CUALQUIER
        //          equipo de su lista de favoritos (elegidos en el onboarding).
        if (!premiumGuard.isPremium(user)) {
            List<UserFavoriteTeam> favTeams = userFavoriteTeamRepository
                    .findByUserIdOrderByPositionAscIdAsc(user.getId());

            // 1. Debe tener al menos un equipo favorito configurado
            if (favTeams.isEmpty()) {
                throw new BusinessRuleException(
                        "Para predecir gratis primero elige tus equipos favoritos en tu perfil. " +
                        "O hazte Premium para predecir todos los partidos."
                );
            }

            // 2. El partido debe incluir alguno de sus equipos favoritos
            Long homeId = fixture.getHomeTeam() != null ? fixture.getHomeTeam().getId() : null;
            Long awayId = fixture.getAwayTeam() != null ? fixture.getAwayTeam().getId() : null;
            boolean isFavInMatch = favTeams.stream().anyMatch(f -> {
                Long tid = f.getTeam().getId();
                return tid.equals(homeId) || tid.equals(awayId);
            });
            if (!isFavInMatch) {
                throw new BusinessRuleException(
                        "Como usuario Free solo puedes predecir partidos de tus equipos favoritos. " +
                        "Hazte Premium para predecir todos los partidos del Mundial."
                );
            }
        }
        // ── Fin del gate ───────────────────────────────────────────────────

        UserPrediction prediction = new UserPrediction();
        prediction.setUser(user);
        prediction.setTournament(fixture.getTournament());
        prediction.setFixture(fixture);
        prediction.setPredictedHomeScore(request.predictedHomeScore());
        prediction.setPredictedAwayScore(request.predictedAwayScore());
        prediction.setSubmittedAt(OffsetDateTime.now());
        prediction.setLockedAt(fixture.getPredictionLockedAt());
        prediction.setIsLocked(false);
        prediction.setPredictedWinnerTeam(resolveWinner(request.predictedHomeScore(), request.predictedAwayScore(), fixture));

        return userPredictionRepository.save(prediction);
    }

    @Transactional
    public UserPrediction update(Long predictionId, UpdatePredictionRequest request) {
        UserPrediction prediction = userPredictionRepository.findWithUserAndFixtureById(predictionId)
                .orElseThrow(() -> new ResourceNotFoundException("Porra no encontrada"));

        if (prediction.getFixture().getStatus() == com.mundial2026.backend.tournament.domain.FixtureStatus.FINISHED) {
            throw new BusinessRuleException("La porra ya está bloqueada: el partido ha finalizado");
        }
        validatePredictionWindow(prediction.getLockedAt());

        prediction.setPredictedHomeScore(request.predictedHomeScore());
        prediction.setPredictedAwayScore(request.predictedAwayScore());
        prediction.setPredictedWinnerTeam(
                resolveWinner(request.predictedHomeScore(), request.predictedAwayScore(), prediction.getFixture())
        );
        prediction.setSubmittedAt(OffsetDateTime.now());

        return userPredictionRepository.save(prediction);
    }

    @Transactional(readOnly = true)
    public List<UserPrediction> findByUserId(Long userId) {
        return userPredictionRepository.findByUserIdOrderBySubmittedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public java.util.Optional<UserPrediction> findByUserIdAndFixtureId(Long userId, Long fixtureId) {
        return userPredictionRepository.findByUserIdAndFixtureId(userId, fixtureId);
    }

    @Transactional(readOnly = true)
    public long count() {
        return userPredictionRepository.count();
    }

    private void validatePredictionWindow(OffsetDateTime lockedAt) {
        if (!lockedAt.isAfter(OffsetDateTime.now())) {
            throw new BusinessRuleException("La porra ya está bloqueada. locked_at=" + lockedAt);
        }
    }

    private com.mundial2026.backend.tournament.domain.Team resolveWinner(Integer homeScore, Integer awayScore, Fixture fixture) {
        if (homeScore > awayScore) {
            return fixture.getHomeTeam();
        }
        if (awayScore > homeScore) {
            return fixture.getAwayTeam();
        }
        return null;
    }
}
