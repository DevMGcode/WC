package com.mundial2026.backend.tournament.api.dto;

import java.util.List;

public record GroupResponse(
        Long id,
        String code,
        String name,
        List<GroupStandingResponse> standings
) {}
