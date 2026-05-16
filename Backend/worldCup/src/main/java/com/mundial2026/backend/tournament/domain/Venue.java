package com.mundial2026.backend.tournament.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "venue")
public class Venue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "external_provider_id", unique = true)
    private Long externalProviderId;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "city_name", length = 120)
    private String cityName;

    @Column(name = "country_name", length = 120)
    private String countryName;

    private Integer capacity;
}
