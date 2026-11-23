package com.vencentdev.backend.modules.auth.service;

import com.vencentdev.backend.modules.auth.config.ApiTokenProperties;
import com.vencentdev.backend.modules.user.dto.UserResponse;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

@Service
public class ApiTokenService {

  private final JwtEncoder jwtEncoder;
  private final ApiTokenProperties properties;

  public ApiTokenService(JwtEncoder jwtEncoder, ApiTokenProperties properties) {
    this.jwtEncoder = jwtEncoder;
    this.properties = properties;
  }

  public String issue(UserResponse user) {
    Instant issuedAt = Instant.now();
    JwtClaimsSet claims =
        JwtClaimsSet.builder()
            .issuer(properties.issuer())
            .subject("credentials:" + user.email().trim().toLowerCase(Locale.ROOT))
            .audience(List.of(properties.audience()))
            .issuedAt(issuedAt)
            .expiresAt(issuedAt.plus(properties.accessTokenTtl()))
            .claim("email", user.email())
            .claim("name", user.displayName())
            .claim("realm_access", Map.of("roles", List.of(user.role().name())))
            .build();
    JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
    return jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
  }

  public long expiresInSeconds() {
    return properties.accessTokenTtl().toSeconds();
  }
}
