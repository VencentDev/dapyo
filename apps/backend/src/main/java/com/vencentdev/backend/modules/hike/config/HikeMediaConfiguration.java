package com.vencentdev.backend.modules.hike.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(HikeMediaProperties.class)
public class HikeMediaConfiguration {}
