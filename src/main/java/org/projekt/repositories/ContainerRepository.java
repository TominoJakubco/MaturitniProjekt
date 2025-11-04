package org.projekt.repositories;

import org.projekt.models.Container;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ContainerRepository extends JpaRepository<Container, Long> {
    Optional<Container> findContainerById(Long id);
}
