package com.mundial2026.backend.tournament.repository;

import com.mundial2026.backend.tournament.domain.Team;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TeamRepository extends JpaRepository<Team, Long> {

    List<Team> findAllByOrderByNameAsc();

    Optional<Team> findByExternalProviderId(Long externalProviderId);
}
