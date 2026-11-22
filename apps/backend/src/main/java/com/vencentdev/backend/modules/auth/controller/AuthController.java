package com.vencentdev.backend.modules.auth.controller;

import com.vencentdev.backend.modules.auth.AuthenticatedUser;
import com.vencentdev.backend.modules.auth.CurrentUser;
import com.vencentdev.backend.modules.auth.dto.LoginRequest;
import com.vencentdev.backend.modules.auth.dto.LoginResponse;
import com.vencentdev.backend.modules.auth.dto.RegisterRequest;
import com.vencentdev.backend.modules.auth.service.ApiTokenService;
import com.vencentdev.backend.modules.auth.service.CredentialsRegistrationService;
import com.vencentdev.backend.modules.user.dto.UserResponse;
import com.vencentdev.backend.modules.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

  private final UserService users;
  private final ApiTokenService apiTokens;
  private final CredentialsRegistrationService registrations;

  public AuthController(
      UserService users, ApiTokenService apiTokens, CredentialsRegistrationService registrations) {
    this.users = users;
    this.apiTokens = apiTokens;
    this.registrations = registrations;
  }

  @GetMapping("/me")
  public UserResponse me(@CurrentUser AuthenticatedUser user) {
    return users.findOrProvision(user);
  }

  @PostMapping("/register")
  public UserResponse register(@Valid @RequestBody RegisterRequest request) {
    return registrations.register(request);
  }

  @PostMapping("/login")
  public LoginResponse login(@Valid @RequestBody LoginRequest request) {
    UserResponse user = users.authenticate(request);
    return new LoginResponse(user, apiTokens.issue(user), "Bearer", apiTokens.expiresInSeconds());
  }
}
