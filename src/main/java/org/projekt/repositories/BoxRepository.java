package org.projekt.repositories;

import org.projekt.models.Box;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BoxRepository extends JpaRepository<Box, Long> {

    // Vrátí všechny boxy, které uživatel vlastní nebo má sdílené (canView)
    @Query(value = "SELECT DISTINCT b.* FROM box b " +
            "LEFT JOIN user_box ub ON b.id = ub.box_id " +
            "WHERE b.user_id = :userId OR (ub.user_id = :userId AND ub.can_view = true)",
            nativeQuery = true)
    List<Box> findVisibleBoxes(@Param("userId") Long userId);

}
