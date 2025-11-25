package org.projekt.dto;

import java.util.List;

public class ShipmentVisualizationDTO {
    private List<ContainerDTO> containers;

    public List<ContainerDTO> getContainers() { return containers; }
    public void setContainers(List<ContainerDTO> containers) { this.containers = containers; }

    public static class ContainerDTO {
        private String name;
        private double length;
        private double width;
        private double height;
        private List<PlacementDTO> placements;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public double getLength() { return length; }
        public void setLength(double length) { this.length = length; }
        public double getWidth() { return width; }
        public void setWidth(double width) { this.width = width; }
        public double getHeight() { return height; }
        public void setHeight(double height) { this.height = height; }
        public List<PlacementDTO> getPlacements() { return placements; }
        public void setPlacements(List<PlacementDTO> placements) { this.placements = placements; }
    }

    public static class PlacementDTO {
        private String boxName;
        private double x;
        private double y;
        private double z;
        private double dx;
        private double dy;
        private double dz;
        // optional fields
        private Long placementId;
        private Long boxId;

        public String getBoxName() { return boxName; }
        public void setBoxName(String boxName) { this.boxName = boxName; }
        public double getX() { return x; }
        public void setX(double x) { this.x = x; }
        public double getY() { return y; }
        public void setY(double y) { this.y = y; }
        public double getZ() { return z; }
        public void setZ(double z) { this.z = z; }
        public double getDx() { return dx; }
        public void setDx(double dx) { this.dx = dx; }
        public double getDy() { return dy; }
        public void setDy(double dy) { this.dy = dy; }
        public double getDz() { return dz; }
        public void setDz(double dz) { this.dz = dz; }
        public Long getPlacementId() { return placementId; }
        public void setPlacementId(Long placementId) { this.placementId = placementId; }
        public Long getBoxId() { return boxId; }
        public void setBoxId(Long boxId) { this.boxId = boxId; }
    }
}
