package org.projekt.controllers;


import org.projekt.models.Shipment;
import org.projekt.services.ShipmentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shipments")
public class ShipmentController {
    private final ShipmentService shipmentService;

    public ShipmentController(ShipmentService shipmentService) {
        this.shipmentService = shipmentService;
    }

    // CREATE
    @PostMapping
    public Shipment createShipment(@RequestBody Shipment shipment) {
        System.out.println("Received shipment: " + shipment.getName());
        return shipmentService.createShipment(shipment);
    }

    // READ - všechny
    @GetMapping
    public List<Shipment> getAllShipments() {
        return shipmentService.getAllShipments();
    }

    // READ - jeden podle ID
    @GetMapping("/{id}")
    public Shipment getShipmentById(@PathVariable Long id) {
        return shipmentService.getShipmentById(id)
                .orElseThrow(() -> new RuntimeException("shipment not found"));
    }

    // UPDATE
    @PutMapping("/{id}")
    public Shipment updateShipment(@PathVariable Long id, @RequestBody Shipment updatedShipment) {
        return shipmentService.updateShipment(id, updatedShipment);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public void deleteShipment(@PathVariable Long id) {
        shipmentService.deleteShipment(id);
    }
}
