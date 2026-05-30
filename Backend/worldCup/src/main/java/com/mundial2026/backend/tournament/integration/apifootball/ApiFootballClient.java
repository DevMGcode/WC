package com.mundial2026.backend.tournament.integration.apifootball;

import com.mundial2026.backend.common.exception.ExternalApiClientException;
import com.mundial2026.backend.common.exception.ExternalApiUnavailableException;
import com.mundial2026.backend.tournament.integration.apifootball.dto.ApiFootballEnvelope;
import com.mundial2026.backend.tournament.integration.apifootball.dto.ApiFootballSingleEnvelope;
import com.mundial2026.backend.tournament.integration.apifootball.dto.FixtureItem;
import com.mundial2026.backend.tournament.integration.apifootball.dto.LeagueItem;
import com.mundial2026.backend.tournament.integration.apifootball.dto.LineupItem;
import com.mundial2026.backend.tournament.integration.apifootball.dto.MatchEventEntryItem;
import com.mundial2026.backend.tournament.integration.apifootball.dto.MatchPlayerStatsItem;
import com.mundial2026.backend.tournament.integration.apifootball.dto.MatchStatisticsItem;
import com.mundial2026.backend.tournament.integration.apifootball.dto.PlayerStatsItem;
import com.mundial2026.backend.tournament.integration.apifootball.dto.PredictionItem;
import com.mundial2026.backend.tournament.integration.apifootball.dto.SquadItem;
import com.mundial2026.backend.tournament.integration.apifootball.dto.StandingsResponse;
import com.mundial2026.backend.tournament.integration.apifootball.dto.StatusResponse;
import com.mundial2026.backend.tournament.integration.apifootball.dto.TeamItem;
import com.mundial2026.backend.tournament.integration.apifootball.mapper.ApiFootballMapper;
import com.mundial2026.backend.tournament.integration.port.ExternalLineup;
import com.mundial2026.backend.tournament.integration.port.ExternalMatch;
import com.mundial2026.backend.tournament.integration.port.ExternalMatchEvent;
import com.mundial2026.backend.tournament.integration.port.ExternalMatchPlayerStat;
import com.mundial2026.backend.tournament.integration.port.ExternalMatchStatistic;
import com.mundial2026.backend.tournament.integration.port.ExternalPlayerStat;
import com.mundial2026.backend.tournament.integration.port.ExternalPrediction;
import com.mundial2026.backend.tournament.integration.port.ExternalSquadPlayer;
import com.mundial2026.backend.tournament.integration.port.ExternalStanding;
import com.mundial2026.backend.tournament.integration.port.ExternalTeam;
import com.mundial2026.backend.tournament.integration.port.HeadToHeadDataPort;
import com.mundial2026.backend.tournament.integration.port.LineupDataPort;
import com.mundial2026.backend.tournament.integration.port.MatchDataPort;
import com.mundial2026.backend.tournament.integration.port.MatchEventDataPort;
import com.mundial2026.backend.tournament.integration.port.MatchPlayerStatsDataPort;
import com.mundial2026.backend.tournament.integration.port.MatchStatisticsDataPort;
import com.mundial2026.backend.tournament.integration.port.PlayerDataPort;
import com.mundial2026.backend.tournament.integration.port.PredictionDataPort;
import com.mundial2026.backend.tournament.integration.port.StandingsDataPort;
import com.mundial2026.backend.tournament.integration.port.TeamDataPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriBuilder;

import java.net.URI;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Function;

