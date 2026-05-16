package com.mundial2026.backend.tournament.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "team")
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "external_provider_id", unique = true)
    private Long externalProviderId;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(name = "short_name", length = 80)
    private String shortName;

    @Column(name = "fifa_code", unique = true, length = 10)
    private String fifaCode;

    @Column(name = "country_name", length = 120)
    private String countryName;

    @Column(name = "flag_url", length = 500)
    private String flagUrl;
}
