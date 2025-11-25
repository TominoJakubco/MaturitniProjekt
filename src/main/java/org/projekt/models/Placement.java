package org.projekt.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
public class Placement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int boxNumber; // e.g. 1 of 10
    private double minX;
    private double maxX;
    private double minY;
    private double maxY;
    private double minZ;
    private double maxZ;
    private double rotation;
    private double weight;

    @ManyToOne
    @JoinColumn(name = "container_instance_id")
    @JsonIgnore
    private ContainerInstance containerInstance;

    @ManyToOne
    @JoinColumn(name = "box_id")
    private Box box;

    public Placement() {}

    // Getters and setters
    public Long getId() { return id; }
    public int getBoxNumber() { return boxNumber; }
    public void setBoxNumber(int boxNumber) { this.boxNumber = boxNumber; }

    public double getMinX() { return minX; }
    public void setMinX(double minX) { this.minX = minX; }
    public double getMaxX() { return maxX; }
    public void setMaxX(double maxX) { this.maxX = maxX; }

    public double getMinY() { return minY; }
    public void setMinY(double minY) { this.minY = minY; }
    public double getMaxY() { return maxY; }
    public void setMaxY(double maxY) { this.maxY = maxY; }

    public double getMinZ() { return minZ; }
    public void setMinZ(double minZ) { this.minZ = minZ; }
    public double getMaxZ() { return maxZ; }
    public void setMaxZ(double maxZ) { this.maxZ = maxZ; }

    public double getRotation() { return rotation; }
    public void setRotation(double rotation) { this.rotation = rotation; }
    public double getWeight() { return weight; }
    public void setWeight(double weight) { this.weight = weight; }
    public ContainerInstance getContainerInstance() { return containerInstance; }
    public void setContainerInstance(ContainerInstance containerInstance) { this.containerInstance = containerInstance; }
    public Box getBox() { return box; }
    public void setBox(Box box) { this.box = box; }
}
