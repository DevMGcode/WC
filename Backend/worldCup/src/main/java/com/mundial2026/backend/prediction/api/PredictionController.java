package com.mundial2026.backend.prediction.api;

import com.mundial2026.backend.common.exception.BusinessRuleException;
import com.mundial2026.backend.common.response.ApiResponse;
import com.mundial2026.backend.prediction.api.dto.CreatePredictionRequest;
import com.mundial2026.backend.prediction.api.dto.PredictionResponse;
import com.mundial2026.backend.prediction.api.dto.UpdatePredictionRequest;
import com.mundial2026.backend.prediction.api.mapper.PredictionMapper;
import com.mundial2026.backend.prediction.repository.UserPredictionRepository;
import com.mundial2026.backend.prediction.service.PredictionService;
import com.mundial2026.backend.security.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/predictions")
@RequiredArgsConstructor
public class PredictionController {

    private final PredictionService predictionService;
    private final PredictionMapper predictionMapper;
    private final SecurityUtils securityUtils;
    private final UserPredictionRepository userPredictionRepository;

    @PostMapping
    public ResponseEntity<ApiResponse<PredictionResponse>> create(@Valid @RequestBody CreatePredictionRequest request) {
        Long jwtUserId = securityUtils.currentUserId();
        // Anti-IDOR: ignoramos el userId del body y forzamos el del JWT (excepto admin).
        CreatePredictionRequest safeRequest = securityUtils.isAdmin()
                ? request
                : new CreatePredictionRequest(jwtUserId, request.fixtureId(),
                        request.predictedHomeScore(), request.predictedAwayScore());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(
                        "Porra creada correctamente",
                        predictionMapper.toResponse(predictionService.create(safeRequest))
                ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PredictionResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePredictionRequest request
    ) {
        // Anti-IDOR: solo el dueño de la porra (o ADMIN) puede modificarla.
        if (!securityUtils.isAdmin()) {
            Long ownerId = userPredictionRepository.findWithUserAndFixtureById(id)
                    .map(p -> p.getUser().getId())
                    .orElseThrow(() -> new BusinessRuleException("Porra no encontrada"));
            if (!ownerId.equals(securityUtils.currentUserId())) {
                throw new BusinessRuleException("Acceso denegado: la porra no pertenece al usuario autenticado");
            }
        }

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
        // Anti-IDOR: solo el propio usuario o un admin pueden ver predicciones.
        securityUtils.requireSelfOrAdmin(userId);

        List<PredictionResponse> data = predictionService.findByUserId(userId)
                .stream()
                .map(predictionMapper::toResponse)
                .toList();

        return ResponseEntity.ok(ApiResponse.ok("Porras encontradas", data));
    }

    /** Devuelve la porra del usuario autenticado para un fixture concreto, o 404 si no existe. */
    @GetMapping("/fixture/{fixtureId}")
    public ResponseEntity<ApiResponse<PredictionResponse>> findByFixture(@PathVariable Long fixtureId) {
        Long jwtUserId = securityUtils.currentUserId();
        return predictionService.findByUserIdAndFixtureId(jwtUserId, fixtureId)
                .map(p -> ResponseEntity.ok(ApiResponse.ok("Porra encontrada", predictionMapper.toResponse(p))))
                .orElseThrow(() -> new com.mundial2026.backend.common.exception.ResourceNotFoundException(
                        "No hay porra para el fixture " + fixtureId));
    }
}
