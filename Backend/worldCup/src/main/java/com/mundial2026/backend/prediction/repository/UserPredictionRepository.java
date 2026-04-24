package com.mundial2026.backend.prediction.repository;

import com.mundial2026.backend.prediction.domain.UserPrediction;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserPredictionRepository extends JpaRepository<UserPrediction, Long> {

    Optional<UserPrediction> findByUserIdAndFixtureId(Long userId, Long fixtureId);

    @EntityGraph(attributePaths = {"user", "fixture"})
    Optional<UserPrediction> findWithUserAndFixtureById(Long id);

    @EntityGraph(attributePaths = {"user", "fixture"})
    List<UserPrediction> findByUserIdOrderBySubmittedAtDesc(Long userId);
}