package com.mundial2026.backend.tournament.integration.sync;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import com.mundial2026.backend.tournament.integration.apifootball.ApiFootballClient;
import com.mundial2026.backend.tournament.integration.apifootball.dto.StatusResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class QuotaMonitorJobTest {

    @Mock private ApiFootballClient client;

    private QuotaMonitorJob subject;
    private ListAppender<ILoggingEvent> appender;
    private Logger jobLogger;

    @BeforeEach
    void setUp() {
        subject = new QuotaMonitorJob(client);
        jobLogger = (Logger) LoggerFactory.getLogger(QuotaMonitorJob.class);
        appender = new ListAppender<>();
        appender.start();
        jobLogger.addAppender(appender);
    }

    @AfterEach
    void tearDown() {
        jobLogger.detachAppender(appender);
    }

    @Test
    void logsInfoWhenBelowThreshold() {
        when(client.fetchAccountStatus()).thenReturn(Optional.of(status("Mega", 3000, 150000)));

        subject.monitor();

        assertThat(messagesAtLevel(Level.INFO)).anyMatch(m -> m.contains("3000/150000"));
        assertThat(messagesAtLevel(Level.WARN)).isEmpty();
    }

    @Test
    void logsWarnAt80Percent() {
        when(client.fetchAccountStatus()).thenReturn(Optional.of(status("Pro", 6000, 7500)));

        subject.monitor();

        assertThat(messagesAtLevel(Level.WARN)).isNotEmpty();
        assertThat(messagesAtLevel(Level.WARN)).anyMatch(m -> m.contains("6000/7500"));
    }

    @Test
    void doesNotWarnAt79Percent() {
        when(client.fetchAccountStatus()).thenReturn(Optional.of(status("Pro", 5924, 7500)));

        subject.monitor();

        assertThat(messagesAtLevel(Level.WARN)).isEmpty();
    }

    @Test
    void swallowsExceptions() {
        when(client.fetchAccountStatus()).thenThrow(new RuntimeException("api down"));

        // does not throw
        subject.monitor();

        assertThat(messagesAtLevel(Level.WARN)).anyMatch(m -> m.contains("api down"));
    }

    @Test
    void noOpWhenStatusEmpty() {
        when(client.fetchAccountStatus()).thenReturn(Optional.empty());

        subject.monitor();

        assertThat(appender.list).isEmpty();
    }

    @Test
    void noOpWhenRequestsIsNull() {
        when(client.fetchAccountStatus()).thenReturn(Optional.of(
                new StatusResponse(null, new StatusResponse.Subscription("Mega", "2026-08-23", true), null)));

        subject.monitor();

        assertThat(appender.list).isEmpty();
    }

    private StatusResponse status(String plan, int current, int limit) {
        return new StatusResponse(
                new StatusResponse.Account("Andres", "T", "andres@example.com"),
                new StatusResponse.Subscription(plan, "2026-08-23T16:37:16+00:00", true),
                new StatusResponse.Requests(current, limit));
    }

    private List<String> messagesAtLevel(Level level) {
        return appender.list.stream()
                .filter(e -> e.getLevel() == level)
                .map(ILoggingEvent::getFormattedMessage)
                .toList();
    }
}
