package com.mundial2026.backend.tournament.api;

import com.mundial2026.backend.security.JwtTokenProvider;
import com.mundial2026.backend.tournament.api.dto.StandingResponse;
import com.mundial2026.backend.tournament.service.StandingsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = StandingsController.class)
@AutoConfigureMockMvc(addFilters = false)
class StandingsControllerTest {

    @Autowired private MockMvc mvc;

    @MockitoBean private StandingsService standingsService;
    @MockitoBean private JwtTokenProvider jwtTokenProvider;
    // JwtAuthenticationFilter ahora carga roles desde la BD.
    @MockitoBean private com.mundial2026.backend.user.repository.AppUserRepository appUserRepository;

    @Test
    void findAll_returns200WithList() throws Exception {
        when(standingsService.findAll()).thenReturn(List.of(
                row("Group A", 1, "Mexico"),
                row("Group A", 2, "USA")));

        mvc.perform(get("/api/v1/public/standings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(2))
                .andExpect(jsonPath("$.data[0].teamName").value("Mexico"))
                .andExpect(jsonPath("$.data[0].rank").value(1));
    }

    @Test
    void findByGroup_passesGroupCodeToService() throws Exception {
        when(standingsService.findByGroup("A")).thenReturn(List.of(row("Group A", 1, "Mexico")));

        mvc.perform(get("/api/v1/public/standings/group/A"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Standings for group A"))
                .andExpect(jsonPath("$.data.length()").value(1));

        verify(standingsService).findByGroup(eq("A"));
    }

    @Test
    void bestDefense_respectsLimitQueryParam() throws Exception {
        when(standingsService.findFewestGoalsAgainst(5)).thenReturn(List.of(row("Group A", 1, "Mexico")));

        mvc.perform(get("/api/v1/public/standings/best-defense").param("limit", "5"))
                .andExpect(status().isOk());

        verify(standingsService).findFewestGoalsAgainst(5);
    }

    @Test
    void bestDefense_defaultsLimitTo10WhenMissing() throws Exception {
        when(standingsService.findFewestGoalsAgainst(10)).thenReturn(List.of());

        mvc.perform(get("/api/v1/public/standings/best-defense"))
                .andExpect(status().isOk());

        verify(standingsService).findFewestGoalsAgainst(10);
    }

    private StandingResponse row(String group, int rank, String name) {
        return new StandingResponse(group, rank, 1L, name, null,
                3, 2, 1, 0, 5, 1, 4, 7, "WWD", null, Instant.now(),
                null, null, null, null, null, null,
                null, null, null, null, null, null);
    }
}
