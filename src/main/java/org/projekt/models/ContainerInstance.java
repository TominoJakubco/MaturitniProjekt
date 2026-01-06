package org.projekt.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
public class ContainerInstance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private double usedVolume;
    private double usedWeight;

    @ManyToOne
    @JoinColumn(name = "container_type_id")
    private Container containerType; // refers to your existing Container (type)

    @ManyToOne
    @JoinColumn(name = "shipment_id")
    @JsonIgnore
    private Shipment shipment;

    @OneToMany(mappedBy = "containerInstance", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("containerInstance")
    private List<Placement> placements = new ArrayList<>();

    public ContainerInstance() {}

    // Getters and setters
    public Long getId() { return id; }

    public double getUsedVolume() { return usedVolume; }
    public void setUsedVolume(double usedVolume) { this.usedVolume = usedVolume; }

    public double getUsedWeight() { return usedWeight; }
    public void setUsedWeight(double usedWeight) { this.usedWeight = usedWeight; }

    public Container getContainerType() { return containerType; }
    public void setContainerType(Container containerType) { this.containerType = containerType; }

    public Shipment getShipment() { return shipment; }
    public void setShipment(Shipment shipment) { this.shipment = shipment; }

    public List<Placement> getPlacements() { return placements; }
    public void setPlacements(List<Placement> placements) { this.placements = placements; }
}
