package com.mundial2026.backend.common.exception;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Standalone MockMvc setup wires the test controller + the @RestControllerAdvice manually.
 * Avoids the full Spring context and any auto-config interference with @WebMvcTest.
 */
class GlobalExceptionHandlerTest {

    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.standaloneSetup(new TestController())
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void resourceNotFound_returns404() throws Exception {
        mvc.perform(get("/test/not-found"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Recurso no existe"));
    }

    @Test
    void businessRule_returns422() throws Exception {
        mvc.perform(get("/test/business-rule"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.status").value(422))
                .andExpect(jsonPath("$.message").value("Regla incumplida"));
    }

    @Test
    void validation_returns400WithFieldErrors() throws Exception {
        mvc.perform(post("/test/validate")
                        .contentType("application/json")
                        .content("{\"name\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.errors.name").exists());
    }

    @Test
    void generic_returns500() throws Exception {
        mvc.perform(get("/test/boom"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.status").value(500));
    }

    @RestController
    static class TestController {

        @GetMapping("/test/not-found")
        public void notFound() {
            throw new ResourceNotFoundException("Recurso no existe");
        }

        @GetMapping("/test/business-rule")
        public void businessRule() {
            throw new BusinessRuleException("Regla incumplida");
        }

        @PostMapping("/test/validate")
        public void validate(@Valid @RequestBody Payload payload) {
        }

        @GetMapping("/test/boom")
        public void boom() {
            throw new IllegalStateException("kaboom");
        }
    }

    record Payload(@NotBlank String name) {}
}
