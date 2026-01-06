package org.projekt.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
public class Box {



    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private int amount;
    private int length;
    private int width;
    private int height;
    private double volume;
    private double weight;

    @Column(name = "volume_total")
    private Double volumeTotal;

    @Column(name = "weight_total")
    private Double weightTotal;

    // ===== VLASTNÍK =====
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id") // FK na User
    @JsonBackReference
    private User owner;

    public Box() {}

    public Box(String name, int amount, int length, int width, int height,
               double volume, double weight, Double volumeTotal, Double weightTotal, User owner) {
        this.name = name;
        this.amount = amount;
        this.length = length;
        this.width = width;
        this.height = height;
        this.volume = volume;
        this.weight = weight;
        this.volumeTotal = volumeTotal;
        this.weightTotal = weightTotal;
        this.owner = owner;
    }

    // ===== Gettery a settery =====
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAmount() {
        return amount;
    }

    public void setAmount(int amount) {
        this.amount = amount;
    }

    public int getLength() {
        return length;
    }

    public void setLength(int length) {
        this.length = length;
    }

    public int getWidth() {
        return width;
    }

    public void setWidth(int width) {
        this.width = width;
    }

    public int getHeight() {
        return height;
    }

    public void setHeight(int height) {
        this.height = height;
    }

    public double getVolume() {
        return volume;
    }

    public void setVolume(double volume) {
        this.volume = volume;
    }

    public double getWeight() {
        return weight;
    }

    public void setWeight(double weight) {
        this.weight = weight;
    }

    public Double getVolumeTotal() {
        return volumeTotal;
    }

    public void setVolumeTotal(Double volumeTotal) {
        this.volumeTotal = volumeTotal;
    }

    public Double getWeightTotal() {
        return weightTotal;
    }

    public void setWeightTotal(Double weightTotal) {
        this.weightTotal = weightTotal;
    }

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }
}
