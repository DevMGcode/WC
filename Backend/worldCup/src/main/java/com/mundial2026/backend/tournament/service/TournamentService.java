package com.mundial2026.backend.tournament.service;

import com.mundial2026.backend.common.exception.ResourceNotFoundException;
import com.mundial2026.backend.tournament.domain.Fixture;
import com.mundial2026.backend.tournament.domain.FixtureStatus;
import com.mundial2026.backend.tournament.domain.Tournament;
import com.mundial2026.backend.tournament.repository.FixtureRepository;
import com.mundial2026.backend.tournament.repository.TournamentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TournamentService {

    private final TournamentRepository tournamentRepository;
    private final FixtureRepository fixtureRepository;

    @Transactional(readOnly = true)
    public List<Tournament> findAllTournaments() {
        return tournamentRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Tournament findTournamentById(Long id) {
        return tournamentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Torneo no encontrado con id=" + id));
    }

    @Transactional(readOnly = true)
    public List<Fixture> findLiveFixtures() {
        return fixtureRepository.findByStatusOrderByKickoffAtAsc(FixtureStatus.LIVE);
    }

    @Transactional(readOnly = true)
    public Fixture findFixtureById(Long id) {
        return fixtureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Partido no encontrado con id=" + id));
    }
}
