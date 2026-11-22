package com.vencentdev.backend.config;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import com.vencentdev.backend.modules.auth.config.ApiTokenProperties;
import java.util.Base64;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

@Configuration
@EnableConfigurationProperties(ApiTokenProperties.class)
public class ApiTokenConfiguration {

  @Bean
  SecretKey apiTokenSigningKey(ApiTokenProperties properties) {
    byte[] keyBytes;
    try {
      keyBytes = Base64.getDecoder().decode(properties.secret());
    } catch (IllegalArgumentException exception) {
      throw new IllegalStateException("APP_AUTH_JWT_SECRET must be base64 encoded", exception);
    }
    if (keyBytes.length < 32) {
      throw new IllegalStateException("APP_AUTH_JWT_SECRET must contain at least 32 bytes");
    }
    return new SecretKeySpec(keyBytes, "HmacSHA256");
  }

  @Bean
  JwtEncoder apiJwtEncoder(SecretKey apiTokenSigningKey) {
    return new NimbusJwtEncoder(new ImmutableSecret<>(apiTokenSigningKey));
  }

  @Bean
  JwtDecoder apiJwtDecoder(SecretKey apiTokenSigningKey, ApiTokenProperties properties) {
    NimbusJwtDecoder decoder =
        NimbusJwtDecoder.withSecretKey(apiTokenSigningKey).macAlgorithm(MacAlgorithm.HS256).build();
    OAuth2TokenValidator<Jwt> issuerValidator =
        JwtValidators.createDefaultWithIssuer(properties.issuer());
    OAuth2TokenValidator<Jwt> audienceValidator =
        jwt ->
            jwt.getAudience().contains(properties.audience())
                ? OAuth2TokenValidatorResult.success()
                : OAuth2TokenValidatorResult.failure(
                    new OAuth2Error("invalid_token", "Invalid token audience", null));
    decoder.setJwtValidator(
        new org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator<>(
            issuerValidator, audienceValidator));
    return decoder;
  }
}
