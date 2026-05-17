package com.mundial2026.backend.user.repository;

import com.mundial2026.backend.user.domain.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByUsername(String username);
    Optional<AppUser> findByEmail(String email);
    Optional<AppUser> findByVerificationToken(String verificationToken);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}
