package com.vencentdev.backend.modules.hike.storage;

import java.io.IOException;

public interface HikeImageStorage {

  String store(byte[] content) throws IOException;

  byte[] read(String storageKey) throws IOException;

  void delete(String storageKey) throws IOException;
}
