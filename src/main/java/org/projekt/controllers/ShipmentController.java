package org.projekt.controllers;

import org.projekt.dto.ShipmentRequest;
import org.projekt.dto.ShipmentVisualizationDTO;
import org.projekt.models.Shipment;
import org.projekt.models.manytomany.UserShipment;
import org.projekt.services.BoxPackingService;
import org.projekt.services.BoxPackingServiceToo;
import org.projekt.services.ShipmentService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.projekt.services.RealisticPackingService;

import java.util.List;

@RestController
@RequestMapping("/api/shipments")
public class ShipmentController {

    private final BoxPackingService boxPackingService;
    private final BoxPackingServiceToo boxPackingServiceToo;
    private final ShipmentService shipmentService;
    private final RealisticPackingService realisticPackingService;



    public ShipmentController(BoxPackingService boxPackingService, BoxPackingServiceToo boxPackingServiceToo, ShipmentService shipmentService, RealisticPackingService realisticPackingService) {
        this.boxPackingService = boxPackingService;
        this.boxPackingServiceToo = boxPackingServiceToo;
        this.shipmentService = shipmentService;
        this.realisticPackingService = realisticPackingService;
    }

    private String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null) {
            throw new RuntimeException("No authentication found");
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        } else if (principal instanceof String) {
            return (String) principal;
        }

        throw new RuntimeException("User not authenticated. Principal type: " + principal.getClass().getName());
    }

    // =========================
    // CREATE skjolber
    // =========================
    @PostMapping ("/skjolber")
    public Shipment createSkjolberShipment(@RequestBody ShipmentRequest request) {
        Shipment shipment = boxPackingService.packShipment(
                request.getShipmentName(),
                request.getBoxes(),
                request.getContainerTypeId()
        );
        return shipmentService.saveShipment(shipment, getCurrentUserEmail());
    }

    @PostMapping ("/xflp")
    public Shipment createXflpShipment(@RequestBody ShipmentRequest request) {
        Shipment shipment = boxPackingServiceToo.packShipment(
                request.getShipmentName(),
                request.getBoxes(),
                request.getContainerTypeId()
        );
        return shipmentService.saveShipment(shipment, getCurrentUserEmail());
    }

    @PostMapping ("/realistic")
    public Shipment createRealisticShipment(@RequestBody ShipmentRequest request) {
        Shipment shipment = realisticPackingService.packShipment(
                request.getShipmentName(),
                request.getBoxes(),
                request.getContainerTypeId()
        );
        return shipmentService.saveShipment(shipment, getCurrentUserEmail());
    }

    @GetMapping("/all")
    public List<Shipment> getAllShipmentsAdmin() {
        return shipmentService.getAllShipments(getCurrentUserEmail());
    }

    // =========================
    // READ - všechny viditelné shipmenty
    // =========================
    @GetMapping
    public List<Shipment> getAllShipments() {
        return shipmentService.getVisibleShipments(getCurrentUserEmail());
    }

    // =========================
    // READ - jeden shipment podle ID
    // =========================
    @GetMapping("/{id}")
    public Shipment getShipmentById(@PathVariable Long id) {
        return shipmentService.getShipmentByIdWithPermission(id, getCurrentUserEmail())
                .orElseThrow(() -> new RuntimeException("Shipment not found or no permission"));
    }

    // =========================
    // DELETE
    // =========================
    @DeleteMapping("/{id}")
    public void deleteShipment(@PathVariable Long id) {
        shipmentService.deleteShipmentWithPermission(id, getCurrentUserEmail());
    }

    // =========================
    // SHARE
    // =========================
    @PostMapping("/{id}/share")
    public UserShipment shareShipment(
            @PathVariable Long id,
            @RequestParam Long targetUserId,
            @RequestParam boolean canView,
            @RequestParam boolean canEdit) {

        return shipmentService.shareShipment(
                id,
                targetUserId,
                canView,
                canEdit,
                getCurrentUserEmail()
        );
    }

    // =========================
    // VISUALIZATION
    // =========================
    @GetMapping("/{id}/visualization")
    public ShipmentVisualizationDTO getVisualization(@PathVariable Long id) {
        Shipment shipment = shipmentService
                .getShipmentByIdWithPermission(id, getCurrentUserEmail())
                .orElseThrow(() -> new RuntimeException("Shipment not found or no permission"));

        ShipmentVisualizationDTO dto = new ShipmentVisualizationDTO();
        dto.setContainers(
                shipment.getContainers().stream().map(ci -> {
                    ShipmentVisualizationDTO.ContainerDTO c = new ShipmentVisualizationDTO.ContainerDTO();
                    c.setName(ci.getContainerType().getName());
                    c.setWidth(ci.getContainerType().getWidth());
                    c.setLength(ci.getContainerType().getLength());
                    c.setHeight(ci.getContainerType().getHeight());
                    c.setPlacements(
                            ci.getPlacements().stream().map(p -> {
                                ShipmentVisualizationDTO.PlacementDTO pd = new ShipmentVisualizationDTO.PlacementDTO();
                                pd.setPlacementId(p.getId());
                                pd.setBoxId(p.getBox() != null ? p.getBox().getId() : null);
                                pd.setBoxName(p.getBox() != null ? p.getBox().getName() : "box");
                                pd.setX(p.getMinX());
                                pd.setY(p.getMinY());
                                pd.setZ(p.getMinZ());
                                pd.setDx(p.getMaxX() - p.getMinX());
                                pd.setDy(p.getMaxY() - p.getMinY());
                                pd.setDz(p.getMaxZ() - p.getMinZ());
                                return pd;
                            }).toList()
                    );
                    return c;
                }).toList()
        );
        return dto;
    }
}