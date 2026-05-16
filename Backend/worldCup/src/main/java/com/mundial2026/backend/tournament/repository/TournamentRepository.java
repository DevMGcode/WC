package com.mundial2026.backend.tournament.repository;

import com.mundial2026.backend.tournament.domain.Tournament;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TournamentRepository extends JpaRepository<Tournament, Long> {
}
