package org.projekt.models.manytomany;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class UserShipmentId implements Serializable {

    private Long userId;
    private Long shipmentId;

    public UserShipmentId() {}

    public UserShipmentId(Long userId, Long shipmentId) {
        this.userId = userId;
        this.shipmentId = shipmentId;
    }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getShipmentId() { return shipmentId; }
    public void setShipmentId(Long shipmentId) { this.shipmentId = shipmentId; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof UserShipmentId)) return false;
        UserShipmentId that = (UserShipmentId) o;
        return Objects.equals(userId, that.userId) &&
                Objects.equals(shipmentId, that.shipmentId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, shipmentId);
    }
}
