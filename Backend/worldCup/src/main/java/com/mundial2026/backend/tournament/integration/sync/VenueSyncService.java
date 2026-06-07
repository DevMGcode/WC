package com.mundial2026.backend.tournament.integration.sync;

import com.mundial2026.backend.tournament.domain.Venue;
import com.mundial2026.backend.tournament.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Upsert de venues con estrategia dual:
 * <ol>
 *   <li>Si {@code externalId != null} → buscar/crear por external_provider_id.
 *       Es el camino limpio: el proveedor garantiza unicidad del id.</li>
 *   <li>Si {@code externalId == null} → buscar por (name, city) case-insensitive.
 *       Necesario porque API-Football devuelve {@code venue.id=null} para estadios
 *       sin liga regular indexada (NFL stadiums en 2026, Qatar 2022 completo, etc.).</li>
 * </ol>
 *
 * <p>El método {@link #resolveOrCreate(Long, String, String)} es idempotente:
 * múltiples llamadas con los mismos datos devuelven la misma fila sin duplicar.
 *
 * <p><b>Nota:</b> el {@code @Transactional} hereda la transacción del caller
 * ({@code FixtureSyncService.persist} ya viene con {@code @Transactional}),
 * así que el insert nuevo participa de la misma unidad de trabajo y se hace rollback
 * junto con el fixture si algo falla aguas arriba.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class VenueSyncService {

    private final VenueRepository venueRepository;

    @Transactional
    public Optional<Venue> resolveOrCreate(Long externalId, String name, String city) {
        // Sin nombre no hay forma de identificar el venue ni de mostrarlo en la UI.
        // El proveedor a veces devuelve venue={null,null,null} para fixtures TBD.
        if (name == null || name.isBlank()) {
            return Optional.empty();
        }

        // Ruta A — por id externo (preferida).
        if (externalId != null) {
            Optional<Venue> existing = venueRepository.findByExternalProviderId(externalId);
            if (existing.isPresent()) {
                return Optional.of(maybeUpdate(existing.get(), name, city));
            }
            return Optional.of(create(externalId, name, city));
        }

        // Ruta B — fallback por (name, city). Sirve para estadios US 2026, Qatar 2022, etc.
        // Sin city no podemos garantizar unicidad (puede haber estadios con el mismo
        // nombre en ciudades distintas), así que también lo saltamos.
        if (city == null || city.isBlank()) {
            log.debug("Skipping venue without city and without externalId: name={}", name);
            return Optional.empty();
        }
        Optional<Venue> existing = venueRepository.findByNameAndCityIgnoreCase(name, city);
        if (existing.isPresent()) {
            return Optional.of(maybeUpdate(existing.get(), name, city));
        }
        return Optional.of(create(null, name, city));
    }

    private Venue create(Long externalId, String name, String city) {
        Venue v = new Venue();
        v.setExternalProviderId(externalId);
        v.setName(name);
        v.setCityName(city);
        Venue saved = venueRepository.save(v);
        log.info("Created venue id={} extId={} name='{}' city='{}'",
                saved.getId(), externalId, name, city);
        return saved;
    }

    /**
     * Actualiza nombre/ciudad si cambiaron (puede pasar si el proveedor corrige typos).
     * Devuelve la misma instancia gestionada por JPA — el flush ocurre al final de la transacción.
     */
    private Venue maybeUpdate(Venue v, String name, String city) {
        boolean changed = false;
        if (name != null && !name.equals(v.getName())) {
            v.setName(name);
            changed = true;
        }
        if (city != null && !city.equals(v.getCityName())) {
            v.setCityName(city);
            changed = true;
        }
        if (changed) {
            log.debug("Updated venue id={} name='{}' city='{}'", v.getId(), name, city);
        }
        return v;
    }
}
