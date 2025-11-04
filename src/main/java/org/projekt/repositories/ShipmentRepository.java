package org.projekt.repositories;

import org.projekt.controllers.ShipmentController;
import org.projekt.models.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ShipmentRepository extends JpaRepository<Shipment, Long> {
    Optional<Shipment> findShipmentById(Long id);
}
