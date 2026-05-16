package com.mundial2026.backend.common.response;

import java.util.List;

public record PaginatedResponse<T>(
        List<T> data,
        Pagination pagination
) {
    public record Pagination(
            int page,
            int pageSize,
            long total,
            int totalPages
    ) {
    }
}