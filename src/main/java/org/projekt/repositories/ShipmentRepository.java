package org.projekt.repositories;

import org.projekt.models.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ShipmentRepository extends JpaRepository<Shipment, Long> {

    @Query(value = "SELECT DISTINCT s.* FROM shipment s " +
            "LEFT JOIN user_shipment us ON s.id = us.shipment_id " +
            "WHERE s.user_id = :userId OR (us.user_id = :userId AND us.can_view = true)",
            nativeQuery = true)
    List<Shipment> findVisibleShipments(@Param("userId") Long userId);
}
