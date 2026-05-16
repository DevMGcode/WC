package com.mundial2026.backend.prediction.api;

import com.mundial2026.backend.common.response.ApiResponse;
import com.mundial2026.backend.prediction.api.dto.CreatePredictionRequest;
import com.mundial2026.backend.prediction.api.dto.PredictionResponse;
import com.mundial2026.backend.prediction.api.dto.UpdatePredictionRequest;
import com.mundial2026.backend.prediction.api.mapper.PredictionMapper;
import com.mundial2026.backend.prediction.service.PredictionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public/predictions")
@RequiredArgsConstructor
public class PredictionController {

    private final PredictionService predictionService;
    private final PredictionMapper predictionMapper;

    @PostMapping
    public ResponseEntity<ApiResponse<PredictionResponse>> create(@Valid @RequestBody CreatePredictionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(
                        "Porra creada correctamente",
                        predictionMapper.toResponse(predictionService.create(request))
                ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PredictionResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePredictionRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Porra actualizada correctamente",
                predictionMapper.toResponse(predictionService.update(id, request))
        ));
    }

    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Long>> count() {
        return ResponseEntity.ok(ApiResponse.ok("Total de predicciones", predictionService.count()));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<PredictionResponse>>> findByUser(@PathVariable Long userId) {
        List<PredictionResponse> data = predictionService.findByUserId(userId)
                .stream()
                .map(predictionMapper::toResponse)
                .toList();

        return ResponseEntity.ok(ApiResponse.ok("Porras encontradas", data));
    }
}
