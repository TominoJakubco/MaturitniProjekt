package org.projekt.TominoAlg;

import java.util.*;

/**
 * Krabice k zabalení
 */
public class PackingItem {
    private final String id;
    private final int length;
    private final int width;
    private final int height;
    private final int weight;
    private final long volume;
    private final String typeId; // Pro clustering
    
    public PackingItem(String id, int length, int width, int height, int weight) {
        this.id = id;
        this.length = length;
        this.width = width;
        this.height = height;
        this.weight = weight;
        this.volume = (long) length * width * height;
        this.typeId = extractTypeId(id);
    }
    
    private String extractTypeId(String id) {
        // Předpokládáme formát "typeId-instance"
        int dashIndex = id.lastIndexOf('-');
        return dashIndex > 0 ? id.substring(0, dashIndex) : id;
    }
    
    public String getId() { return id; }
    public int getLength() { return length; }
    public int getWidth() { return width; }
    public int getHeight() { return height; }
    public int getWeight() { return weight; }
    public long getVolume() { return volume; }
    public String getTypeId() { return typeId; }
    
    /**
     * Vrátí všechny možné rotace krabice
     */
    public List<PackingItem> getRotations(boolean rotate3D) {
        List<PackingItem> rotations = new ArrayList<>();
        
        // Originální orientace
        rotations.add(this);
        
        if (rotate3D) {
            // 6 možných orientací v 3D
            Set<String> seen = new HashSet<>();
            seen.add(dimensionKey(length, width, height));
            
            int[][] permutations = {
                {length, width, height},
                {length, height, width},
                {width, length, height},
                {width, height, length},
                {height, length, width},
                {height, width, length}
            };
            
            for (int[] perm : permutations) {
                String key = dimensionKey(perm[0], perm[1], perm[2]);
                if (!seen.contains(key)) {
                    seen.add(key);
                    rotations.add(new PackingItem(id, perm[0], perm[1], perm[2], weight));
                }
            }
        }
        
        return rotations;
    }
    
    private String dimensionKey(int l, int w, int h) {
        return l + "x" + w + "x" + h;
    }
}
