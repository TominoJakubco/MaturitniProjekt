package org.projekt.repositories;

import org.projekt.models.Shipment;
import org.projekt.models.User;
import org.projekt.models.manytomany.UserShipment;
import org.projekt.models.manytomany.UserShipmentId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserShipmentRepository extends JpaRepository<UserShipment, UserShipmentId> {

    // Najde přístup pro konkrétního uživatele a shipment
    Optional<UserShipment> findByUserAndShipment(User user, Shipment shipment);
}
