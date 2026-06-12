package com.mundial2026.backend.tournament.integration.apifootball.mapper;

import com.mundial2026.backend.tournament.integration.apifootball.dto.FixtureItem;
import com.mundial2026.backend.tournament.integration.apifootball.dto.LineupItem;
import com.mundial2026.backend.tournament.integration.apifootball.dto.MatchEventEntryItem;
import com.mundial2026.backend.tournament.integration.apifootball.dto.MatchPlayerStatsItem;
import com.mundial2026.backend.tournament.integration.apifootball.dto.MatchStatisticsItem;
import com.mundial2026.backend.tournament.integration.apifootball.dto.PlayerStatsItem;
import com.mundial2026.backend.tournament.integration.apifootball.dto.PredictionItem;
import com.mundial2026.backend.tournament.integration.apifootball.dto.SquadItem;
import com.mundial2026.backend.tournament.integration.apifootball.dto.StandingsResponse;
import com.mundial2026.backend.tournament.integration.apifootball.dto.TeamItem;
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
import com.mundial2026.backend.tournament.integration.port.MatchStatus;

import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

@Component
public class ApiFootballMapper {

    public List<ExternalMatch> toDomainList(List<FixtureItem> items) {
        if (items == null) {
            return List.of();
        }
        return items.stream().map(this::toDomain).toList();
    }

    public ExternalMatch toDomain(FixtureItem item) {
        FixtureItem.FixtureBlock fixture = item.fixture();
        FixtureItem.TeamsBlock teams = item.teams();
        FixtureItem.GoalsBlock goals = item.goals();
        FixtureItem.LeagueBlock league = item.league();

        Long fixtureId = fixture != null ? fixture.id() : null;
        FixtureItem.TeamRef home = teams != null ? teams.home() : null;
        FixtureItem.TeamRef away = teams != null ? teams.away() : null;

        return new ExternalMatch(
                fixtureId != null ? fixtureId.toString() : null,
                home != null ? home.id() : null,
                home != null ? home.name() : null,
                away != null ? away.id() : null,
                away != null ? away.name() : null,
                goals != null ? goals.home() : null,
                goals != null ? goals.away() : null,
                Optional.ofNullable(fixture)
                        .map(FixtureItem.FixtureBlock::status)
                        .map(FixtureItem.StatusBlock::elapsed)
                        .orElse(null),
                Optional.ofNullable(fixture)
                        .map(FixtureItem.FixtureBlock::status)
                        .map(FixtureItem.StatusBlock::extra)
                        .orElse(null),
                mapStatus(Optional.ofNullable(fixture)
                        .map(FixtureItem.FixtureBlock::status)
                        .map(FixtureItem.StatusBlock::shortCode)
                        .orElse(null)),
                fixture != null ? fixture.date() : null,
                // venueExternalId puede ser null (estadios sin liga regular indexada,
                // ej. los de EE.UU. 2026, Qatar 2022, parte de 2018).
                Optional.ofNullable(fixture)
                        .map(FixtureItem.FixtureBlock::venue)
                        .map(FixtureItem.VenueBlock::id)
                        .orElse(null),
                Optional.ofNullable(fixture)
                        .map(FixtureItem.FixtureBlock::venue)
                        .map(FixtureItem.VenueBlock::name)
                        .orElse(null),
                Optional.ofNullable(fixture)
                        .map(FixtureItem.FixtureBlock::venue)
                        .map(FixtureItem.VenueBlock::city)
                        .orElse(null),
                league != null ? league.round() : null
        );
    }

    public List<ExternalTeam> toTeamList(List<TeamItem> items) {
        if (items == null) {
            return List.of();
        }
        return items.stream().map(this::toTeam).toList();
    }

