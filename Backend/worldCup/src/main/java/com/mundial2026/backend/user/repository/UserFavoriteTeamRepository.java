package com.mundial2026.backend.user.repository;

import com.mundial2026.backend.user.domain.UserFavoriteTeam;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserFavoriteTeamRepository extends JpaRepository<UserFavoriteTeam, Long> {

    @EntityGraph(attributePaths = {"team"})
    List<UserFavoriteTeam> findByUserIdOrderByPositionAscIdAsc(Long userId);

    long countByUserId(Long userId);

    Optional<UserFavoriteTeam> findByUserIdAndTeamId(Long userId, Long teamId);

    boolean existsByUserIdAndTeamId(Long userId, Long teamId);

    Optional<UserFavoriteTeam> findByUserIdAndIsPrimaryTrue(Long userId);

    /** Desmarca cualquier "principal" actual del usuario (se llama antes de marcar uno nuevo). */
    @Modifying
    @Query("UPDATE UserFavoriteTeam f SET f.isPrimary = false WHERE f.user.id = :userId AND f.isPrimary = true")
    void clearPrimaryForUser(@Param("userId") Long userId);

    void deleteByUserIdAndTeamId(Long userId, Long teamId);
}
