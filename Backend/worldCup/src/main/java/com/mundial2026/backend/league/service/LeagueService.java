package com.mundial2026.backend.league.service;

import com.mundial2026.backend.common.exception.BusinessRuleException;
import com.mundial2026.backend.common.exception.ResourceNotFoundException;
import com.mundial2026.backend.league.api.dto.CreateLeagueRequest;
import com.mundial2026.backend.league.api.dto.DeleteLeagueRequest;
import com.mundial2026.backend.league.api.dto.JoinLeagueRequest;
import com.mundial2026.backend.league.api.dto.LeagueMemberResponse;
import com.mundial2026.backend.league.api.dto.LeagueRankingResponse;
import com.mundial2026.backend.league.api.dto.LeagueResponse;
import com.mundial2026.backend.league.api.dto.LeaveLeagueRequest;
import com.mundial2026.backend.league.api.dto.TransferLeagueOwnershipRequest;
import com.mundial2026.backend.league.domain.LeagueMemberRole;
import com.mundial2026.backend.league.domain.PrivateLeague;
import com.mundial2026.backend.league.domain.PrivateLeagueMember;
import com.mundial2026.backend.league.repository.PrivateLeagueMemberRepository;
import com.mundial2026.backend.league.repository.PrivateLeagueRepository;
import com.mundial2026.backend.scoring.service.ScoringService;
import com.mundial2026.backend.tournament.domain.Tournament;
import com.mundial2026.backend.tournament.repository.TournamentRepository;
import com.mundial2026.backend.user.domain.AppUser;
import com.mundial2026.backend.user.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeagueService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final String ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    private final PrivateLeagueRepository privateLeagueRepository;
    private final PrivateLeagueMemberRepository privateLeagueMemberRepository;
    private final TournamentRepository tournamentRepository;
    private final AppUserRepository appUserRepository;
    private final ScoringService scoringService;

    @Transactional
    public LeagueResponse create(CreateLeagueRequest request) {
        AppUser owner = findUser(request.userId());
        Tournament tournament = findTournament(request.tournamentId());

        PrivateLeague league = new PrivateLeague();
        league.setOwner(owner);
        league.setTournament(tournament);
        league.setName(request.name().trim());
        league.setDescription(request.description());
        league.setIsPublic(request.isPublic() == null || request.isPublic());
        league.setMaxMembers(request.maxMembers());
        league.setCode(generateUniqueCode());

        league = privateLeagueRepository.save(league);
        addMember(league, owner, LeagueMemberRole.OWNER);

        return toResponse(league);
    }

    @Transactional(readOnly = true)
    public List<LeagueResponse> findAll() {
        return privateLeagueRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public LeagueResponse findById(Long id) {
        return toResponse(findLeague(id));
    }

    @Transactional(readOnly = true)
    public List<LeagueResponse> findByUserId(Long userId) {
        return privateLeagueMemberRepository.findByUserIdOrderByJoinedAtDesc(userId).stream()
                .map(member -> member.getLeague())
                .distinct()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<LeagueMemberResponse> findMembers(Long leagueId) {
        return privateLeagueMemberRepository.findByLeagueIdOrderByJoinedAtAsc(leagueId).stream()
                .map(this::toMemberResponse)
                .toList();
    }

    @Transactional
    public LeagueMemberResponse join(JoinLeagueRequest request) {
        AppUser user = findUser(request.userId());
        PrivateLeague league = privateLeagueRepository.findByCode(request.leagueCode().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Liga no encontrada con código=" + request.leagueCode()));

        ensureCanJoin(league, user.getId());

        PrivateLeagueMember member = addMember(league, user, LeagueMemberRole.MEMBER);
        return toMemberResponse(member);
    }

    @Transactional
    public void leave(Long leagueId, LeaveLeagueRequest request) {
        PrivateLeague league = findLeague(leagueId);
        PrivateLeagueMember member = privateLeagueMemberRepository.findByLeagueIdAndUserId(leagueId, request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("El usuario no pertenece a la liga"));

        if (LeagueMemberRole.OWNER.name().equals(member.getRole())) {
            throw new BusinessRuleException("El propietario no puede salir de su propia liga");
        }

        privateLeagueMemberRepository.deleteByLeagueIdAndUserId(leagueId, request.userId());
    }

    @Transactional
    public LeagueResponse transferOwnership(Long leagueId, TransferLeagueOwnershipRequest request) {
        PrivateLeague league = findLeague(leagueId);

        if (!league.getOwner().getId().equals(request.currentOwnerUserId())) {
            throw new BusinessRuleException("Solo el propietario actual puede transferir la propiedad de la liga");
        }

        if (request.currentOwnerUserId().equals(request.newOwnerUserId())) {
            throw new BusinessRuleException("Debes seleccionar otro miembro para transferir la propiedad");
        }

        PrivateLeagueMember currentOwnerMember = privateLeagueMemberRepository
                .findByLeagueIdAndUserId(leagueId, request.currentOwnerUserId())
                .orElseThrow(() -> new ResourceNotFoundException("El propietario actual no pertenece a la liga"));

        PrivateLeagueMember newOwnerMember = privateLeagueMemberRepository
                .findByLeagueIdAndUserId(leagueId, request.newOwnerUserId())
                .orElseThrow(() -> new BusinessRuleException("El nuevo propietario debe pertenecer a la liga"));

        currentOwnerMember.setRole(LeagueMemberRole.MEMBER.name());
        newOwnerMember.setRole(LeagueMemberRole.OWNER.name());
        league.setOwner(newOwnerMember.getUser());

        privateLeagueMemberRepository.save(currentOwnerMember);
        privateLeagueMemberRepository.save(newOwnerMember);
        privateLeagueRepository.save(league);

        return toResponse(league);
    }

    @Transactional
    public void delete(Long leagueId, DeleteLeagueRequest request) {
        PrivateLeague league = findLeague(leagueId);

        if (!league.getOwner().getId().equals(request.ownerUserId())) {
            throw new BusinessRuleException("Solo el propietario puede eliminar la liga");
        }

        long membersCount = privateLeagueMemberRepository.countByLeagueId(leagueId);
        if (membersCount > 1) {
            throw new BusinessRuleException("No puedes eliminar la liga mientras tenga más miembros. Transfiere la propiedad o gestiona los miembros primero");
        }

        privateLeagueRepository.delete(league);
    }

    @Transactional(readOnly = true)
    public List<LeagueRankingResponse> findRanking(Long leagueId) {
        PrivateLeague league = findLeague(leagueId);
        List<PrivateLeagueMember> members = privateLeagueMemberRepository.findByLeagueIdOrderByJoinedAtAsc(leagueId);
        Set<Long> memberIds = members.stream().map(member -> member.getUser().getId()).collect(Collectors.toSet());

        return scoringService.getLeagueRanking(
                        league.getId(),
                        league.getTournament().getId(),
                        new ArrayList<>(memberIds)
                ).stream()
                .toList();
    }

    private PrivateLeague findLeague(Long id) {
        return privateLeagueRepository.findWithRelationsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Liga no encontrada con id=" + id));
    }

    private AppUser findUser(Long userId) {
        return appUserRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id=" + userId));
    }

    private Tournament findTournament(Long tournamentId) {
        return tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new ResourceNotFoundException("Torneo no encontrado con id=" + tournamentId));
    }

    private void ensureCanJoin(PrivateLeague league, Long userId) {
        if (privateLeagueMemberRepository.existsByLeagueIdAndUserId(league.getId(), userId)) {
            throw new BusinessRuleException("El usuario ya pertenece a esta liga");
        }

        if (league.getMaxMembers() != null && privateLeagueMemberRepository.countByLeagueId(league.getId()) >= league.getMaxMembers()) {
            throw new BusinessRuleException("La liga ya alcanzó el máximo de miembros");
        }
    }

    private PrivateLeagueMember addMember(PrivateLeague league, AppUser user, LeagueMemberRole role) {
        PrivateLeagueMember member = new PrivateLeagueMember();
        member.setLeague(league);
        member.setUser(user);
        member.setRole(role.name());
        return privateLeagueMemberRepository.save(member);
    }

    private LeagueResponse toResponse(PrivateLeague league) {
        return new LeagueResponse(
                league.getId(),
                league.getName(),
                league.getCode(),
                league.getOwner().getId(),
                league.getTournament().getId(),
                league.getTournament().getName(),
                league.getDescription(),
                league.getIsPublic(),
                league.getMaxMembers(),
                privateLeagueMemberRepository.countByLeagueId(league.getId()),
                league.getCreatedAt(),
                league.getUpdatedAt()
        );
    }

    private LeagueMemberResponse toMemberResponse(PrivateLeagueMember member) {
        return new LeagueMemberResponse(
                member.getId(),
                member.getLeague().getId(),
                member.getUser().getId(),
                member.getUser().getUsername(),
                member.getUser().getFirstName() + " " + member.getUser().getLastName(),
                member.getRole(),
                member.getJoinedAt()
        );
    }

    private String generateUniqueCode() {
        String code;
        do {
            code = generateCode();
        } while (privateLeagueRepository.existsByCode(code));
        return code;
    }

    private String generateCode() {
        StringBuilder builder = new StringBuilder();
        for (int i = 0; i < 8; i++) {
            builder.append(ALPHABET.charAt(SECURE_RANDOM.nextInt(ALPHABET.length())));
        }
        return builder.toString();
    }
}