    public ExternalTeam toTeam(TeamItem item) {
        TeamItem.TeamBlock team = item.team();
        TeamItem.VenueBlock venue = item.venue();
        return new ExternalTeam(
                team != null ? team.id() : null,
                team != null ? team.name() : null,
                team != null ? team.code() : null,
                team != null ? team.country() : null,
                team != null ? team.founded() : null,
                team != null ? team.national() : null,
                team != null ? team.logo() : null,
                venue != null ? venue.id() : null,
                venue != null ? venue.name() : null,
                venue != null ? venue.city() : null
        );
    }

    public List<ExternalStanding> toStandingsList(List<StandingsResponse> items) {
        if (items == null || items.isEmpty()) {
            return List.of();
        }
        return items.stream()
                .flatMap(r -> {
                    StandingsResponse.LeagueBlock league = r.league();
                    if (league == null || league.standings() == null) {
                        return Stream.empty();
                    }
                    return league.standings().stream().flatMap(List::stream);
                })
                .map(this::toStanding)
                .toList();
    }

    public ExternalStanding toStanding(StandingsResponse.StandingEntry e) {
        StandingsResponse.TeamRef team = e.team();
        StandingsResponse.Stats all  = e.all();
        StandingsResponse.Stats home = e.home();
        StandingsResponse.Stats away = e.away();
        return new ExternalStanding(
                stripLeaguePrefix(e.group()),
                e.rank(),
                team != null ? team.id() : null,
                team != null ? team.name() : null,
                team != null ? team.logo() : null,
                all != null ? all.played() : null,
                all != null ? all.win() : null,
                all != null ? all.draw() : null,
                all != null ? all.lose() : null,
                all != null && all.goals() != null ? all.goals().goalsFor() : null,
                all != null && all.goals() != null ? all.goals().against() : null,
                e.goalsDiff(),
                e.points(),
                e.form(),
                e.description(),
                e.update(),
                home != null ? home.played() : null,
                home != null ? home.win() : null,
                home != null ? home.draw() : null,
                home != null ? home.lose() : null,
                home != null && home.goals() != null ? home.goals().goalsFor() : null,
                home != null && home.goals() != null ? home.goals().against() : null,
                away != null ? away.played() : null,
                away != null ? away.win() : null,
                away != null ? away.draw() : null,
                away != null ? away.lose() : null,
                away != null && away.goals() != null ? away.goals().goalsFor() : null,
                away != null && away.goals() != null ? away.goals().against() : null
        );
    }

    public List<ExternalPlayerStat> toPlayerStatsList(List<PlayerStatsItem> items) {
        if (items == null) {
            return List.of();
        }
        return items.stream().map(this::toPlayerStat).toList();
    }

    public ExternalPlayerStat toPlayerStat(PlayerStatsItem item) {
        PlayerStatsItem.Player p = item.player();
        PlayerStatsItem.Statistics s = (item.statistics() != null && !item.statistics().isEmpty())
                ? item.statistics().get(0) : null;
        PlayerStatsItem.TeamRef team = s != null ? s.team() : null;
        PlayerStatsItem.Games games = s != null ? s.games() : null;
        PlayerStatsItem.Goals goals = s != null ? s.goals() : null;
        PlayerStatsItem.Shots shots = s != null ? s.shots() : null;
        PlayerStatsItem.Cards cards = s != null ? s.cards() : null;
        return new ExternalPlayerStat(
                p != null ? p.id() : null,
                p != null ? p.name() : null,
                p != null ? p.firstname() : null,
                p != null ? p.lastname() : null,
                p != null ? p.nationality() : null,
                p != null ? p.photo() : null,
                p != null ? p.age() : null,
                games != null ? games.position() : null,
                team != null ? team.id() : null,
                team != null ? team.name() : null,
                team != null ? team.logo() : null,
                games != null ? games.appearences() : null,
                games != null ? games.minutes() : null,
                goals != null ? goals.total() : null,
                goals != null ? goals.assists() : null,
                shots != null ? shots.total() : null,
                shots != null ? shots.on() : null,
                cards != null ? cards.yellow() : null,
                cards != null ? cards.red() : null,
                games != null ? games.rating() : null
        );
    }

