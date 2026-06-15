package com.mundial2026.backend.prediction.repository;

import com.mundial2026.backend.prediction.domain.UserPrediction;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserPredictionRepository extends JpaRepository<UserPrediction, Long> {

    // Carga user y fixture de forma anticipada (EntityGraph): el resultado se
    // mapea fuera de la transacción en PredictionController.findByFixture, y sin
    // esto los proxies lazy lanzaban LazyInitializationException → 500 en prod.
    @EntityGraph(attributePaths = {"user", "fixture"})
    Optional<UserPrediction> findByUserIdAndFixtureId(Long userId, Long fixtureId);

    /** Cuántas predicciones lleva un usuario en total (para limitar al plan FREE). */
    long countByUserId(Long userId);

    @EntityGraph(attributePaths = {"user", "fixture"})
    Optional<UserPrediction> findWithUserAndFixtureById(Long id);

    @EntityGraph(attributePaths = {"user", "fixture"})
    List<UserPrediction> findByUserIdOrderBySubmittedAtDesc(Long userId);

    @Query("""
            select p from UserPrediction p
            join fetch p.user u
            join fetch p.fixture f
            join fetch f.homeTeam
            join fetch f.awayTeam
            where f.tournament.id = :tournamentId
            order by p.submittedAt desc
            """)
    List<UserPrediction> findByFixtureTournamentIdOrderBySubmittedAtDesc(@Param("tournamentId") Long tournamentId);

    @Query("""
            select p from UserPrediction p
            join fetch p.user u
            join fetch p.fixture f
            join fetch f.homeTeam
            join fetch f.awayTeam
            where p.user.id = :userId and f.tournament.id = :tournamentId
            order by p.submittedAt desc
            """)
    List<UserPrediction> findByUserIdAndFixtureTournamentIdOrderBySubmittedAtDesc(
            @Param("userId") Long userId,
            @Param("tournamentId") Long tournamentId
    );
}
