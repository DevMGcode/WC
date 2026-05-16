package com.mundial2026.backend.tournament.service;

import com.mundial2026.backend.tournament.domain.Team;
import com.mundial2026.backend.tournament.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamRepository teamRepository;

    @Transactional(readOnly = true)
    public List<Team> findAllTeams() {
        return teamRepository.findAllByOrderByNameAsc();
    }
}