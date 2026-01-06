package org.projekt.repositories;

import org.projekt.models.Container;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ContainerRepository extends JpaRepository<Container, Long> {

    @Query(value = "SELECT DISTINCT c.* FROM container c " +
            "LEFT JOIN user_container uc ON c.id = uc.container_id " +
            "WHERE c.user_id = :userId OR (uc.user_id = :userId AND uc.can_view = true)",
            nativeQuery = true)
    List<Container> findVisibleContainers(@Param("userId") Long userId);
}
