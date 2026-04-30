package com.mundial2026.backend.user.api.mapper;

import com.mundial2026.backend.user.api.dto.AuthUserResponse;
import com.mundial2026.backend.user.api.dto.UserResponse;
import com.mundial2026.backend.user.domain.AppUser;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class UserMapper {

    public UserResponse toResponse(AppUser user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getCountryName(),
                user.getDepartmentName(),
                user.getCityName(),
                user.getPreferredLanguage(),
                user.getTimeZone(),
                user.getStatus().name(),
                user.getEmailVerified(),
                user.getRoles().stream().map(role -> role.getCode()).collect(Collectors.toSet()),
                user.getCreatedAt()
        );
    }

    public AuthUserResponse toAuthResponse(AppUser user) {
        return new AuthUserResponse(
                user.getId().toString(),
                user.getEmail(),
                user.getFirstName() != null ? user.getFirstName() : user.getUsername(),
                user.getStatus().name(),
                user.getCreatedAt()
        );
    }
}
