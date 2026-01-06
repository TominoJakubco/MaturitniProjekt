package org.projekt.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
public class Container {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // primární klíč

    private String name;
    private int length;
    private int width;
    private int height;
    private double volume;

    @Column(name = "max_weight")
    private double maxWeight;

    // ===== VLASTNÍK =====
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id") // FK na User
    @JsonBackReference
    private User owner;

    // Prázdný konstruktor nutný pro JPA
    public Container() {}

    public Container(String name, int length, int width, int height, double volume, double maxWeight, User owner) {
        this.name = name;
        this.length = length;
        this.width = width;
        this.height = height;
        this.volume = volume;
        this.maxWeight = maxWeight;
        this.owner = owner;
    }

    // Gettery a settery
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getLength() { return length; }
    public void setLength(int length) { this.length = length; }

    public int getWidth() { return width; }
    public void setWidth(int width) { this.width = width; }

    public int getHeight() { return height; }
    public void setHeight(int height) { this.height = height; }

    public double getVolume() { return volume; }
    public void setVolume(double volume) { this.volume = volume; }

    public double getMaxWeight() { return maxWeight; }
    public void setMaxWeight(double maxWeight) { this.maxWeight = maxWeight; }

    public User getOwner() { return owner; }
    public void setOwner(User owner) { this.owner = owner; }
}
