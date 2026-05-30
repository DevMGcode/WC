package com.mundial2026.backend.config;

import com.mundial2026.backend.common.exception.ExternalApiUnavailableException;
import com.mundial2026.backend.tournament.integration.apifootball.ApiFootballProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.time.Duration;

@Configuration
@EnableConfigurationProperties(ApiFootballProperties.class)
public class HttpClientConfig {

    @Bean
    public RestClient apiFootballRestClient(ApiFootballProperties props) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofMillis(props.connectTimeoutMs()));
        requestFactory.setReadTimeout(Duration.ofMillis(props.timeoutMs()));

        RestClient.Builder builder = RestClient.builder()
                .baseUrl(props.baseUrl())
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .requestFactory(requestFactory)
                .defaultStatusHandler(
                        HttpStatusCode::is5xxServerError,
                        (req, res) -> {
                            throw new ExternalApiUnavailableException(res.getStatusCode());
                        });

        applyAuthHeaders(builder, props);
        return builder.build();
    }

    private void applyAuthHeaders(RestClient.Builder builder, ApiFootballProperties props) {
        if (props.apiKey() == null || props.apiKey().isBlank()) {
            return;
        }
        switch (props.mode()) {
            case RAPIDAPI -> {
                builder.defaultHeader("x-rapidapi-key", props.apiKey());
                builder.defaultHeader("x-rapidapi-host", props.rapidapiHost());
            }
            case DIRECT -> builder.defaultHeader("x-apisports-key", props.apiKey());
        }
    }
}