package com.vencentdev.backend.modules.auth.config;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.auth.jwt")
public record ApiTokenProperties(
    String secret, String issuer, String audience, Duration accessTokenTtl) {}
