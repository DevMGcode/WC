package com.mundial2026.backend.security;


import com.mundial2026.backend.user.domain.AppUser;
import com.mundial2026.backend.user.repository.AppUserRepository;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @Mock JwtTokenProvider tokenProvider;
    @Mock AppUserRepository appUserRepository;
    @Mock FilterChain filterChain;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void validAccessToken_setsAuthentication() throws Exception {
        JwtAuthenticationFilter filter = new JwtAuthenticationFilter(tokenProvider, appUserRepository);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token123");
        MockHttpServletResponse response = new MockHttpServletResponse();

        when(tokenProvider.validateToken("token123")).thenReturn(true);
        when(tokenProvider.isRefreshToken("token123")).thenReturn(false);
        when(tokenProvider.getUsernameFromToken("token123")).thenReturn("alice");
        when(appUserRepository.findByUsername("alice")).thenReturn(Optional.empty());

        filter.doFilter(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication().getPrincipal()).isEqualTo("alice");
    }

    @Test
    void tokenWithStaleVersion_doesNotAuthenticate() throws Exception {
        JwtAuthenticationFilter filter = new JwtAuthenticationFilter(tokenProvider, appUserRepository);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer oldtok");
        MockHttpServletResponse response = new MockHttpServletResponse();

        AppUser user = new AppUser();
        user.setTokenVersion(2);              // password cambió → versión actual = 2

        when(tokenProvider.validateToken("oldtok")).thenReturn(true);
        when(tokenProvider.isRefreshToken("oldtok")).thenReturn(false);
        when(tokenProvider.getUsernameFromToken("oldtok")).thenReturn("alice");
        when(appUserRepository.findByUsername("alice")).thenReturn(Optional.of(user));
        when(tokenProvider.getTokenVersion("oldtok")).thenReturn(1); // token viejo = 1

        filter.doFilter(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    void tokenWithCurrentVersion_authenticates() throws Exception {
        JwtAuthenticationFilter filter = new JwtAuthenticationFilter(tokenProvider, appUserRepository);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer tok");
        MockHttpServletResponse response = new MockHttpServletResponse();

        AppUser user = new AppUser();
        user.setTokenVersion(3);

        when(tokenProvider.validateToken("tok")).thenReturn(true);
        when(tokenProvider.isRefreshToken("tok")).thenReturn(false);
        when(tokenProvider.getUsernameFromToken("tok")).thenReturn("alice");
        when(appUserRepository.findByUsername("alice")).thenReturn(Optional.of(user));
        when(tokenProvider.getTokenVersion("tok")).thenReturn(3);

        filter.doFilter(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication().getPrincipal()).isEqualTo("alice");
    }

    @Test
    void refreshToken_doesNotAuthenticate() throws Exception {
        JwtAuthenticationFilter filter = new JwtAuthenticationFilter(tokenProvider, appUserRepository);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer refresh");
        MockHttpServletResponse response = new MockHttpServletResponse();

        when(tokenProvider.validateToken("refresh")).thenReturn(true);
        when(tokenProvider.isRefreshToken("refresh")).thenReturn(true);

        filter.doFilter(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }
}
