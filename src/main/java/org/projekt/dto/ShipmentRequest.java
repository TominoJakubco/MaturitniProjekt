package org.projekt.dto;

import java.util.List;

public class ShipmentRequest {
    private String shipmentName;
    private Long containerTypeId; // container template ID
    private List<Long> boxes;     // box type IDs (to fetch from DB)

    public String getShipmentName() { return shipmentName; }
    public void setShipmentName(String shipmentName) { this.shipmentName = shipmentName; }

    public Long getContainerTypeId() { return containerTypeId; }
    public void setContainerTypeId(Long containerTypeId) { this.containerTypeId = containerTypeId; }

    public List<Long> getBoxes() { return boxes; }
    public void setBoxes(List<Long> boxes) { this.boxes = boxes; }
}