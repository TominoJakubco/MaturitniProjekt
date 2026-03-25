package org.projekt.KlaudieAlg;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Scoring systém pro hodnocení reálnosti a kvality balení kontejneru
 */
public class RealismScorer {
    
    private final PackingParameters parameters;
    
    public RealismScorer(PackingParameters parameters) {
        this.parameters = parameters;
    }
    
    /**
     * Vypočítá celkové skóre reálnosti (0-100, vyšší = lepší)
     */
    public double calculateRealismScore(List<PlacedItem> placedItems, PackingContainer container) {
        if (placedItems.isEmpty()) {
            return 0.0;
        }
        
        double clusteringScore = calculateClusteringScore(placedItems);
        double gapScore = calculateGapScore(placedItems, container);
        double stabilityScore = calculateStabilityScore(placedItems);
        double weightDistributionScore = calculateWeightDistributionScore(placedItems);
        double layerScore = calculateLayerScore(placedItems);
        
        // Vážený průměr
        double totalWeight = parameters.getClusteringWeight() +
                           parameters.getGapPenalty() +
                           parameters.getStabilityWeight() +
                           parameters.getWeightDistributionWeight() +
                           parameters.getLayerCompactnessWeight();
        
        double weightedScore = (
            clusteringScore * parameters.getClusteringWeight() +
            gapScore * parameters.getGapPenalty() +
            stabilityScore * parameters.getStabilityWeight() +
            weightDistributionScore * parameters.getWeightDistributionWeight() +
            layerScore * parameters.getLayerCompactnessWeight()
        ) / totalWeight;
        
        return Math.max(0, Math.min(100, weightedScore));
    }
    
    /**
     * Skóre pro clustering - jak moc jsou stejné typy krabic u sebe
     */
    private double calculateClusteringScore(List<PlacedItem> items) {
        if (items.size() <= 1) return 100.0;
        
        // Seskupíme položky podle typu
        Map<String, List<PlacedItem>> byType = items.stream()
            .collect(Collectors.groupingBy(p -> p.getItem().getTypeId()));
        
        double totalDistance = 0;
        int comparisons = 0;
        
        // Pro každý typ vypočítáme průměrnou vzdálenost mezi položkami
        for (List<PlacedItem> typeItems : byType.values()) {
            if (typeItems.size() <= 1) continue;
            
            for (int i = 0; i < typeItems.size(); i++) {
                for (int j = i + 1; j < typeItems.size(); j++) {
                    double distance = calculateDistance(typeItems.get(i), typeItems.get(j));
                    totalDistance += distance;
                    comparisons++;
                }
            }
        }
        
        if (comparisons == 0) return 100.0;
        
        double avgDistance = totalDistance / comparisons;
        // Normalizujeme: menší vzdálenost = vyšší skóre
        // Předpokládáme typický kontejner ~10m, ideální clustering < 2m
        return Math.max(0, 100.0 - (avgDistance / 20.0));
    }
    
    /**
     * Skóre pro mezery - penalizuje vertikální prázdné prostory
     */
    private double calculateGapScore(List<PlacedItem> items, PackingContainer container) {
        if (items.isEmpty()) return 0.0;
        
        // Vytvoříme 3D mřížku pro detekci mezer (rozlišení 10cm)
        int gridResolution = 100; // mm
        int xCells = (container.getLength() + gridResolution - 1) / gridResolution;
        int yCells = (container.getWidth() + gridResolution - 1) / gridResolution;
        int zCells = (container.getHeight() + gridResolution - 1) / gridResolution;
        
        boolean[][][] occupied = new boolean[xCells][yCells][zCells];
        
        // Označíme obsazené buňky
        for (PlacedItem item : items) {
            int x1 = item.getMinX() / gridResolution;
            int y1 = item.getMinY() / gridResolution;
            int z1 = item.getMinZ() / gridResolution;
            int x2 = Math.min(xCells - 1, item.getMaxX() / gridResolution);
            int y2 = Math.min(yCells - 1, item.getMaxY() / gridResolution);
            int z2 = Math.min(zCells - 1, item.getMaxZ() / gridResolution);
            
            for (int x = x1; x <= x2; x++) {
                for (int y = y1; y <= y2; y++) {
                    for (int z = z1; z <= z2; z++) {
                        if (x >= 0 && y >= 0 && z >= 0) {
                            occupied[x][y][z] = true;
                        }
                    }
                }
            }
        }
        
        // Najdeme vertikální mezery (prázdné místo s obsazeným prostorem nad i pod)
        int gapCount = 0;
        int totalCells = 0;
        
        for (int x = 0; x < xCells; x++) {
            for (int y = 0; y < yCells; y++) {
                boolean foundTop = false;
                for (int z = zCells - 1; z >= 0; z--) {
                    if (occupied[x][y][z]) {
                        foundTop = true;
                    } else if (foundTop) {
                        // Prázdná buňka pod obsazenou = mezera
                        gapCount++;
                    }
                    totalCells++;
                }
            }
        }
        
        if (totalCells == 0) return 100.0;
        
        double gapRatio = (double) gapCount / totalCells;
        return Math.max(0, 100.0 * (1.0 - gapRatio * 10)); // 10% mezer = 0 skóre
    }
    
    /**
     * Skóre pro stabilitu - mají krabice dostatečnou podporu?
     */
    private double calculateStabilityScore(List<PlacedItem> items) {
        if (items.isEmpty()) return 100.0;
        
        int stableItems = 0;
        
        for (PlacedItem item : items) {
            // Krabice na zemi je vždy stabilní
            if (item.getMinZ() == 0) {
                stableItems++;
                continue;
            }
            
            // Vypočítáme % podporované plochy zdola
            double supportRatio = calculateSupportRatio(item, items);
            
            if (supportRatio >= parameters.getMinSupportRatio()) {
                stableItems++;
            }
        }
        
        return 100.0 * stableItems / items.size();
    }
    
