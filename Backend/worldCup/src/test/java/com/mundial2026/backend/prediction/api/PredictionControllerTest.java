package com.mundial2026.backend.prediction.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mundial2026.backend.prediction.api.dto.CreatePredictionRequest;
import com.mundial2026.backend.prediction.api.dto.PredictionResponse;
import com.mundial2026.backend.prediction.api.mapper.PredictionMapper;
import com.mundial2026.backend.prediction.domain.UserPrediction;
import com.mundial2026.backend.prediction.service.PredictionService;
import com.mundial2026.backend.security.JwtAuthenticationFilter;
import com.mundial2026.backend.security.JwtTokenProvider;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
        value = PredictionController.class,
        excludeAutoConfiguration = {
                SecurityAutoConfiguration.class,
                SecurityFilterAutoConfiguration.class
        },
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = JwtAuthenticationFilter.class
        )
)
@AutoConfigureMockMvc(addFilters = false)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class PredictionControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @MockitoBean
    PredictionService predictionService;

    @MockitoBean
    PredictionMapper predictionMapper;

    @MockitoBean
    JwtTokenProvider jwtTokenProvider;

    @Test
    void create_validRequest_returnsCreated() throws Exception {
        CreatePredictionRequest request = new CreatePredictionRequest(
                1L,
                10L,
                2,
                1
        );

        UserPrediction prediction = new UserPrediction();
        prediction.setId(99L);

        PredictionResponse response = new PredictionResponse(
                99L,                         // id
                1L,                          // userId
                "jaime",                     // username
                10L,                         // fixtureId
                "Colombia vs Uruguay",       // fixtureName
                2,                           // homeScore
                1,                           // awayScore
                OffsetDateTime.now(),        // lockedAt
                OffsetDateTime.now(),        // createdAt
                false,                       // editable
                "ACTIVE"                     // status
        );

        when(predictionService.create(any(CreatePredictionRequest.class))).thenReturn(prediction);
        when(predictionMapper.toResponse(prediction)).thenReturn(response);

        mockMvc.perform(post("/api/v1/public/predictions")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(99))
                .andExpect(jsonPath("$.data.userId").value(1))
                .andExpect(jsonPath("$.data.username").value("jaime"))
                .andExpect(jsonPath("$.data.fixtureId").value(10))
                .andExpect(jsonPath("$.data.fixtureName").value("Colombia vs Uruguay"))
                .andExpect(jsonPath("$.data.predictedHomeScore").value(2))
                .andExpect(jsonPath("$.data.predictedAwayScore").value(1))
                .andExpect(jsonPath("$.data.isLocked").value(false))
                .andExpect(jsonPath("$.data.lockReason").value("ACTIVE"));
    }
}