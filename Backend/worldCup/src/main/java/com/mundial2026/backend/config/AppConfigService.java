package com.mundial2026.backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AppConfigService {

    private final AppConfigRepository repository;

    @Transactional(readOnly = true)
    public Optional<String> getValue(String key) {
        return repository.findByConfigKey(key)
                .map(AppConfig::getConfigValue)
                .filter(v -> v != null && !v.isBlank());
    }

    @Transactional
    public void setValue(String key, String value) {
        AppConfig cfg = repository.findByConfigKey(key).orElseGet(() -> {
            AppConfig c = new AppConfig();
            c.setConfigKey(key);
            return c;
        });
        cfg.setConfigValue(value);
        cfg.setUpdatedAt(OffsetDateTime.now());
        repository.save(cfg);
    }

    @Transactional(readOnly = true)
    public boolean hasValue(String key) {
        return getValue(key).isPresent();
    }
}
