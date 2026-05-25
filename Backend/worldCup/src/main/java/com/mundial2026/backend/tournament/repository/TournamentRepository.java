package com.mundial2026.backend.tournament.repository;

import com.mundial2026.backend.tournament.domain.Tournament;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TournamentRepository extends JpaRepository<Tournament, Long> {

    Optional<Tournament> findByCode(String code);
}
