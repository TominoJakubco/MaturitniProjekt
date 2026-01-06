package org.projekt.services;

import org.projekt.models.Shipment;
import org.projekt.models.User;
import org.projekt.models.manytomany.UserShipment;
import org.projekt.repositories.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final UserShipmentRepository userShipmentRepository;
    private final UserRepository userRepository;

    public ShipmentService(ShipmentRepository shipmentRepository,
                           UserShipmentRepository userShipmentRepository,
                           UserRepository userRepository) {
        this.shipmentRepository = shipmentRepository;
        this.userShipmentRepository = userShipmentRepository;
        this.userRepository = userRepository;
    }

    // ── Helper ─────────────────────────────────────────────────────────────────

    private boolean isAdmin(User user) {
        return user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    private User getByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // ── CREATE ─────────────────────────────────────────────────────────────────

    public Shipment saveShipment(Shipment shipment, String email) {
        User owner = getByEmail(email);
        shipment.setOwner(owner);
        return shipmentRepository.save(shipment);
    }

    // ── READ ───────────────────────────────────────────────────────────────────

    public List<Shipment> getVisibleShipments(String email) {
        User user = getByEmail(email);
        if (isAdmin(user)) return shipmentRepository.findAll();
        return shipmentRepository.findVisibleShipments(user.getId());
    }

    public List<Shipment> getAllShipments(String email) {
        User user = getByEmail(email);
        if (!isAdmin(user)) throw new RuntimeException("Only admin can access all shipments");
        return shipmentRepository.findAll();
    }

    public Optional<Shipment> getShipmentByIdWithPermission(Long id, String email) {
        User user = getByEmail(email);

        Optional<Shipment> shipmentOpt = shipmentRepository.findById(id);
        if (shipmentOpt.isEmpty()) return Optional.empty();
        Shipment shipment = shipmentOpt.get();

        if (isAdmin(user)) return Optional.of(shipment);

        if (shipment.getOwner().getId().equals(user.getId())) return Optional.of(shipment);

        return userShipmentRepository
                .findByUserAndShipment(user, shipment)
                .filter(UserShipment::isCanView)
                .map(us -> shipment);
    }

    // ── DELETE ─────────────────────────────────────────────────────────────────

    public void deleteShipmentWithPermission(Long id, String email) {
        User user = getByEmail(email);
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shipment not found"));

        if (!isAdmin(user)) {
            if (!shipment.getOwner().getId().equals(user.getId())) {
                UserShipment permission = userShipmentRepository
                        .findByUserAndShipment(user, shipment)
                        .orElseThrow(() -> new RuntimeException("No permission"));
                if (!permission.isCanEdit()) throw new RuntimeException("No permission to delete");
            }
        }

        shipmentRepository.delete(shipment);
    }

    // ── SHARE ──────────────────────────────────────────────────────────────────

    public UserShipment shareShipment(Long shipmentId,
                                      Long targetUserId,
                                      boolean canView,
                                      boolean canEdit,
                                      String ownerEmail) {

        User owner = getByEmail(ownerEmail);
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new RuntimeException("Shipment not found"));

        if (!isAdmin(owner) && !shipment.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("Only owner can share shipment");
        }

        if (owner.getId().equals(targetUserId)) {
            throw new RuntimeException("Cannot share with yourself");
        }

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("Target user not found"));

        UserShipment userShipment = new UserShipment(targetUser, shipment, canView, canEdit);
        return userShipmentRepository.save(userShipment);
    }
}