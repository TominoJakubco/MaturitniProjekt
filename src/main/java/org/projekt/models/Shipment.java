package org.projekt.models;

import jakarta.persistence.*;
import java.util.List;

@Entity
public class Shipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // primární klíč

    private String name;
    @Column(name = "weight_total")
    private double weightTotal;
    @Column(name = "unused_space")
    private double unusedSpace;

    // Vazba na Container (mnoho zásilek může být v jednom kontejneru)
    @ManyToOne
    @JoinColumn(name = "container_id")
    private Container container;

    // Volitelně — pokud chceš uložit boxy v rámci shipmentu
    @OneToMany(cascade = CascadeType.ALL)
    private List<Box> boxes;

    // Prázdný konstruktor nutný pro JPA
    public Shipment() {}

    // Konstruktor pro pohodlné vytváření objektů
    public Shipment(String name, Container container, double weightTotal, double unusedSpace, List<Box> boxes) {
        this.name = name;
        this.container = container;
        this.weightTotal = weightTotal;
        this.unusedSpace = unusedSpace;
        this.boxes = boxes;
    }

    // Gettery a settery
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public double getWeightTotal() { return weightTotal; }
    public void setWeightTotal(double weightTotal) { this.weightTotal = weightTotal; }

    public double getUnusedSpace() { return unusedSpace; }
    public void setUnusedSpace(double unusedSpace) { this.unusedSpace = unusedSpace; }

    public Container getContainer() { return container; }
    public void setContainer(Container container) { this.container = container; }

    public List<Box> getBoxes() { return boxes; }
    public void setBoxes(List<Box> boxes) { this.boxes = boxes; }
}
