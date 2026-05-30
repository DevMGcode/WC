package com.mundial2026.backend.tournament.integration.apifootball.mapper;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.mundial2026.backend.tournament.integration.apifootball.dto.ApiFootballEnvelope;
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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

class ApiFootballMapperTest {

    private final ObjectMapper jackson = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);

    private ApiFootballMapper subject;

    @BeforeEach
    void setUp() {
        subject = new ApiFootballMapper();
    }

    // ---------- Fixtures ----------

    @Test
    void toDomain_mapsFullFixture() throws Exception {
        String json = """
                {
                  "response": [{
                    "fixture": {
                      "id": 868053,
                      "date": "2026-06-11T20:00:00+00:00",
                      "venue": { "id": 17, "name": "Estadio Azteca", "city": "Mexico City" },
                      "status": { "long": "First Half", "short": "1H", "elapsed": 23 }
                    },
                    "league": { "id": 1, "name": "World Cup", "season": 2026, "round": "Group Stage - A" },
                    "teams": {
                      "home": { "id": 16, "name": "Mexico" },
                      "away": { "id": 2384, "name": "USA" }
                    },
                    "goals": { "home": 1, "away": 0 },
                    "score": { "halftime": { "home": 1, "away": 0 } }
                  }]
                }
                """;
        var env = jackson.readValue(json, new TypeReference<ApiFootballEnvelope<FixtureItem>>() {});

        List<ExternalMatch> result = subject.toDomainList(env.response());

        assertThat(result).hasSize(1);
        ExternalMatch m = result.get(0);
        assertThat(m.externalId()).isEqualTo("868053");
        assertThat(m.homeTeamId()).isEqualTo(16L);
        assertThat(m.homeTeamName()).isEqualTo("Mexico");
        assertThat(m.awayTeamId()).isEqualTo(2384L);
        assertThat(m.awayTeamName()).isEqualTo("USA");
        assertThat(m.homeScore()).isEqualTo(1);
        assertThat(m.awayScore()).isEqualTo(0);
        assertThat(m.elapsedMinutes()).isEqualTo(23);
        assertThat(m.status()).isEqualTo(MatchStatus.LIVE);
        assertThat(m.kickoffUtc()).isEqualTo(Instant.parse("2026-06-11T20:00:00Z"));
        assertThat(m.venueName()).isEqualTo("Estadio Azteca");
        assertThat(m.leagueRound()).isEqualTo("Group Stage - A");
    }

    @Test
    void toDomainList_returnsEmptyOnNull() {
        assertThat(subject.toDomainList(null)).isEmpty();
    }

    @Test
    void toDomain_handlesNullSubObjects() throws Exception {
        String json = """
                {"response":[{"fixture":{"id":1,"date":"2026-06-11T20:00:00+00:00","status":{"short":"NS"}},"teams":{},"goals":{}}]}
                """;
        var env = jackson.readValue(json, new TypeReference<ApiFootballEnvelope<FixtureItem>>() {});

        List<ExternalMatch> result = subject.toDomainList(env.response());

        assertThat(result).hasSize(1);
        ExternalMatch m = result.get(0);
        assertThat(m.externalId()).isEqualTo("1");
        assertThat(m.status()).isEqualTo(MatchStatus.SCHEDULED);
        assertThat(m.homeTeamId()).isNull();
        assertThat(m.venueName()).isNull();
        assertThat(m.leagueRound()).isNull();
    }

    // ---------- Status mapping ----------

    @Test
    void mapStatus_coversAllKnownCodes() {
        assertThat(subject.mapStatus("NS")).isEqualTo(MatchStatus.SCHEDULED);
        assertThat(subject.mapStatus("TBD")).isEqualTo(MatchStatus.SCHEDULED);
        assertThat(subject.mapStatus("1H")).isEqualTo(MatchStatus.LIVE);
        assertThat(subject.mapStatus("2H")).isEqualTo(MatchStatus.LIVE);
        assertThat(subject.mapStatus("ET")).isEqualTo(MatchStatus.LIVE);
        assertThat(subject.mapStatus("LIVE")).isEqualTo(MatchStatus.LIVE);
        assertThat(subject.mapStatus("SUSP")).isEqualTo(MatchStatus.LIVE);
        assertThat(subject.mapStatus("INT")).isEqualTo(MatchStatus.LIVE);
        assertThat(subject.mapStatus("HT")).isEqualTo(MatchStatus.HALFTIME);
        assertThat(subject.mapStatus("BT")).isEqualTo(MatchStatus.BREAK);
        assertThat(subject.mapStatus("P")).isEqualTo(MatchStatus.PENALTY_SHOOTOUT);
        assertThat(subject.mapStatus("FT")).isEqualTo(MatchStatus.FINISHED);
        assertThat(subject.mapStatus("AET")).isEqualTo(MatchStatus.FINISHED);
        assertThat(subject.mapStatus("PEN")).isEqualTo(MatchStatus.FINISHED);
        assertThat(subject.mapStatus("AWD")).isEqualTo(MatchStatus.FINISHED);
        assertThat(subject.mapStatus("WO")).isEqualTo(MatchStatus.FINISHED);
        assertThat(subject.mapStatus("PST")).isEqualTo(MatchStatus.POSTPONED);
        assertThat(subject.mapStatus("CANC")).isEqualTo(MatchStatus.CANCELLED);
        assertThat(subject.mapStatus("ABD")).isEqualTo(MatchStatus.ABANDONED);
    }

    @Test
    void mapStatus_unknownReturnsUnknown() {
        assertThat(subject.mapStatus(null)).isEqualTo(MatchStatus.UNKNOWN);
        assertThat(subject.mapStatus("")).isEqualTo(MatchStatus.UNKNOWN);
        assertThat(subject.mapStatus("XYZ")).isEqualTo(MatchStatus.UNKNOWN);
    }

    // ---------- Teams ----------

    @Test
    void toTeam_maps() throws Exception {
        String json = """
                {"response":[{
                  "team": {"id":16,"name":"Mexico","code":"MEX","country":"Mexico","founded":1927,"national":true,"logo":"https://media/teams/16.png"},
                  "venue": {"id":17,"name":"Estadio Azteca","city":"Mexico City"}
                }]}
                """;
        var env = jackson.readValue(json, new TypeReference<ApiFootballEnvelope<TeamItem>>() {});

        List<ExternalTeam> result = subject.toTeamList(env.response());

        assertThat(result).hasSize(1);
        ExternalTeam t = result.get(0);
        assertThat(t.externalId()).isEqualTo(16L);
        assertThat(t.name()).isEqualTo("Mexico");
        assertThat(t.code()).isEqualTo("MEX");
        assertThat(t.country()).isEqualTo("Mexico");
        assertThat(t.founded()).isEqualTo(1927);
        assertThat(t.national()).isTrue();
        assertThat(t.logoUrl()).isEqualTo("https://media/teams/16.png");
        assertThat(t.venueId()).isEqualTo(17L);
        assertThat(t.venueName()).isEqualTo("Estadio Azteca");
        assertThat(t.venueCity()).isEqualTo("Mexico City");
    }

    // ---------- Standings ----------

    @Test
    void toStandings_flattensGroupsAndStripsLeaguePrefix() throws Exception {
        String json = """
                {"response":[{
                  "league": {
                    "id":1,"name":"World Cup","season":2026,
                    "standings":[
                      [
                        {"rank":1,"team":{"id":16,"name":"Mexico","logo":"x"},"points":7,"goalsDiff":4,"group":"World Cup: Group A","form":"WWD","description":"Promotion - Knockout","all":{"played":3,"win":2,"draw":1,"lose":0,"goals":{"for":5,"against":1}},"update":"2026-06-22T00:00:00+00:00"},
                        {"rank":2,"team":{"id":2384,"name":"USA"},"points":4,"goalsDiff":1,"group":"World Cup: Group A","all":{"played":3,"win":1,"draw":1,"lose":1,"goals":{"for":3,"against":2}}}
                      ],
                      [
                        {"rank":1,"team":{"id":6,"name":"Brazil"},"points":9,"goalsDiff":6,"group":"World Cup: Group B","all":{"played":3,"win":3,"draw":0,"lose":0,"goals":{"for":7,"against":1}}}
                      ]
                    ]
                  }
                }]}
                """;
        var env = jackson.readValue(json, new TypeReference<ApiFootballEnvelope<StandingsResponse>>() {});

        List<ExternalStanding> result = subject.toStandingsList(env.response());

        assertThat(result).hasSize(3);
        assertThat(result).extracting(ExternalStanding::groupName)
                .containsExactly("Group A", "Group A", "Group B");
        ExternalStanding first = result.get(0);
        assertThat(first.rank()).isEqualTo(1);
        assertThat(first.teamId()).isEqualTo(16L);
        assertThat(first.points()).isEqualTo(7);
        assertThat(first.played()).isEqualTo(3);
        assertThat(first.goalsFor()).isEqualTo(5);
        assertThat(first.goalsAgainst()).isEqualTo(1);
        assertThat(first.goalDifference()).isEqualTo(4);
        assertThat(first.form()).isEqualTo("WWD");
        assertThat(first.description()).isEqualTo("Promotion - Knockout");
    }

    @Test
    void toStandings_emptyOnNull() {
        assertThat(subject.toStandingsList(null)).isEmpty();
        assertThat(subject.toStandingsList(List.of())).isEmpty();
    }

    // ---------- Player stats (topscorers/topassists) ----------

    @Test
    void toPlayerStat_pickFirstStatistic() throws Exception {
        String json = """
                {"response":[{
                  "player": {"id":276,"name":"Neymar","firstname":"Neymar","lastname":"da Silva","age":34,"nationality":"Brazil","photo":"https://media/players/276.png"},
                  "statistics":[{
                    "team":{"id":6,"name":"Brazil","logo":"x"},
                    "games":{"appearences":5,"minutes":450,"position":"Attacker","rating":"8.2","captain":true},
                    "shots":{"total":20,"on":12},
                    "goals":{"total":7,"assists":4},
                    "cards":{"yellow":1,"red":0}
                  }]
                }]}
                """;
        var env = jackson.readValue(json, new TypeReference<ApiFootballEnvelope<PlayerStatsItem>>() {});

        List<ExternalPlayerStat> result = subject.toPlayerStatsList(env.response());

        assertThat(result).hasSize(1);
        ExternalPlayerStat p = result.get(0);
        assertThat(p.playerId()).isEqualTo(276L);
        assertThat(p.playerName()).isEqualTo("Neymar");
        assertThat(p.firstName()).isEqualTo("Neymar");
        assertThat(p.lastName()).isEqualTo("da Silva");
        assertThat(p.nationality()).isEqualTo("Brazil");
        assertThat(p.age()).isEqualTo(34);
        assertThat(p.position()).isEqualTo("Attacker");
        assertThat(p.teamId()).isEqualTo(6L);
        assertThat(p.teamName()).isEqualTo("Brazil");
        assertThat(p.appearances()).isEqualTo(5);
        assertThat(p.minutesPlayed()).isEqualTo(450);
        assertThat(p.goals()).isEqualTo(7);
        assertThat(p.assists()).isEqualTo(4);
        assertThat(p.shotsTotal()).isEqualTo(20);
        assertThat(p.shotsOnTarget()).isEqualTo(12);
        assertThat(p.yellowCards()).isEqualTo(1);
        assertThat(p.redCards()).isEqualTo(0);
        assertThat(p.rating()).isEqualTo("8.2");
    }

    // ---------- Squad ----------

    @Test
    void toSquad_flattensTeamPlayers() throws Exception {
        String json = """
                {"response":[{
                  "team":{"id":16,"name":"Mexico","logo":"x"},
                  "players":[
                    {"id":100,"name":"Guillermo Ochoa","age":40,"number":13,"position":"Goalkeeper","photo":"p1"},
                    {"id":101,"name":"Edson Alvarez","age":27,"number":4,"position":"Midfielder","photo":"p2"}
                  ]
                }]}
                """;
        var env = jackson.readValue(json, new TypeReference<ApiFootballEnvelope<SquadItem>>() {});

        List<ExternalSquadPlayer> result = subject.toSquadList(env.response());

        assertThat(result).hasSize(2);
        ExternalSquadPlayer ochoa = result.get(0);
        assertThat(ochoa.teamId()).isEqualTo(16L);
        assertThat(ochoa.teamName()).isEqualTo("Mexico");
        assertThat(ochoa.playerId()).isEqualTo(100L);
        assertThat(ochoa.playerName()).isEqualTo("Guillermo Ochoa");
        assertThat(ochoa.shirtNumber()).isEqualTo(13);
        assertThat(ochoa.position()).isEqualTo("Goalkeeper");
        assertThat(ochoa.age()).isEqualTo(40);
        assertThat(ochoa.photoUrl()).isEqualTo("p1");
    }

    // ---------- Lineups ----------

    @Test
    void toLineup_extractsXIAndSubstitutes() throws Exception {
        String json = """
                {"response":[{
                  "team":{"id":16,"name":"Mexico","logo":"x"},
                  "coach":{"id":1,"name":"DT","photo":"c"},
                  "formation":"4-3-3",
                  "startXI":[
                    {"player":{"id":100,"name":"Ochoa","number":13,"pos":"G","grid":"1:1"}},
                    {"player":{"id":101,"name":"Alvarez","number":4,"pos":"M","grid":"3:2"}}
                  ],
                  "substitutes":[
                    {"player":{"id":102,"name":"Lozano","number":22,"pos":"F","grid":null}}
                  ]
                }]}
                """;
        var env = jackson.readValue(json, new TypeReference<ApiFootballEnvelope<LineupItem>>() {});

        List<ExternalLineup> result = subject.toLineupList(env.response());

        assertThat(result).hasSize(1);
        ExternalLineup l = result.get(0);
        assertThat(l.teamId()).isEqualTo(16L);
        assertThat(l.coachId()).isEqualTo(1L);
        assertThat(l.coachName()).isEqualTo("DT");
        assertThat(l.formation()).isEqualTo("4-3-3");
        assertThat(l.startXI()).hasSize(2);
        assertThat(l.startXI().get(0).playerName()).isEqualTo("Ochoa");
        assertThat(l.startXI().get(0).position()).isEqualTo("G");
        assertThat(l.startXI().get(0).grid()).isEqualTo("1:1");
        assertThat(l.substitutes()).hasSize(1);
        assertThat(l.substitutes().get(0).playerName()).isEqualTo("Lozano");
    }

    // ---------- Predictions ----------

    @Test
    void toPrediction_picksWinnerAndPercents() throws Exception {
        String json = """
                {"response":[{
                  "predictions":{
                    "winner":{"id":16,"name":"Mexico","comment":"Win or draw"},
                    "win_or_draw":true,
                    "advice":"Combo Double chance : Mexico or draw and -3.5 goals",
                    "percent":{"home":"55%","draw":"20%","away":"25%"}
                  }
                }]}
                """;
        var env = jackson.readValue(json, new TypeReference<ApiFootballEnvelope<PredictionItem>>() {});

        Optional<ExternalPrediction> result = subject.toPrediction(env.response().get(0));

        assertThat(result).isPresent();
        ExternalPrediction p = result.get();
        assertThat(p.winnerTeamId()).isEqualTo(16L);
        assertThat(p.winnerTeamName()).isEqualTo("Mexico");
        assertThat(p.winnerComment()).isEqualTo("Win or draw");
        assertThat(p.winOrDraw()).isTrue();
        assertThat(p.advice()).contains("Combo Double chance");
        assertThat(p.homeWinPercent()).isEqualTo("55%");
        assertThat(p.drawPercent()).isEqualTo("20%");
        assertThat(p.awayWinPercent()).isEqualTo("25%");
    }

    @Test
    void toPrediction_emptyWhenNullPredictions() {
        assertThat(subject.toPrediction(null)).isEmpty();
        assertThat(subject.toPrediction(new PredictionItem(null))).isEmpty();
    }

    // ---------- Match events ----------

    @Test
    void toMatchEvent_mapsGoalAndCard() throws Exception {
        String json = """
                {"response":[
                  {"time":{"elapsed":25,"extra":null},"team":{"id":16,"name":"Mexico","logo":"x"},"player":{"id":100,"name":"Lozano"},"assist":{"id":101,"name":"Alvarez"},"type":"Goal","detail":"Normal Goal","comments":null},
                  {"time":{"elapsed":67,"extra":2},"team":{"id":2384,"name":"USA","logo":"x"},"player":{"id":200,"name":"Pulisic"},"assist":null,"type":"Card","detail":"Yellow Card","comments":"Foul"}
                ]}
                """;
        var env = jackson.readValue(json, new TypeReference<ApiFootballEnvelope<MatchEventEntryItem>>() {});

        List<ExternalMatchEvent> result = subject.toMatchEventList(env.response());

        assertThat(result).hasSize(2);
        ExternalMatchEvent goal = result.get(0);
        assertThat(goal.elapsedMinute()).isEqualTo(25);
        assertThat(goal.teamId()).isEqualTo(16L);
        assertThat(goal.playerId()).isEqualTo(100L);
        assertThat(goal.playerName()).isEqualTo("Lozano");
        assertThat(goal.assistPlayerId()).isEqualTo(101L);
        assertThat(goal.type()).isEqualTo("Goal");
        assertThat(goal.detail()).isEqualTo("Normal Goal");

        ExternalMatchEvent card = result.get(1);
        assertThat(card.elapsedMinute()).isEqualTo(67);
        assertThat(card.extraMinute()).isEqualTo(2);
        assertThat(card.assistPlayerId()).isNull();
        assertThat(card.type()).isEqualTo("Card");
        assertThat(card.comments()).isEqualTo("Foul");
    }

    @Test
    void dedupKey_isStableAcrossInstances() {
        ExternalMatchEvent ev = new ExternalMatchEvent(
                25, null, 16L, "Mexico", 100L, "Lozano", 101L, "Alvarez", "Goal", "Normal Goal", null);
        assertThat(ev.dedupKey(868053L)).isEqualTo("868053:25:null:16:100:Goal:Normal Goal");
    }

    // ---------- Match statistics ----------

    @Test
    void toMatchStatistics_collectsTypeValuePairs() throws Exception {
        String json = """
                {"response":[{
                  "team":{"id":16,"name":"Mexico","logo":"x"},
                  "statistics":[
                    {"type":"Ball Possession","value":"55%"},
                    {"type":"Total Shots","value":8},
                    {"type":"Shots on Goal","value":null}
                  ]
                }]}
                """;
        var env = jackson.readValue(json, new TypeReference<ApiFootballEnvelope<MatchStatisticsItem>>() {});

        List<ExternalMatchStatistic> result = subject.toMatchStatisticsList(env.response());

        assertThat(result).hasSize(1);
        ExternalMatchStatistic s = result.get(0);
        assertThat(s.teamId()).isEqualTo(16L);
        assertThat(s.statistics()).containsEntry("Ball Possession", "55%");
        assertThat(s.statistics()).containsEntry("Total Shots", "8");
        assertThat(s.statistics()).containsEntry("Shots on Goal", null);
    }

    // ---------- Match player stats ----------

    @Test
    void toMatchPlayerStats_flattensTeamsAndTakesFirstStatistic() throws Exception {
        String json = """
                {"response":[{
                  "team":{"id":16,"name":"Mexico","logo":"x"},
                  "players":[{
                    "player":{"id":100,"name":"Lozano","photo":"p"},
                    "statistics":[{
                      "games":{"minutes":90,"number":22,"position":"F","rating":"8.5","captain":false,"substitute":false},
                      "shots":{"total":4,"on":2},
                      "goals":{"total":1,"assists":0},
                      "cards":{"yellow":0,"red":0}
                    }]
                  }]
                }]}
                """;
        var env = jackson.readValue(json, new TypeReference<ApiFootballEnvelope<MatchPlayerStatsItem>>() {});

        List<ExternalMatchPlayerStat> result = subject.toMatchPlayerStatsList(env.response());

        assertThat(result).hasSize(1);
        ExternalMatchPlayerStat p = result.get(0);
        assertThat(p.teamId()).isEqualTo(16L);
        assertThat(p.playerId()).isEqualTo(100L);
        assertThat(p.playerName()).isEqualTo("Lozano");
        assertThat(p.minutes()).isEqualTo(90);
        assertThat(p.shirtNumber()).isEqualTo(22);
        assertThat(p.position()).isEqualTo("F");
        assertThat(p.rating()).isEqualTo("8.5");
        assertThat(p.captain()).isFalse();
        assertThat(p.substitute()).isFalse();
        assertThat(p.shotsTotal()).isEqualTo(4);
        assertThat(p.shotsOn()).isEqualTo(2);
        assertThat(p.goals()).isEqualTo(1);
        assertThat(p.assists()).isEqualTo(0);
    }
}
