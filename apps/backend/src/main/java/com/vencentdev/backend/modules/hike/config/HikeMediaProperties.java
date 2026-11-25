package com.vencentdev.backend.modules.hike.config;

import java.nio.file.Path;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.hikes")
public record HikeMediaProperties(Path mediaDir) {}