    public List<ExternalSquadPlayer> toSquadList(List<SquadItem> items) {
        if (items == null) {
            return List.of();
        }
        return items.stream()
                .flatMap(sq -> {
                    if (sq.players() == null) {
                        return Stream.empty();
                    }
                    SquadItem.TeamRef team = sq.team();
                    return sq.players().stream().map(p -> toSquadPlayer(team, p));
                })
                .toList();
    }

    public ExternalSquadPlayer toSquadPlayer(SquadItem.TeamRef team, SquadItem.PlayerRef p) {
        return new ExternalSquadPlayer(
                team != null ? team.id() : null,
                team != null ? team.name() : null,
                p != null ? p.id() : null,
                p != null ? p.name() : null,
                p != null ? p.number() : null,
                p != null ? p.position() : null,
                p != null ? p.age() : null,
                p != null ? p.photo() : null
        );
    }

    public List<ExternalLineup> toLineupList(List<LineupItem> items) {
        if (items == null) {
            return List.of();
        }
        return items.stream().map(this::toLineup).toList();
    }

    public ExternalLineup toLineup(LineupItem item) {
        LineupItem.TeamBlock team = item.team();
        LineupItem.CoachBlock coach = item.coach();
        return new ExternalLineup(
                team != null ? team.id() : null,
                team != null ? team.name() : null,
                team != null ? team.logo() : null,
                coach != null ? coach.id() : null,
                coach != null ? coach.name() : null,
                coach != null ? coach.photo() : null,
                item.formation(),
                mapLineupPlayers(item.startXI()),
                mapLineupPlayers(item.substitutes())
        );
    }

    private List<ExternalLineup.LineupPlayer> mapLineupPlayers(List<LineupItem.PlayerWrapper> wrappers) {
        if (wrappers == null) {
            return List.of();
        }
        return wrappers.stream()
                .map(LineupItem.PlayerWrapper::player)
                .filter(p -> p != null)
                .map(p -> new ExternalLineup.LineupPlayer(
                        p.id(), p.name(), p.number(), p.pos(), p.grid()))
                .toList();
    }

    public Optional<ExternalPrediction> toPrediction(PredictionItem item) {
        if (item == null || item.predictions() == null) {
            return Optional.empty();
        }
        PredictionItem.Predictions p = item.predictions();
        PredictionItem.Winner w = p.winner();
        PredictionItem.Percent pct = p.percent();
        return Optional.of(new ExternalPrediction(
                w != null ? w.id() : null,
                w != null ? w.name() : null,
                w != null ? w.comment() : null,
                p.winOrDraw(),
                p.advice(),
                pct != null ? pct.home() : null,
                pct != null ? pct.draw() : null,
                pct != null ? pct.away() : null
        ));
    }

    public List<ExternalMatchEvent> toMatchEventList(List<MatchEventEntryItem> items) {
        if (items == null) {
            return List.of();
        }
        return items.stream().map(this::toMatchEvent).toList();
    }

    public ExternalMatchEvent toMatchEvent(MatchEventEntryItem item) {
        MatchEventEntryItem.TimeBlock time = item.time();
        MatchEventEntryItem.TeamRef team = item.team();
        MatchEventEntryItem.PlayerRef player = item.player();
        MatchEventEntryItem.PlayerRef assist = item.assist();
        return new ExternalMatchEvent(
                time != null ? time.elapsed() : null,
                time != null ? time.extra() : null,
                team != null ? team.id() : null,
                team != null ? team.name() : null,
                player != null ? player.id() : null,
                player != null ? player.name() : null,
                assist != null ? assist.id() : null,
                assist != null ? assist.name() : null,
                item.type(),
                item.detail(),
                item.comments()
        );
    }