@Component
@RequiredArgsConstructor
@Slf4j
public class ApiFootballClient implements MatchDataPort, TeamDataPort, StandingsDataPort, PlayerDataPort,
        LineupDataPort, HeadToHeadDataPort, PredictionDataPort,
        MatchEventDataPort, MatchStatisticsDataPort, MatchPlayerStatsDataPort {

    private static final String MDC_KEY = "externalCallId";

    private final RestClient apiFootballRestClient;
    private final ApiFootballMapper mapper;
    private final ApiFootballProperties props;

    @Override
    public List<ExternalMatch> fetchLiveMatches() {
        ApiFootballEnvelope<FixtureItem> envelope = call(uri -> uri
                        .path("/fixtures")
                        .queryParam("live", "all")
                        .queryParam("league", props.leagueId())
                        .build(),
                fixtureItemType());
        return mapper.toDomainList(envelope.response());
    }

    @Override
    public Optional<ExternalMatch> fetchById(String externalId) {
        ApiFootballEnvelope<FixtureItem> envelope = call(uri -> uri
                        .path("/fixtures")
                        .queryParam("id", externalId)
                        .build(),
                fixtureItemType());
        List<FixtureItem> items = envelope.response();
        if (items == null || items.isEmpty()) {
            return Optional.empty();
        }
        return Optional.of(mapper.toDomain(items.get(0)));
    }

    public List<ExternalMatch> fetchTournamentFixtures() {
        ApiFootballEnvelope<FixtureItem> envelope = call(uri -> uri
                        .path("/fixtures")
                        .queryParam("league", props.leagueId())
                        .queryParam("season", props.season())
                        .build(),
                fixtureItemType());
        return mapper.toDomainList(envelope.response());
    }

    @Override
    public List<ExternalTeam> fetchTournamentTeams() {
        ApiFootballEnvelope<TeamItem> envelope = call(uri -> uri
                        .path("/teams")
                        .queryParam("league", props.leagueId())
                        .queryParam("season", props.season())
                        .build(),
                teamItemType());
        return mapper.toTeamList(envelope.response());
    }

    @Override
    public List<ExternalStanding> fetchStandings() {
        ApiFootballEnvelope<StandingsResponse> envelope = call(uri -> uri
                        .path("/standings")
                        .queryParam("league", props.leagueId())
                        .queryParam("season", props.season())
                        .build(),
                standingsResponseType());
        return mapper.toStandingsList(envelope.response());
    }

    @Override
    public List<ExternalPlayerStat> fetchTopScorers() {
        ApiFootballEnvelope<PlayerStatsItem> envelope = call(uri -> uri
                        .path("/players/topscorers")
                        .queryParam("league", props.leagueId())
                        .queryParam("season", props.season())
                        .build(),
                playerStatsItemType());
        return mapper.toPlayerStatsList(envelope.response());
    }

    @Override
    public List<ExternalPlayerStat> fetchTopAssists() {
        ApiFootballEnvelope<PlayerStatsItem> envelope = call(uri -> uri
                        .path("/players/topassists")
                        .queryParam("league", props.leagueId())
                        .queryParam("season", props.season())
                        .build(),
                playerStatsItemType());
        return mapper.toPlayerStatsList(envelope.response());
    }

    @Override
    public List<ExternalSquadPlayer> fetchSquad(Long teamId) {
        ApiFootballEnvelope<SquadItem> envelope = call(uri -> uri
                        .path("/players/squads")
                        .queryParam("team", teamId)
                        .build(),
                squadItemType());
        return mapper.toSquadList(envelope.response());
    }

    @Override
    public List<ExternalLineup> fetchLineupsByFixture(Long fixtureId) {
        ApiFootballEnvelope<LineupItem> envelope = call(uri -> uri
                        .path("/fixtures/lineups")
                        .queryParam("fixture", fixtureId)
                        .build(),
                lineupItemType());
        return mapper.toLineupList(envelope.response());
    }

    @Override
    public List<ExternalMatch> fetchHeadToHead(Long homeTeamId, Long awayTeamId, int last) {
        ApiFootballEnvelope<FixtureItem> envelope = call(uri -> uri
                        .path("/fixtures/headtohead")
                        .queryParam("h2h", homeTeamId + "-" + awayTeamId)
                        .queryParam("last", last)
                        .build(),
                fixtureItemType());
        return mapper.toDomainList(envelope.response());
    }

    @Override
    public Optional<ExternalPrediction> fetchPredictionByFixture(Long fixtureId) {
        ApiFootballEnvelope<PredictionItem> envelope = call(uri -> uri
                        .path("/predictions")
                        .queryParam("fixture", fixtureId)
                        .build(),
                predictionItemType());
        List<PredictionItem> items = envelope.response();
        if (items == null || items.isEmpty()) {
            return Optional.empty();
        }
        return mapper.toPrediction(items.get(0));
    }

    @Override
    public List<ExternalMatchEvent> fetchEventsByFixture(Long fixtureId) {
        ApiFootballEnvelope<MatchEventEntryItem> envelope = call(uri -> uri
                        .path("/fixtures/events")
                        .queryParam("fixture", fixtureId)
                        .build(),
                matchEventType());
        return mapper.toMatchEventList(envelope.response());
    }

    @Override
    public List<ExternalMatchStatistic> fetchStatisticsByFixture(Long fixtureId) {
        ApiFootballEnvelope<MatchStatisticsItem> envelope = call(uri -> uri
                        .path("/fixtures/statistics")
                        .queryParam("fixture", fixtureId)
                        .build(),
                matchStatisticsType());
        return mapper.toMatchStatisticsList(envelope.response());
    }

    @Override
    public List<ExternalMatchPlayerStat> fetchPlayerStatsByFixture(Long fixtureId) {
        ApiFootballEnvelope<MatchPlayerStatsItem> envelope = call(uri -> uri
                        .path("/fixtures/players")
                        .queryParam("fixture", fixtureId)
                        .build(),
                matchPlayerStatsType());
        return mapper.toMatchPlayerStatsList(envelope.response());
    }

    public Optional<LeagueItem> fetchLeagueCoverage() {
        ApiFootballEnvelope<LeagueItem> envelope = call(uri -> uri
                        .path("/leagues")
                        .queryParam("id", props.leagueId())
                        .queryParam("season", props.season())
                        .build(),
                leagueItemType());
        List<LeagueItem> items = envelope.response();
        if (items == null || items.isEmpty()) {
            return Optional.empty();
        }
        return Optional.of(items.get(0));
    }

    public Optional<StatusResponse> fetchAccountStatus() {
        // /status is the one endpoint where `response` is a single object, not a list.
        ApiFootballSingleEnvelope<StatusResponse> envelope = callSingle(
                uri -> uri.path("/status").build(),
                statusSingleType());
        return Optional.ofNullable(envelope.response());
    }

    private <T> ApiFootballSingleEnvelope<T> callSingle(Function<UriBuilder, URI> uriFn,
                                                        ParameterizedTypeReference<ApiFootballSingleEnvelope<T>> typeRef) {
        MDC.put(MDC_KEY, UUID.randomUUID().toString());
        try {
            ApiFootballSingleEnvelope<T> envelope = apiFootballRestClient.get()
                    .uri(uriFn)
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, (req, res) -> {
                        throw new ExternalApiClientException(
                                res.getStatusCode(),
                                "API-Football client error: " + res.getStatusCode());
                    })
                    .body(typeRef);
            if (envelope == null) {
                throw new ExternalApiUnavailableException("Empty body from API-Football", null);
            }
            if (hasErrors(envelope.errors())) {
                log.warn("API-Football returned errors: {}", envelope.errors());
                throw new ExternalApiClientException(
                        HttpStatusCode.valueOf(400),
                        "API-Football errors: " + envelope.errors());
            }
            return envelope;
        } catch (ResourceAccessException ex) {
            throw new ExternalApiUnavailableException("Timeout or network error reaching API-Football", ex);
        } finally {
            MDC.remove(MDC_KEY);
        }
    }

    private <T> ApiFootballEnvelope<T> call(Function<UriBuilder, URI> uriFn,
                                            ParameterizedTypeReference<ApiFootballEnvelope<T>> typeRef) {
        MDC.put(MDC_KEY, UUID.randomUUID().toString());
        try {
            ApiFootballEnvelope<T> envelope = apiFootballRestClient.get()
                    .uri(uriFn)
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, (req, res) -> {
                        throw new ExternalApiClientException(
                                res.getStatusCode(),
                                "API-Football client error: " + res.getStatusCode());
                    })
                    .body(typeRef);

            if (envelope == null) {
                throw new ExternalApiUnavailableException("Empty body from API-Football", null);
            }
            if (hasErrors(envelope.errors())) {
                log.warn("API-Football returned errors: {}", envelope.errors());
                throw new ExternalApiClientException(
                        HttpStatusCode.valueOf(400),
                        "API-Football errors: " + envelope.errors());
            }
            return envelope;
        } catch (ResourceAccessException ex) {
            throw new ExternalApiUnavailableException("Timeout or network error reaching API-Football", ex);
        } finally {
            MDC.remove(MDC_KEY);
        }
    }

    private boolean hasErrors(Object errors) {
        if (errors == null) {
            return false;
        }
        if (errors instanceof Collection<?> c) {
            return !c.isEmpty();
        }
        if (errors instanceof Map<?, ?> m) {
            return !m.isEmpty();
        }
        return false;
    }

    private static ParameterizedTypeReference<ApiFootballEnvelope<FixtureItem>> fixtureItemType() {
        return new ParameterizedTypeReference<>() {
        };
    }

    private static ParameterizedTypeReference<ApiFootballEnvelope<TeamItem>> teamItemType() {
        return new ParameterizedTypeReference<>() {
        };
    }

    private static ParameterizedTypeReference<ApiFootballEnvelope<LeagueItem>> leagueItemType() {
        return new ParameterizedTypeReference<>() {
        };
    }

    private static ParameterizedTypeReference<ApiFootballSingleEnvelope<StatusResponse>> statusSingleType() {
        return new ParameterizedTypeReference<>() {
        };
    }

    private static ParameterizedTypeReference<ApiFootballEnvelope<StandingsResponse>> standingsResponseType() {
        return new ParameterizedTypeReference<>() {
        };
    }

    private static ParameterizedTypeReference<ApiFootballEnvelope<PlayerStatsItem>> playerStatsItemType() {
        return new ParameterizedTypeReference<>() {
        };
    }

    private static ParameterizedTypeReference<ApiFootballEnvelope<SquadItem>> squadItemType() {
        return new ParameterizedTypeReference<>() {
        };
    }

    private static ParameterizedTypeReference<ApiFootballEnvelope<LineupItem>> lineupItemType() {
        return new ParameterizedTypeReference<>() {
        };
    }

    private static ParameterizedTypeReference<ApiFootballEnvelope<PredictionItem>> predictionItemType() {
        return new ParameterizedTypeReference<>() {
        };
    }

    private static ParameterizedTypeReference<ApiFootballEnvelope<MatchEventEntryItem>> matchEventType() {
        return new ParameterizedTypeReference<>() {
        };
    }

    private static ParameterizedTypeReference<ApiFootballEnvelope<MatchStatisticsItem>> matchStatisticsType() {
        return new ParameterizedTypeReference<>() {
        };
    }

    private static ParameterizedTypeReference<ApiFootballEnvelope<MatchPlayerStatsItem>> matchPlayerStatsType() {
        return new ParameterizedTypeReference<>() {
        };
    }
}