    /**
     * Vypočítá, kolik % spodní plochy krabice má podporu
     */
    private double calculateSupportRatio(PlacedItem item, List<PlacedItem> allItems) {
        long itemBaseArea = (long) item.getItem().getLength() * item.getItem().getWidth();
        if (itemBaseArea == 0) return 0.0;
        
        long supportedArea = 0;
        
        // Najdeme všechny krabice přímo pod touto krabicí
        for (PlacedItem other : allItems) {
            if (other == item) continue;
            
            // Musí být přímo pod (touching)
            if (other.getMaxZ() != item.getMinZ()) continue;
            
            // Vypočítáme překryv v XY rovině
            int overlapX1 = Math.max(item.getMinX(), other.getMinX());
            int overlapX2 = Math.min(item.getMaxX(), other.getMaxX());
            int overlapY1 = Math.max(item.getMinY(), other.getMinY());
            int overlapY2 = Math.min(item.getMaxY(), other.getMaxY());
            
            if (overlapX2 > overlapX1 && overlapY2 > overlapY1) {
                long overlap = (long)(overlapX2 - overlapX1) * (overlapY2 - overlapY1);
                supportedArea += overlap;
            }
        }
        
        return Math.min(1.0, (double) supportedArea / itemBaseArea);
    }
    
    /**
     * Skóre pro distribuci váhy - těžší krabice by měly být dole
     */
    private double calculateWeightDistributionScore(List<PlacedItem> items) {
        if (items.isEmpty()) return 100.0;
        
        // Vypočítáme průměrnou výšku pro každou hmotnostní kategorii
        Map<Integer, List<Integer>> weightToHeights = new HashMap<>();
        
        for (PlacedItem item : items) {
            int weight = item.getItem().getWeight();
            weightToHeights.computeIfAbsent(weight, k -> new ArrayList<>())
                          .add(item.getMinZ());
        }
        
        // Ideálně: větší hmotnost = menší průměrná výška
        List<Integer> weights = new ArrayList<>(weightToHeights.keySet());
        Collections.sort(weights);
        
        if (weights.size() <= 1) return 100.0;
        
        int correctOrdering = 0;
        int totalComparisons = 0;
        
        for (int i = 0; i < weights.size(); i++) {
            for (int j = i + 1; j < weights.size(); j++) {
                double avgHeight1 = weightToHeights.get(weights.get(i)).stream()
                    .mapToInt(Integer::intValue).average().orElse(0);
                double avgHeight2 = weightToHeights.get(weights.get(j)).stream()
                    .mapToInt(Integer::intValue).average().orElse(0);
                
                // Těžší (i) by mělo být níže než lehčí (j)
                if (avgHeight1 <= avgHeight2) {
                    correctOrdering++;
                }
                totalComparisons++;
            }
        }
        
        return 100.0 * correctOrdering / totalComparisons;
    }
    
    /**
     * Skóre pro vrstvení - jsou vrstvy kompaktní?
     */
    private double calculateLayerScore(List<PlacedItem> items) {
        if (items.isEmpty()) return 100.0;
        
        // Seskupíme položky do vrstev podle Z
        Map<Integer, List<PlacedItem>> layers = items.stream()
            .collect(Collectors.groupingBy(PlacedItem::getLayerIndex));
        
        double totalCompactness = 0;
        
        for (List<PlacedItem> layer : layers.values()) {
            // Kompaktnost vrstvy = využitý objem / ohraničující kvádr
            long usedVolume = layer.stream()
                .mapToLong(p -> p.getItem().getVolume())
                .sum();
            
            int minX = layer.stream().mapToInt(PlacedItem::getMinX).min().orElse(0);
            int maxX = layer.stream().mapToInt(PlacedItem::getMaxX).max().orElse(0);
            int minY = layer.stream().mapToInt(PlacedItem::getMinY).min().orElse(0);
            int maxY = layer.stream().mapToInt(PlacedItem::getMaxY).max().orElse(0);
            int minZ = layer.stream().mapToInt(PlacedItem::getMinZ).min().orElse(0);
            int maxZ = layer.stream().mapToInt(PlacedItem::getMaxZ).max().orElse(0);
            
            long boundingVolume = (long)(maxX - minX) * (maxY - minY) * (maxZ - minZ);
            
            if (boundingVolume > 0) {
                totalCompactness += (double) usedVolume / boundingVolume;
            }
        }
        
        return layers.isEmpty() ? 0 : 100.0 * totalCompactness / layers.size();
    }
    
    /**
     * Vypočítá vzdálenost mezi dvěma krabicemi (střed-střed)
     */
    private double calculateDistance(PlacedItem a, PlacedItem b) {
        double centerAX = (a.getMinX() + a.getMaxX()) / 2.0;
        double centerAY = (a.getMinY() + a.getMaxY()) / 2.0;
        double centerAZ = (a.getMinZ() + a.getMaxZ()) / 2.0;
        
        double centerBX = (b.getMinX() + b.getMaxX()) / 2.0;
        double centerBY = (b.getMinY() + b.getMaxY()) / 2.0;
        double centerBZ = (b.getMinZ() + b.getMaxZ()) / 2.0;
        
        double dx = centerAX - centerBX;
        double dy = centerAY - centerBY;
        double dz = centerAZ - centerBZ;
        
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
}
