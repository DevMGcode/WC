package com.mundial2026.backend.user.service;

import com.mundial2026.backend.common.exception.BusinessRuleException;
import com.mundial2026.backend.common.exception.ResourceNotFoundException;
import com.mundial2026.backend.user.api.dto.CreateUserRequest;
import com.mundial2026.backend.user.api.dto.ChangePasswordRequest;
import com.mundial2026.backend.user.api.dto.UpdateUserProfileRequest;
import com.mundial2026.backend.user.domain.AppUser;
import com.mundial2026.backend.user.domain.RoleEntity;
import com.mundial2026.backend.user.repository.AppUserRepository;
import com.mundial2026.backend.user.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final AppUserRepository appUserRepository;
    private final RoleRepository roleRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

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

    @Transactional
    public AppUser updateProfile(Long id, UpdateUserProfileRequest request) {
        AppUser user = appUserRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id=" + id));

        String normalizedEmail = request.email().trim().toLowerCase();
        boolean emailChanged = !normalizedEmail.equalsIgnoreCase(user.getEmail());

        if (emailChanged && appUserRepository.existsByEmail(normalizedEmail)) {
            throw new BusinessRuleException("El email ya existe");
        }

        user.setFirstName(request.firstName().trim());
        user.setEmail(normalizedEmail);

        return appUserRepository.save(user);
    }

    @Transactional
    public void changePassword(Long id, ChangePasswordRequest request) {
        AppUser user = appUserRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id=" + id));

        if (!matchesPassword(request.currentPassword(), user.getPasswordHash())) {
            throw new BusinessRuleException("La contraseña actual no es correcta");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword().trim()));
        appUserRepository.save(user);
    }

    @Transactional(readOnly = true)
    public AppUser authenticate(String email, String password) {
        AppUser user = appUserRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessRuleException("Email o contraseña incorrectos"));

        if (!matchesPassword(password, user.getPasswordHash())) {
            throw new BusinessRuleException("Email o contraseña incorrectos");
        }

        return user;
    }

    private boolean matchesPassword(String rawPassword, String storedPassword) {
        if (storedPassword == null) {
            return false;
        }

        if (storedPassword.startsWith("$2")) {
            try {
                return passwordEncoder.matches(rawPassword, storedPassword);
            } catch (Exception ex) {
                return storedPassword.equals(rawPassword);
            }
        }

        return storedPassword.equals(rawPassword);
    }
}
