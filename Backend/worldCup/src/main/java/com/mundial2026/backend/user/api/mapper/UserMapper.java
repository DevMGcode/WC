package com.mundial2026.backend.user.api.mapper;

import com.mundial2026.backend.subscription.service.SubscriptionService;
import com.mundial2026.backend.user.api.dto.AuthUserResponse;
import com.mundial2026.backend.user.api.dto.UserResponse;
import com.mundial2026.backend.user.domain.AppUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class UserMapper {

    private final SubscriptionService subscriptionService;

    public UserResponse toResponse(AppUser user) {
        // isPremium vía SubscriptionService.isPremium() y no findActive().isPresent():
        // incluye la regla "ADMIN siempre es Premium" aunque no tenga suscripción.
        var activeSub = subscriptionService.findActive(user.getId());
        boolean premium = subscriptionService.isPremium(user.getId());
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
                user.getCreatedAt(),
                premium,
                activeSub.map(s -> s.getExpiresAt()).orElse(null),
                user.getFavoriteTeam() != null ? user.getFavoriteTeam().getId() : null,
                Boolean.TRUE.equals(user.getOnboardingCompleted())
        );
    }

    public AuthUserResponse toAuthResponse(AppUser user) {
        var activeSub = subscriptionService.findActive(user.getId());
        return new AuthUserResponse(
                user.getId().toString(),
                user.getEmail(),
                user.getFirstName() != null ? user.getFirstName() : user.getUsername(),
                user.getStatus().name(),
                user.getCreatedAt(),
                subscriptionService.isPremium(user.getId()),
                activeSub.map(s -> s.getExpiresAt()).orElse(null),
                user.getPreferredLanguage(),
                Boolean.TRUE.equals(user.getOnboardingCompleted())
        );
    }
}
