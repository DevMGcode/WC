package com.mundial2026.backend.user.service;

import com.mundial2026.backend.common.exception.BusinessRuleException;
import com.mundial2026.backend.common.exception.ResourceNotFoundException;
import com.mundial2026.backend.user.api.dto.ChangePasswordRequest;
import com.mundial2026.backend.user.api.dto.CreateUserRequest;
import com.mundial2026.backend.user.api.dto.UpdateUserProfileRequest;
import com.mundial2026.backend.user.domain.AppUser;
import com.mundial2026.backend.user.domain.RoleEntity;
import com.mundial2026.backend.user.repository.AppUserRepository;
import com.mundial2026.backend.user.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final AppUserRepository appUserRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public AppUser create(CreateUserRequest request) {
        if (appUserRepository.existsByUsername(request.username())) {
            throw new BusinessRuleException("El username ya existe");
        }
        if (appUserRepository.existsByEmail(request.email())) {
            throw new BusinessRuleException("El email ya existe");
        }

        RoleEntity userRole = roleRepository.findByCode("USER")
                .orElseThrow(() -> new ResourceNotFoundException("Rol USER no encontrado"));

        AppUser user = new AppUser();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setCountryName(request.countryName());
        user.setCountryCode(request.countryCode());
        user.setRegionName(request.regionName());
        user.setDepartmentName(request.departmentName());
        user.setCityName(request.cityName());
        user.setPhoneCountryCode(request.phoneCountryCode());
        user.setPhoneNumber(request.phoneNumber());
        user.setPreferredLanguage(request.preferredLanguage() == null ? "es" : request.preferredLanguage());
        user.setTimeZone(request.timeZone() == null ? "UTC" : request.timeZone());
        user.getRoles().add(userRole);

        return appUserRepository.save(user);
    }

    @Transactional(readOnly = true)
    public AppUser findById(Long id) {
        return appUserRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id=" + id));
    }

    @Transactional(readOnly = true)
    public AppUser authenticate(String email, String password) {
        AppUser user = appUserRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con email=" + email));
        
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new BusinessRuleException("Contraseña incorrecta");
        }
        
        if (!user.getStatus().name().equals("ACTIVE")) {
            throw new BusinessRuleException("Usuario no está activo");
        }
        
        return user;
    }

    @Transactional
    public AppUser updateProfile(Long id, UpdateUserProfileRequest request) {
        AppUser user = appUserRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id=" + id));

        // Validar que el email no esté siendo usado por otro usuario
        if (!user.getEmail().equals(request.email()) && appUserRepository.existsByEmail(request.email())) {
            throw new BusinessRuleException("El email ya existe");
        }

        user.setEmail(request.email());
        user.setFirstName(request.firstName());

        return appUserRepository.save(user);
    }

    @Transactional
    public AppUser changePassword(Long id, ChangePasswordRequest request) {
        AppUser user = appUserRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id=" + id));

        // Validar que la contraseña actual sea correcta
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new BusinessRuleException("La contraseña actual es incorrecta");
        }

        // Validar que la nueva contraseña sea diferente
        if (request.currentPassword().equals(request.newPassword())) {
            throw new BusinessRuleException("La nueva contraseña debe ser diferente a la actual");
        }

        // Actualizar la contraseña
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));

        return appUserRepository.save(user);
    }
}
