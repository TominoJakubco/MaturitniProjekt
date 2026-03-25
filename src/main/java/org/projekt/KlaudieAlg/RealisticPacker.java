package org.projekt.KlaudieAlg;

import java.util.*;

/**
 * Realistický 3D bin packing algoritmus s důrazem na praktickou naložitelnost.
 * 
 * Algoritmus produkuje výsledky, které:
 * - Seskupují stejné typy krabic
 * - Minimalizují vertikální mezery
 * - Plní kontejner po vrstvách (bottom-to-top)
 * - Respektují fyzikální stabilitu
 * - Umožňují sekvenční nakládání
 */
public class RealisticPacker {
    
    private final PackingParameters parameters;
    private final List<PackingItem> items;
    private PackingContainer container;
    private PackingResult result;
    
    public RealisticPacker() {
        this.parameters = new PackingParameters();
        this.items = new ArrayList<>();
    }
    
    /**
     * Nastaví kontejner pro balení
     */
    public RealisticPacker setContainer(int length, int width, int height, int maxWeight) {
        this.container = new PackingContainer(length, width, height, maxWeight);
        return this;
    }
    
    /**
     * Přidá krabici k zabalení
     */
    public RealisticPacker addItem(String id, int length, int width, int height, int weight) {
        items.add(new PackingItem(id, length, width, height, weight));
        return this;
    }
    
    /**
     * Nastaví parametry algoritmu
     */
    public PackingParameters getParameters() {
        return parameters;
    }
    
    /**
     * Spustí balení
     */
    public PackingResult pack() {
        if (container == null) {
            throw new IllegalStateException("Container not set");
        }
        if (items.isEmpty()) {
            throw new IllegalStateException("No items to pack");
        }
        
        LayeredPackingAlgorithm algorithm = new LayeredPackingAlgorithm(
            container, items, parameters
        );
        
        this.result = algorithm.execute();
        return result;
    }
    
    /**
     * Vrátí výsledek balení
     */
    public PackingResult getResult() {
        return result;
    }
}
