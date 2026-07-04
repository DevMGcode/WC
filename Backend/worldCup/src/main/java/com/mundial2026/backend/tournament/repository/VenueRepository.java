package com.mundial2026.backend.tournament.repository;

import com.mundial2026.backend.tournament.domain.Venue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

/**
 * Repository for {@link Venue}.
 *
 * <p><b>Por qué dos lookups distintos:</b> API-Football devuelve {@code venue.id=null}
 * para estadios que no participan en ninguna liga regular indexada en su sistema.
 * Confirmado contra datos reales:
 * <ul>
 *   <li>Mundial 2018 Rusia: 14/64 fixtures con {@code venue.id=null} (Luzhniki, etc.)</li>
 *   <li>Mundial 2022 Qatar: 56/64 (87% — casi todos los estadios qataríes)</li>
 *   <li>Mundial 2026 US/CAN/MX: 38/72 (los 8 estadios estilo NFL de EE.UU.)</li>
 * </ul>
 *
 * <p>Por eso necesitamos <b>dos rutas de upsert</b>:
 * <ol>
 *   <li>{@link #findByExternalProviderId(Long)} — preferida cuando el id existe.</li>
 *   <li>{@link #findByNameAndCityIgnoreCase(String, String)} — fallback para venues
 *       sin id. Comparación case-insensitive para tolerar variaciones del proveedor.</li>
 * </ol>
 */
public interface VenueRepository extends JpaRepository<Venue, Long> {

    /**
     * Venues con este {@code external_provider_id}, ordenados por id ascendente.
     *
     * <p>Devolvemos {@link List} (no {@link java.util.Optional}) a propósito: aunque
     * lo normal es 0 o 1 fila, el histórico puede tener duplicados (venues demo
     * insertados manualmente antes de que existiera el upsert por id). Con {@code Optional}
     * eso reventaba con {@code NonUniqueResultException} y abortaba TODO el sync de fixtures.
     * Con {@code List} el caller elige de forma determinista (el primero) y sigue.
     */
    List<Venue> findByExternalProviderIdOrderByIdAsc(Long externalProviderId);

    /**
     * Lookup case-insensitive por (name, city). Solo se usa cuando el venue viene
     * sin {@code external_provider_id}. Para venues con id, preferir {@link #findByExternalProviderIdOrderByIdAsc}.
     *
     * <p>Devuelve {@link List} ordenada (primero el que tenga {@code external_provider_id},
     * luego menor id) por la misma razón: tolerar duplicados históricos sin reventar el sync.
     */
    @Query("SELECT v FROM Venue v " +
           "WHERE LOWER(v.name) = LOWER(:name) " +
           "  AND LOWER(v.cityName) = LOWER(:city) " +
           "ORDER BY v.externalProviderId ASC NULLS LAST, v.id ASC")
    List<Venue> findAllByNameAndCityIgnoreCase(String name, String city);
}
