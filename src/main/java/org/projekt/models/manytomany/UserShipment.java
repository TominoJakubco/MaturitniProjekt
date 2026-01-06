package org.projekt.models.manytomany;

import jakarta.persistence.*;
import org.projekt.models.Shipment;
import org.projekt.models.User;

@Entity
@Table(name = "user_shipment")
public class UserShipment {

    @EmbeddedId
    private UserShipmentId id;

    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @MapsId("shipmentId")
    @JoinColumn(name = "shipment_id")
    private Shipment shipment;

    private boolean canView = true;
    private boolean canEdit = false;

    public UserShipment() {}

    public UserShipment(User user, Shipment shipment, boolean canView, boolean canEdit) {
        this.user = user;
        this.shipment = shipment;
        this.canView = canView;
        this.canEdit = canEdit;
        this.id = new UserShipmentId(user.getId(), shipment.getId());
    }

    // Gettery a settery
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Shipment getShipment() { return shipment; }
    public void setShipment(Shipment shipment) { this.shipment = shipment; }

    public boolean isCanView() { return canView; }
    public void setCanView(boolean canView) { this.canView = canView; }

    public boolean isCanEdit() { return canEdit; }
    public void setCanEdit(boolean canEdit) { this.canEdit = canEdit; }
}
