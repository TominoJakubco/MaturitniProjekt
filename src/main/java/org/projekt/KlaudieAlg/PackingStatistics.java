package org.projekt.KlaudieAlg;

/**
 * Statistiky balení
 */
public class PackingStatistics {
    private final int totalItems;
    private final int packedItems;
    private final long usedVolume;
    private final long containerVolume;
    private final int usedWeight;
    private final int maxWeight;
    private final double volumeUtilization;
    private final double weightUtilization;
    private final double realismScore;
    private final long computationTimeMs;
    private final int numberOfLayers;
    
    public PackingStatistics(int totalItems, int packedItems,
                           long usedVolume, long containerVolume,
                           int usedWeight, int maxWeight,
                           double realismScore, long computationTimeMs,
                           int numberOfLayers) {
        this.totalItems = totalItems;
        this.packedItems = packedItems;
        this.usedVolume = usedVolume;
        this.containerVolume = containerVolume;
        this.usedWeight = usedWeight;
        this.maxWeight = maxWeight;
        this.volumeUtilization = containerVolume > 0 ? 
            (100.0 * usedVolume / containerVolume) : 0;
        this.weightUtilization = maxWeight > 0 ? 
            (100.0 * usedWeight / maxWeight) : 0;
        this.realismScore = realismScore;
        this.computationTimeMs = computationTimeMs;
        this.numberOfLayers = numberOfLayers;
    }
    
    public int getTotalItems() { return totalItems; }
    public int getPackedItems() { return packedItems; }
    public long getUsedVolume() { return usedVolume; }
    public long getContainerVolume() { return containerVolume; }
    public int getUsedWeight() { return usedWeight; }
    public int getMaxWeight() { return maxWeight; }
    public double getVolumeUtilization() { return volumeUtilization; }
    public double getWeightUtilization() { return weightUtilization; }
    public double getRealismScore() { return realismScore; }
    public long getComputationTimeMs() { return computationTimeMs; }
    public int getNumberOfLayers() { return numberOfLayers; }
    
    @Override
    public String toString() {
        return String.format(
            "PackingStatistics{packed=%d/%d, volume=%.1f%%, weight=%.1f%%, " +
            "realismScore=%.2f, layers=%d, time=%dms}",
            packedItems, totalItems, volumeUtilization, weightUtilization,
            realismScore, numberOfLayers, computationTimeMs
        );
    }
}
