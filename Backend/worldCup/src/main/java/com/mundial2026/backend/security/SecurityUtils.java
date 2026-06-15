package com.mundial2026.backend.security;

import com.mundial2026.backend.common.exception.BusinessRuleException;
import com.mundial2026.backend.user.domain.AppUser;
import com.mundial2026.backend.user.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Helper para obtener el usuario autenticado a partir del SecurityContext.
 * Centraliza la extracción del userId desde el JWT y la validación anti-IDOR.
 */
@Component
@RequiredArgsConstructor
public class SecurityUtils {

    private final AppUserRepository appUserRepository;

    /** Devuelve el AppUser autenticado o lanza 403 si no hay sesión válida. */
    public AppUser currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new BusinessRuleException("Usuario no autenticado");
        }
        String username = auth.getName();
        return appUserRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessRuleException("Usuario no encontrado en sesión"));
    }

    public Long currentUserId() {
        return currentUser().getId();
    }

    public boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ADMIN"::equals);
    }

    /** Valida que el userId solicitado coincida con el del JWT (o sea ADMIN). */
    public void requireSelfOrAdmin(Long requestedUserId) {
        if (isAdmin()) return;
        if (requestedUserId == null || !requestedUserId.equals(currentUserId())) {
            throw new BusinessRuleException("Acceso denegado: el userId no corresponde al usuario autenticado");
        }
    }

    /** Exige rol ADMIN; lanza 422 si el usuario autenticado no lo es. */
    public void requireAdmin() {
        if (!isAdmin()) {
            throw new BusinessRuleException("Acceso denegado: se requiere rol de administrador");
        }
    }
}
