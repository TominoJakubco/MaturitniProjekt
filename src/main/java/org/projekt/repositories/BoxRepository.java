package org.projekt.repositories;

import org.projekt.models.Box;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BoxRepository extends JpaRepository<Box, Long> {
    Optional<Box> findBoxById(Long id);
}
