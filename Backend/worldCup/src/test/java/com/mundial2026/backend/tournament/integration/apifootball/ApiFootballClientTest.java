package com.mundial2026.backend.tournament.integration.apifootball;

import com.mundial2026.backend.common.exception.ExternalApiClientException;
import com.mundial2026.backend.tournament.integration.apifootball.dto.StatusResponse;
import com.mundial2026.backend.tournament.integration.apifootball.mapper.ApiFootballMapper;
import com.mundial2026.backend.tournament.integration.port.ExternalMatch;
import com.mundial2026.backend.tournament.integration.port.ExternalStanding;
import com.mundial2026.backend.tournament.integration.port.ExternalTeam;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;
import static org.springframework.http.HttpMethod.GET;

class ApiFootballClientTest {

    private static final String BASE = "https://api.test";

    private MockRestServiceServer server;
    private ApiFootballClient subject;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder()
                .baseUrl(BASE)
                .defaultHeader("x-apisports-key", "test-key");
        server = MockRestServiceServer.bindTo(builder).build();
        RestClient client = builder.build();
        ApiFootballProperties props = new ApiFootballProperties(
                BASE, "test-key", ApiFootballProperties.Mode.DIRECT, "host",
                1, 2026, 5000, 2000);
        subject = new ApiFootballClient(client, new ApiFootballMapper(), props);
    }

    // ---------- URL + headers ----------

    @Test
    void fetchLiveMatches_buildsCorrectUrl() {
        server.expect(requestTo(BASE + "/fixtures?live=all&league=1"))
                .andExpect(method(GET))
                .andExpect(header("x-apisports-key", "test-key"))
                .andRespond(withSuccess("{\"response\":[]}", MediaType.APPLICATION_JSON));

        List<ExternalMatch> result = subject.fetchLiveMatches();

        assertThat(result).isEmpty();
        server.verify();
    }

    @Test
    void fetchTournamentFixtures_includesLeagueAndSeason() {
        server.expect(requestTo(BASE + "/fixtures?league=1&season=2026"))
                .andExpect(method(GET))
                .andRespond(withSuccess("{\"response\":[]}", MediaType.APPLICATION_JSON));

        subject.fetchTournamentFixtures();
        server.verify();
    }

    @Test
    void fetchById_buildsFixtureIdQueryParam() {
        server.expect(requestTo(BASE + "/fixtures?id=868053"))
                .andExpect(method(GET))
                .andRespond(withSuccess("{\"response\":[]}", MediaType.APPLICATION_JSON));

        Optional<ExternalMatch> result = subject.fetchById("868053");

        assertThat(result).isEmpty();
        server.verify();
    }

    @Test
    void fetchHeadToHead_joinsTeamIdsWithDash() {
        server.expect(requestTo(BASE + "/fixtures/headtohead?h2h=16-2384&last=5"))
                .andRespond(withSuccess("{\"response\":[]}", MediaType.APPLICATION_JSON));

        subject.fetchHeadToHead(16L, 2384L, 5);
        server.verify();
    }

    @Test
    void fetchSquad_usesTeamQueryParam() {
        server.expect(requestTo(BASE + "/players/squads?team=16"))
                .andRespond(withSuccess("{\"response\":[]}", MediaType.APPLICATION_JSON));

        subject.fetchSquad(16L);
        server.verify();
    }

    // ---------- Envelope parsing ----------

    @Test
    void fetchTournamentTeams_parsesEnvelopeResponse() {
        String body = """
                {"response":[
                  {"team":{"id":16,"name":"Mexico","code":"MEX","national":true},"venue":{"id":17,"name":"Azteca"}},
                  {"team":{"id":2384,"name":"USA","code":"USA","national":true},"venue":{"id":18,"name":"MetLife"}}
                ]}
                """;
        server.expect(requestTo(BASE + "/teams?league=1&season=2026"))
                .andRespond(withSuccess(body, MediaType.APPLICATION_JSON));

        List<ExternalTeam> result = subject.fetchTournamentTeams();

        assertThat(result).hasSize(2);
        assertThat(result).extracting(ExternalTeam::name).containsExactly("Mexico", "USA");
        server.verify();
    }

    @Test
    void fetchStandings_flattensGroups() {
        String body = """
                {"response":[{"league":{"id":1,"standings":[
                  [{"rank":1,"team":{"id":16,"name":"Mexico"},"points":7,"goalsDiff":4,"group":"World Cup: Group A","all":{"played":3,"win":2,"draw":1,"lose":0,"goals":{"for":5,"against":1}}}],
                  [{"rank":1,"team":{"id":6,"name":"Brazil"},"points":9,"goalsDiff":6,"group":"World Cup: Group B","all":{"played":3,"win":3,"draw":0,"lose":0,"goals":{"for":7,"against":1}}}]
                ]}}]}
                """;
        server.expect(requestTo(BASE + "/standings?league=1&season=2026"))
                .andRespond(withSuccess(body, MediaType.APPLICATION_JSON));

        List<ExternalStanding> result = subject.fetchStandings();

        assertThat(result).hasSize(2);
        assertThat(result).extracting(ExternalStanding::groupName).containsExactly("Group A", "Group B");
        server.verify();
    }

    // ---------- Error handling ----------

    @Test
    void call_throwsClientExceptionOn4xx() {
        server.expect(requestTo(BASE + "/fixtures?live=all&league=1"))
                .andRespond(withStatus(HttpStatus.UNAUTHORIZED).body("{}").contentType(MediaType.APPLICATION_JSON));

        assertThatThrownBy(() -> subject.fetchLiveMatches())
                .isInstanceOf(ExternalApiClientException.class)
                .hasMessageContaining("401");
        server.verify();
    }

    @Test
    void call_throwsWhenErrorsArrayIsNonEmpty() {
        String body = """
                {"errors":["Invalid season"],"response":[]}
                """;
        server.expect(requestTo(BASE + "/fixtures?live=all&league=1"))
                .andRespond(withSuccess(body, MediaType.APPLICATION_JSON));

        assertThatThrownBy(() -> subject.fetchLiveMatches())
                .isInstanceOf(ExternalApiClientException.class)
                .hasMessageContaining("Invalid season");
        server.verify();
    }

    @Test
    void call_throwsWhenErrorsObjectIsNonEmpty() {
        String body = """
                {"errors":{"token":"Error/Missing application key."},"response":[]}
                """;
        server.expect(requestTo(BASE + "/fixtures?live=all&league=1"))
                .andRespond(withSuccess(body, MediaType.APPLICATION_JSON));

        assertThatThrownBy(() -> subject.fetchLiveMatches())
                .isInstanceOf(ExternalApiClientException.class)
                .hasMessageContaining("token");
        server.verify();
    }

    @Test
    void call_emptyErrorsArrayDoesNotThrow() {
        server.expect(requestTo(BASE + "/fixtures?live=all&league=1"))
                .andRespond(withSuccess("{\"errors\":[],\"response\":[]}", MediaType.APPLICATION_JSON));

        List<ExternalMatch> result = subject.fetchLiveMatches();
        assertThat(result).isEmpty();
        server.verify();
    }

    @Test
    void fetchAccountStatus_parsesSingleObjectResponse() {
        // Regression: /status returns `response` as an OBJECT (not list). The previous
        // implementation used ApiFootballEnvelope<T> with List<T> and Jackson failed silently
        // — the controller bubbled HTTP 500. Now uses ApiFootballSingleEnvelope<T>.
        String body = """
                {
                  "get":"status",
                  "parameters":[],
                  "errors":[],
                  "results":0,
                  "paging":{"current":1,"total":1},
                  "response":{
                    "account":{"firstname":"Jaime","lastname":"Tellez","email":"jaime@example.com"},
                    "subscription":{"plan":"Mega","end":"2026-08-23","active":true},
                    "requests":{"current":1234,"limit_day":150000}
                  }
                }
                """;
        server.expect(requestTo(BASE + "/status"))
                .andRespond(withSuccess(body, MediaType.APPLICATION_JSON));

        Optional<StatusResponse> result = subject.fetchAccountStatus();

        assertThat(result).isPresent();
        StatusResponse s = result.get();
        assertThat(s.subscription().plan()).isEqualTo("Mega");
        assertThat(s.subscription().active()).isTrue();
        assertThat(s.requests().current()).isEqualTo(1234);
        assertThat(s.requests().limitDay()).isEqualTo(150000);
        server.verify();
    }

    @Test
    void call_emptyErrorsObjectDoesNotThrow() {
        server.expect(requestTo(BASE + "/fixtures?live=all&league=1"))
                .andRespond(withSuccess("{\"errors\":{},\"response\":[]}", MediaType.APPLICATION_JSON));

        List<ExternalMatch> result = subject.fetchLiveMatches();
        assertThat(result).isEmpty();
        server.verify();
    }
}
