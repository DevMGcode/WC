package com.mundial2026.backend.scoring.service;

import com.mundial2026.backend.common.exception.ResourceNotFoundException;
import com.mundial2026.backend.common.response.PaginatedResponse;
import com.mundial2026.backend.league.api.dto.LeagueRankingResponse;
import com.mundial2026.backend.prediction.domain.UserPrediction;
import com.mundial2026.backend.prediction.repository.UserPredictionRepository;
import com.mundial2026.backend.scoring.api.dto.PredictionScoreResponse;
import com.mundial2026.backend.scoring.api.dto.UserRankPositionResponse;
import com.mundial2026.backend.scoring.api.dto.UserTournamentScoreResponse;
import com.mundial2026.backend.subscription.service.PremiumGuard;
import com.mundial2026.backend.tournament.domain.Fixture;
import com.mundial2026.backend.tournament.domain.FixtureStatus;
import com.mundial2026.backend.user.domain.AppUser;
import com.mundial2026.backend.user.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScoringService {

    private final UserPredictionRepository userPredictionRepository;
    private final AppUserRepository appUserRepository;
    private final PremiumGuard premiumGuard;

    @Transactional(readOnly = true)
    public UserTournamentScoreResponse getUserScore(Long tournamentId, Long userId) {
        UserTournamentScoreResponse score = calculateTournamentRanking(tournamentId).stream()
                .filter(entry -> entry.userId().equals(userId))
                .findFirst()
                .orElseGet(() -> buildEmptyScore(userId, tournamentId));

        return score;
    }

    @Transactional(readOnly = true)
    public List<PredictionScoreResponse> getPredictionScoreHistory(Long tournamentId, Long userId) {
        return userPredictionRepository.findByUserIdAndFixtureTournamentIdOrderBySubmittedAtDesc(userId, tournamentId)
                .stream()
                .map(this::toPredictionScoreResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PaginatedResponse<UserTournamentScoreResponse> getGlobalRanking(Long tournamentId, int page, int pageSize) {
        List<UserTournamentScoreResponse> ranking = calculateTournamentRanking(tournamentId);
        int safePageSize = Math.max(pageSize, 1);
        int total = ranking.size();
        int totalPages = total == 0 ? 0 : (int) Math.ceil((double) total / safePageSize);
        int safePage = Math.max(page, 0);
        int fromIndex = Math.min(safePage * safePageSize, total);
        int toIndex = Math.min(fromIndex + safePageSize, total);

        return new PaginatedResponse<>(
                ranking.subList(fromIndex, toIndex),
                new PaginatedResponse.Pagination(safePage, safePageSize, total, totalPages)
        );
    }

    @Transactional(readOnly = true)
    public UserRankPositionResponse getUserRankPosition(Long tournamentId, Long userId) {
        List<UserTournamentScoreResponse> ranking = calculateTournamentRanking(tournamentId);
        int index = -1;

        for (int i = 0; i < ranking.size(); i++) {
            if (ranking.get(i).userId().equals(userId)) {
                index = i;
                break;
            }
        }

        return new UserRankPositionResponse(index >= 0 ? index + 1 : ranking.size() + 1, ranking.size());
    }

    @Transactional(readOnly = true)
    public List<LeagueRankingResponse> getLeagueRanking(Long leagueId, Long tournamentId, List<Long> memberIds) {
        Map<Long, UserTournamentScoreResponse> scoresByUser = calculateTournamentRanking(tournamentId).stream()
                .collect(Collectors.toMap(UserTournamentScoreResponse::userId, score -> score));

        List<LeagueRankingResponse> ranking = new ArrayList<>();
        for (Long memberId : memberIds) {
            UserTournamentScoreResponse score = scoresByUser.getOrDefault(memberId, buildEmptyScore(memberId, tournamentId));
            ranking.add(new LeagueRankingResponse(
                    0,
                    score.userId(),
                    score.username(),
                    score.fullName(),
                    score.totalPoints(),
                    score.exactScores(),
                    score.winnerHits(),
                    score.bonusPoints(),
                    score.matchesScored(),
                    score.lastScoredAt(),
                    premiumGuard.isPremium(score.userId())
            ));
        }

        ranking.sort(Comparator
                .comparing(LeagueRankingResponse::totalPoints, Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(LeagueRankingResponse::exactScores, Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(LeagueRankingResponse::winnerHits, Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(LeagueRankingResponse::fullName, Comparator.nullsLast(String::compareToIgnoreCase)));

        List<LeagueRankingResponse> withPositions = new ArrayList<>();
        for (int i = 0; i < ranking.size(); i++) {
            LeagueRankingResponse entry = ranking.get(i);
            withPositions.add(new LeagueRankingResponse(
                    i + 1,
                    entry.userId(),
                    entry.username(),
                    entry.fullName(),
                    entry.totalPoints(),
                    entry.exactScores(),
                    entry.winnerHits(),
                    entry.bonusPoints(),
                    entry.matchesScored(),
                    entry.lastScoredAt(),
                    entry.isPremium()
            ));
        }

        return withPositions;
    }

    private List<UserTournamentScoreResponse> calculateTournamentRanking(Long tournamentId) {
        List<UserPrediction> predictions = userPredictionRepository.findByFixtureTournamentIdOrderBySubmittedAtDesc(tournamentId);
        Map<Long, ScoreAccumulator> accumulatorMap = new LinkedHashMap<>();

        for (UserPrediction prediction : predictions) {
            Fixture fixture = prediction.getFixture();
            Integer homeScore = fixture.getHomeScore();
            Integer awayScore = fixture.getAwayScore();
            if (fixture.getStatus() != FixtureStatus.FINISHED || homeScore == null || awayScore == null) {
                continue;
            }

            long userId = prediction.getUser().getId();
            ScoreAccumulator accumulator = accumulatorMap.computeIfAbsent(userId, id -> new ScoreAccumulator(prediction.getUser(), tournamentId));
            accumulator.matchesScored++;
            accumulator.lastScoredAt = prediction.getSubmittedAt();

            int points = calculatePoints(prediction.getPredictedHomeScore(), prediction.getPredictedAwayScore(), homeScore, awayScore);
            accumulator.totalPoints += points;

            if (points == 3) {
                accumulator.exactScores++;
            } else if (points == 1) {
                accumulator.winnerHits++;
            }
        }

        List<UserTournamentScoreResponse> ranking = accumulatorMap.values().stream()
                .map(acc -> acc.toResponse(premiumGuard.isPremium(acc.user.getId())))
                .sorted(Comparator
                        .comparing(UserTournamentScoreResponse::totalPoints, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(UserTournamentScoreResponse::exactScores, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(UserTournamentScoreResponse::winnerHits, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(UserTournamentScoreResponse::fullName, Comparator.nullsLast(String::compareToIgnoreCase)))
                .toList();

        List<UserTournamentScoreResponse> withPositions = new ArrayList<>();
        for (int i = 0; i < ranking.size(); i++) {
            UserTournamentScoreResponse entry = ranking.get(i);
            withPositions.add(new UserTournamentScoreResponse(
                    entry.userId(),
                    entry.username(),
                    entry.fullName(),
                    entry.tournamentId(),
                    entry.totalPoints(),
                    entry.exactScores(),
                    entry.winnerHits(),
                    entry.bonusPoints(),
                    entry.matchesScored(),
                    i + 1,
                    entry.lastScoredAt(),
                    entry.isPremium()
            ));
        }

        return withPositions;
    }

    private PredictionScoreResponse toPredictionScoreResponse(UserPrediction prediction) {
        Fixture fixture = prediction.getFixture();
        int points = 0;
        String ruleCode = "PENDING";

        if (fixture.getStatus() == FixtureStatus.FINISHED && fixture.getHomeScore() != null && fixture.getAwayScore() != null) {
            points = calculatePoints(prediction.getPredictedHomeScore(), prediction.getPredictedAwayScore(), fixture.getHomeScore(), fixture.getAwayScore());
            ruleCode = points == 3 ? "EXACT_SCORE" : points == 1 ? "WINNER_ONLY" : "PARTIAL";
        }

        return new PredictionScoreResponse(
                prediction.getId(),
                prediction.getUser().getId(),
                prediction.getUser().getUsername(),
                fixture.getId(),
                fixture.getName(),
                fixture.getTournament().getId(),
                points,
                ruleCode,
                prediction.getSubmittedAt()
        );
    }

    private UserTournamentScoreResponse buildEmptyScore(Long userId, Long tournamentId) {
        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id=" + userId));

        return new UserTournamentScoreResponse(
                user.getId(),
                user.getUsername(),
                formatFullName(user),
                tournamentId,
                0,
                0,
                0,
                0,
                0,
                1,
                OffsetDateTime.now(),
                premiumGuard.isPremium(user.getId())
        );
    }

    private int calculatePoints(int predictedHomeScore, int predictedAwayScore, int actualHomeScore, int actualAwayScore) {
        boolean exactScore = predictedHomeScore == actualHomeScore && predictedAwayScore == actualAwayScore;
        if (exactScore) {
            return 3;
        }

        boolean predictedHomeWin = predictedHomeScore > predictedAwayScore;
        boolean predictedAwayWin = predictedAwayScore > predictedHomeScore;
        boolean predictedDraw = predictedHomeScore == predictedAwayScore;

        boolean actualHomeWin = actualHomeScore > actualAwayScore;
        boolean actualAwayWin = actualAwayScore > actualHomeScore;
        boolean actualDraw = actualHomeScore == actualAwayScore;

        if ((predictedHomeWin && actualHomeWin) || (predictedAwayWin && actualAwayWin) || (predictedDraw && actualDraw)) {
            return 1;
        }

        return 0;
    }

    private String formatFullName(AppUser user) {
        return user.getFirstName() + " " + user.getLastName();
    }

    private static class ScoreAccumulator {
        private final AppUser user;
        private final Long tournamentId;
        private int totalPoints;
        private int exactScores;
        private int winnerHits;
        private int bonusPoints;
        private int matchesScored;
        private OffsetDateTime lastScoredAt;

        private ScoreAccumulator(AppUser user, Long tournamentId) {
            this.user = user;
            this.tournamentId = tournamentId;
        }

        private UserTournamentScoreResponse toResponse(boolean isPremium) {
            return new UserTournamentScoreResponse(
                    user.getId(),
                    user.getUsername(),
                    user.getFirstName() + " " + user.getLastName(),
                    tournamentId,
                    totalPoints,
                    exactScores,
                    winnerHits,
                    bonusPoints,
                    matchesScored,
                    0,
                    lastScoredAt,
                    isPremium
            );
        }
    }
}
