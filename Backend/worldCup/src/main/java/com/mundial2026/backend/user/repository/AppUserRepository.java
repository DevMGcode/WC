package com.mundial2026.backend.user.repository;

import com.mundial2026.backend.user.domain.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByUsername(String username);
    Optional<AppUser> findByEmail(String email);
    Optional<AppUser> findByVerificationToken(String verificationToken);
    Optional<AppUser> findByPasswordResetToken(String passwordResetToken);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);

    /**
     * Usuarios cuyo equipo favorito está entre los dados y que tienen activado
     * el recordatorio de partidos. Para el push "tu equipo juega pronto".
     */
    List<AppUser> findByFavoriteTeamIdInAndNotifyFixtureRemindersTrue(List<Long> teamIds);
}
