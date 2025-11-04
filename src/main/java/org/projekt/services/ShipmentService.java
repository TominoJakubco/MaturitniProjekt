package org.projekt.services;

import org.projekt.models.Container;
import org.projekt.models.Shipment;
import org.projekt.repositories.ContainerRepository;
import org.projekt.repositories.ShipmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ShipmentService {
    private final ShipmentRepository shipmentRepository;

    public ShipmentService(ShipmentRepository shipmentRepository) {
        this.shipmentRepository = shipmentRepository;
    }

    // CREATE
    public Shipment createShipment(Shipment shipment) {
        System.out.println("Received shipment: " + shipment.getName());
        return shipmentRepository.save(shipment);
    }

    // READ - všechni uživatelé
    public List<Shipment> getAllShipments() {
        return shipmentRepository.findAll();
    }

    // READ - jeden podle ID
    public Optional<Shipment> getShipmentById(Long id) {
        return shipmentRepository.findById(id);
    }

    // UPDATE
    public Shipment updateShipment(Long id, Shipment updatedShipment) {
        return shipmentRepository.findById(id).map(shipment -> {
            shipment.setName(updatedShipment.getName());
            shipment.setContainer(updatedShipment.getContainer());
            shipment.setBoxes(updatedShipment.getBoxes());
            shipment.setWeightTotal(updatedShipment.getWeightTotal());
            shipment.setUnusedSpace(updatedShipment.getUnusedSpace());
            return shipmentRepository.save(shipment);
        }).orElseThrow(() -> new RuntimeException("Shipment not found"));
    }

    // DELETE
    public void deleteShipment(Long id) {
        shipmentRepository.deleteById(id);
    }
}
