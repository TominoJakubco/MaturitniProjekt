package org.projekt.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
public class    Shipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name; // user-defined shipment name
    private String description;
    private Date createdAt = new Date();

    // ===== VLASTNÍK =====
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonBackReference
    private User owner;

    @OneToMany(mappedBy = "shipment",
            cascade = CascadeType.ALL, fetch = FetchType.LAZY,
            orphanRemoval = true)
    @JsonIgnoreProperties("shipment")
    private List<ContainerInstance> containers = new ArrayList<>();


    public Shipment() {}

    public Shipment(String name, String description, User owner) {
        this.name = name;
        this.description = description;
        this.owner = owner;
    }

    // Gettery a settery
    public Long getId() { return id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<ContainerInstance> getContainers() { return containers; }
    public void setContainers(List<ContainerInstance> containers) { this.containers = containers; }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }

    public User getOwner() { return owner; }
    public void setOwner(User owner) { this.owner = owner; }
}
