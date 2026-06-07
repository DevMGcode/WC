package com.mundial2026.backend.user.service;

import com.mundial2026.backend.common.exception.BusinessRuleException;
import com.mundial2026.backend.common.exception.ResourceNotFoundException;
import com.mundial2026.backend.subscription.service.PremiumGuard;
import com.mundial2026.backend.tournament.domain.Team;
import com.mundial2026.backend.tournament.repository.TeamRepository;
import com.mundial2026.backend.user.api.dto.FavoriteTeamResponse;
import com.mundial2026.backend.user.domain.AppUser;
import com.mundial2026.backend.user.domain.UserFavoriteTeam;
import com.mundial2026.backend.user.repository.AppUserRepository;
import com.mundial2026.backend.user.repository.UserFavoriteTeamRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Gestiona los equipos favoritos del usuario.
 *
 * Reglas:
 *   - FREE puede tener hasta 3 favoritos. PREMIUM ilimitados.
 *   - Solo UN equipo puede ser principal a la vez por usuario.
 *   - El equipo principal se sincroniza con AppUser.favoriteTeam
 *     (campo unico que usan los gates de prediccion).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserFavoriteTeamService {

    public static final int FREE_MAX_FAVORITE_TEAMS = 3;

    private final UserFavoriteTeamRepository favoriteRepo;
    private final AppUserRepository userRepo;
    private final TeamRepository teamRepo;
    private final PremiumGuard premiumGuard;

    // ─── Lectura ──────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<FavoriteTeamResponse> listByUser(Long userId) {
        return favoriteRepo.findByUserIdOrderByPositionAscIdAsc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    // ─── Escritura ────────────────────────────────────────────────────────────

    /**
     * Agrega un equipo a la lista de favoritos del usuario.
     * Valida tope para Free (3 favoritos).
     */
    @Transactional
    public FavoriteTeamResponse addFavorite(Long userId, Long teamId, boolean makePrimary) {
        AppUser user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + userId));

        if (favoriteRepo.existsByUserIdAndTeamId(userId, teamId)) {
            throw new BusinessRuleException("El equipo ya esta en tus favoritos");
        }

        // Tope para Free
        if (!premiumGuard.isPremium(user)) {
            long current = favoriteRepo.countByUserId(userId);
            if (current >= FREE_MAX_FAVORITE_TEAMS) {
                throw new BusinessRuleException(
                        "Como usuario gratuito solo puedes tener hasta " +
                                FREE_MAX_FAVORITE_TEAMS + " equipos favoritos. " +
                                "Hazte Premium para agregar mas."
                );
            }
        }

        Team team = teamRepo.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Equipo no encontrado: " + teamId));

        UserFavoriteTeam fav = new UserFavoriteTeam();
        fav.setUser(user);
        fav.setTeam(team);
        fav.setIsPrimary(false);
        fav.setPosition((int) favoriteRepo.countByUserId(userId));

        UserFavoriteTeam saved = favoriteRepo.save(fav);
        log.info("Favorito agregado userId={} teamId={}", userId, teamId);

        // Si es el primero del usuario o se pidio makePrimary, marcarlo como principal
        boolean isFirst = favoriteRepo.countByUserId(userId) == 1;
        if (makePrimary || isFirst) {
            setPrimaryInternal(user, saved);
        }

        return toResponse(saved);
    }

    /**
     * Quita un equipo de los favoritos del usuario.
     * Si el equipo era el principal, dejamos al usuario sin principal
     * (el frontend puede pedirle elegir otro).
     */
    @Transactional
    public void removeFavorite(Long userId, Long teamId) {
        AppUser user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + userId));

        UserFavoriteTeam fav = favoriteRepo.findByUserIdAndTeamId(userId, teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Favorito no encontrado"));

        boolean wasPrimary = Boolean.TRUE.equals(fav.getIsPrimary());

        favoriteRepo.delete(fav);
        log.info("Favorito eliminado userId={} teamId={}", userId, teamId);

        if (wasPrimary) {
            user.setFavoriteTeam(null);
            userRepo.save(user);
            log.info("Equipo principal removido de userId={} (favorito eliminado)", userId);
        }
    }

    /**
     * Marca un equipo como principal (estrella). Debe ya estar en favoritos.
     * Si es Free y todavia no tenia este equipo como favorito, el frontend
     * deberia llamar primero addFavorite.
     */
    @Transactional
    public FavoriteTeamResponse setPrimary(Long userId, Long teamId) {
        AppUser user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + userId));

        UserFavoriteTeam fav = favoriteRepo.findByUserIdAndTeamId(userId, teamId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Primero agrega el equipo a tus favoritos antes de marcarlo como principal"
                ));

        setPrimaryInternal(user, fav);
        return toResponse(fav);
    }

    /**
     * Logica compartida para marcar un favorito como principal:
     *   1. Desmarca cualquier otro principal del mismo usuario.
     *   2. Marca este favorito como principal.
     *   3. Sincroniza AppUser.favoriteTeam (campo unico) con el equipo.
     */
    private void setPrimaryInternal(AppUser user, UserFavoriteTeam fav) {
        // 1. Limpiar principal anterior
        favoriteRepo.clearPrimaryForUser(user.getId());

        // 2. Refrescar el favorito (puede estar stale tras el UPDATE de arriba)
        UserFavoriteTeam current = favoriteRepo.findById(fav.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Favorito desaparecido tras clearPrimary"));
        current.setIsPrimary(true);
        favoriteRepo.save(current);

        // 3. Sincronizar con AppUser.favoriteTeam para que los gates de prediccion lo vean
        user.setFavoriteTeam(current.getTeam());
        userRepo.save(user);

        log.info("Equipo principal seteado userId={} teamId={}", user.getId(), current.getTeam().getId());
    }

    // ─── Mapper ───────────────────────────────────────────────────────────────

    private FavoriteTeamResponse toResponse(UserFavoriteTeam fav) {
        Team team = fav.getTeam();
        return new FavoriteTeamResponse(
                team.getId(),
                team.getName(),
                team.getShortName(),
                team.getFifaCode(),
                team.getFlagUrl(),
                fav.getIsPrimary(),
                fav.getPosition()
        );
    }
}