    public List<ExternalMatchStatistic> toMatchStatisticsList(List<MatchStatisticsItem> items) {
        if (items == null) {
            return List.of();
        }
        return items.stream().map(this::toMatchStatistics).toList();
    }

    public ExternalMatchStatistic toMatchStatistics(MatchStatisticsItem item) {
        MatchStatisticsItem.TeamRef team = item.team();
        Map<String, String> stats = new LinkedHashMap<>();
        if (item.statistics() != null) {
            for (MatchStatisticsItem.StatEntry e : item.statistics()) {
                if (e.type() != null) {
                    stats.put(e.type(), e.value() != null ? e.value().toString() : null);
                }
            }
        }
        return new ExternalMatchStatistic(
                team != null ? team.id() : null,
                team != null ? team.name() : null,
                team != null ? team.logo() : null,
                stats
        );
    }

    public List<ExternalMatchPlayerStat> toMatchPlayerStatsList(List<MatchPlayerStatsItem> items) {
        if (items == null) {
            return List.of();
        }
        return items.stream()
                .flatMap(team -> {
                    if (team.players() == null) {
                        return java.util.stream.Stream.empty();
                    }
                    MatchPlayerStatsItem.TeamRef ref = team.team();
                    return team.players().stream().map(p -> toMatchPlayerStat(ref, p));
                })
                .toList();
    }

    public ExternalMatchPlayerStat toMatchPlayerStat(MatchPlayerStatsItem.TeamRef team,
                                                      MatchPlayerStatsItem.PlayerEntry entry) {
        MatchPlayerStatsItem.PlayerRef p = entry.player();
        MatchPlayerStatsItem.Statistics s = (entry.statistics() != null && !entry.statistics().isEmpty())
                ? entry.statistics().get(0) : null;
        MatchPlayerStatsItem.Games g = s != null ? s.games() : null;
        MatchPlayerStatsItem.Shots sh = s != null ? s.shots() : null;
        MatchPlayerStatsItem.Goals go = s != null ? s.goals() : null;
        MatchPlayerStatsItem.Cards c = s != null ? s.cards() : null;
        return new ExternalMatchPlayerStat(
                team != null ? team.id() : null,
                team != null ? team.name() : null,
                p != null ? p.id() : null,
                p != null ? p.name() : null,
                p != null ? p.photo() : null,
                g != null ? g.minutes() : null,
                g != null ? g.number() : null,
                g != null ? g.position() : null,
                g != null ? g.rating() : null,
                g != null ? g.captain() : null,
                g != null ? g.substitute() : null,
                sh != null ? sh.total() : null,
                sh != null ? sh.on() : null,
                go != null ? go.total() : null,
                go != null ? go.assists() : null,
                c != null ? c.yellow() : null,
                c != null ? c.red() : null
        );
    }

    public MatchStatus mapStatus(String shortCode) {
        if (shortCode == null) {
            return MatchStatus.UNKNOWN;
        }
        return switch (shortCode) {
            case "NS", "TBD" -> MatchStatus.SCHEDULED;
            case "1H", "2H", "ET", "LIVE", "SUSP", "INT" -> MatchStatus.LIVE;
            case "HT" -> MatchStatus.HALFTIME;
            case "BT" -> MatchStatus.BREAK;
            case "P" -> MatchStatus.PENALTY_SHOOTOUT;
            case "FT", "AET", "PEN", "AWD", "WO" -> MatchStatus.FINISHED;
            case "PST" -> MatchStatus.POSTPONED;
            case "CANC" -> MatchStatus.CANCELLED;
            case "ABD" -> MatchStatus.ABANDONED;
            default -> MatchStatus.UNKNOWN;
        };
    }

    private static String stripLeaguePrefix(String group) {
        if (group == null) {
            return null;
        }
        int colon = group.indexOf(':');
        return colon >= 0 ? group.substring(colon + 1).trim() : group.trim();
    }
}
