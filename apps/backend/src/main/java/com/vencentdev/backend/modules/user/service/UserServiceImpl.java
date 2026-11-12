package com.vencentdev.backend.modules.user.service;

import com.vencentdev.backend.common.exception.ResourceNotFoundException;
import com.vencentdev.backend.common.exception.ConflictException;
import com.vencentdev.backend.modules.auth.AuthenticatedUser;
import com.vencentdev.backend.modules.auth.dto.LoginRequest;
import com.vencentdev.backend.modules.auth.dto.RegisterRequest;
import com.vencentdev.backend.modules.user.dto.UserResponse;
import com.vencentdev.backend.modules.user.dto.UserUpdateRequest;
import com.vencentdev.backend.modules.user.entity.User;
import com.vencentdev.backend.modules.user.enums.KycStatus;
import com.vencentdev.backend.modules.user.enums.Role;
import com.vencentdev.backend.modules.user.enums.UserType;
import com.vencentdev.backend.modules.user.mapper.UserMapper;
import com.vencentdev.backend.modules.user.repository.UserRepository;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserServiceImpl implements UserService {

  private final UserRepository repository;
  private final UserMapper mapper;
  private final PasswordEncoder passwordEncoder;

  @Autowired
  public UserServiceImpl(
      UserRepository repository, UserMapper mapper, PasswordEncoder passwordEncoder) {
    this.repository = repository;
    this.mapper = mapper;
    this.passwordEncoder = passwordEncoder;
  }

  public UserServiceImpl(UserRepository repository, UserMapper mapper) {
    this(repository, mapper, new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder());
  }

  @Override
  @Transactional
  public UserResponse findOrProvision(AuthenticatedUser principal) {
    return repository
        .findByExternalId(principal.subject())
        .map(mapper::toResponse)
        .orElseGet(() -> mapper.toResponse(repository.save(newUser(principal))));
  }

  @Override
  @Transactional(readOnly = true)
  public UserResponse getMe(AuthenticatedUser principal) {
    return mapper.toResponse(findByPrincipal(principal));
  }

  @Override
  @Transactional
  public UserResponse register(RegisterRequest request) {
    String email = normalizeEmail(request.email());
    if (repository.existsByEmail(email)) {
      throw new ConflictException("An account with this email already exists");
    }

    User user =
        User.builder()
            .externalId("credentials:" + email)
            .email(email)
            .displayName(request.firstName().trim() + " " + request.lastName().trim())
            .passwordHash(passwordEncoder.encode(request.password()))
            .role(Role.USER)
            .userType(UserType.INDIVIDUAL)
            .kycStatus(KycStatus.NONE)
            .build();
    return mapper.toResponse(repository.save(user));
  }

  @Override
  @Transactional(readOnly = true)
  public UserResponse authenticate(LoginRequest request) {
    User user = repository.findByEmail(normalizeEmail(request.email())).orElseThrow(
        () -> new BadCredentialsException("Invalid email or password"));
    if (user.getPasswordHash() == null
        || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
      throw new BadCredentialsException("Invalid email or password");
    }
    return mapper.toResponse(user);
  }

  @Override
  @Transactional
  public UserResponse updateMe(AuthenticatedUser principal, UserUpdateRequest request) {
    User user = findByPrincipal(principal);
    mapper.applyUpdate(request, user);
    return mapper.toResponse(user);
  }

  @Override
  @Transactional
  public UUID resolveInternalId(AuthenticatedUser principal) {
    return repository
        .findByExternalId(principal.subject())
        .orElseGet(() -> repository.save(newUser(principal)))
        .getId();
  }

  private User findByPrincipal(AuthenticatedUser principal) {
    return repository
        .findByExternalId(principal.subject())
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
  }

  private User newUser(AuthenticatedUser principal) {
    return User.builder()
        .externalId(principal.subject())
        .email(principal.email())
        .displayName(principal.displayName())
        .role(Role.USER)
        .userType(UserType.INDIVIDUAL)
        .kycStatus(KycStatus.NONE)
        .build();
  }

  private String normalizeEmail(String email) {
    return email.trim().toLowerCase(java.util.Locale.ROOT);
  }
}
