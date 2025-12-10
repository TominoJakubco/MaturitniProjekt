package org.projekt.controllers;

import org.projekt.dto.ShipmentRequest;
import org.projekt.dto.ShipmentVisualizationDTO;
import org.projekt.models.*;
import org.projekt.services.BoxPackingService;
import org.projekt.repositories.ShipmentRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/shipments")
public class ShipmentController {

    private final BoxPackingService boxPackingService;
    private final ShipmentRepository shipmentRepository;

    public ShipmentController(BoxPackingService boxPackingService, ShipmentRepository shipmentRepository) {
        this.boxPackingService = boxPackingService;
        this.shipmentRepository = shipmentRepository;
    }

    @PostMapping
    public Shipment createShipment(
            @RequestBody ShipmentRequest request
    ) {
        // Run packing logic
        Shipment shipment = boxPackingService.packShipment(
                request.getShipmentName(),
                request.getBoxes(),
                request.getContainerTypeId()

        );

        // Save result
        return shipmentRepository.save(shipment);
    }

    @GetMapping
    public List<Shipment> getAllShipments() {
        return shipmentRepository.findAll();
    }

    @GetMapping("/{id}")
    public Shipment getShipmentById(@PathVariable Long id) {
        return shipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shipment not found"));
    }


    @GetMapping("/{id}/visualization")
    public ShipmentVisualizationDTO getVisualization(@PathVariable Long id) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shipment not found"));

        ShipmentVisualizationDTO dto = new ShipmentVisualizationDTO();

        List<ShipmentVisualizationDTO.ContainerDTO> containerDTOS = shipment.getContainers().stream().map(ci -> {
            ShipmentVisualizationDTO.ContainerDTO c = new ShipmentVisualizationDTO.ContainerDTO();
            c.setName(ci.getContainerType().getName());
            c.setLength(ci.getContainerType().getLength());
            c.setWidth(ci.getContainerType().getWidth());
            c.setHeight(ci.getContainerType().getHeight());

            List<ShipmentVisualizationDTO.PlacementDTO> placements = ci.getPlacements().stream().map(p -> {
                ShipmentVisualizationDTO.PlacementDTO pd = new ShipmentVisualizationDTO.PlacementDTO();
                pd.setPlacementId(p.getId());
                pd.setBoxId(p.getBox() != null ? p.getBox().getId() : null);
                pd.setBoxName(p.getBox() != null ? p.getBox().getName() : "box");

                // Position is the minimum corner
                pd.setX(p.getMinX());
                pd.setY(p.getMinY());
                pd.setZ(p.getMinZ());

                // CRITICAL FIX: Use the actual box dimensions from the Box entity
                // The 3D bin packing library may rotate boxes, so we need to determine
                // which dimension maps to which axis based on the rotation
                Box box = p.getBox();
                if (box != null) {
                    // Get the actual placed dimensions (considering rotation)
                    double placedDx = p.getMaxX() - p.getMinX();
                    double placedDy = p.getMaxY() - p.getMinY();
                    double placedDz = p.getMaxZ() - p.getMinZ();

                    // Use the placed dimensions directly
                    pd.setDx(placedDx);
                    pd.setDy(placedDy);
                    pd.setDz(placedDz);

                    // Optional: Add rotation info if needed for debugging
                    // pd.setRotation(p.getRotation());
                } else {
                    // Fallback if box is null
                    pd.setDx(p.getMaxX() - p.getMinX());
                    pd.setDy(p.getMaxY() - p.getMinY());
                    pd.setDz(p.getMaxZ() - p.getMinZ());
                }

                return pd;
            }).toList();

            c.setPlacements(placements);
            return c;
        }).toList();

        dto.setContainers(containerDTOS);
        return dto;
    }
}
