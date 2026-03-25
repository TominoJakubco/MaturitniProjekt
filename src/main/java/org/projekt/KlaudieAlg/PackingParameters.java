package org.projekt.KlaudieAlg;

/**
 * Parametry pro algoritmus balení
 */
public class PackingParameters {
    
    // Clustering - seskupování stejných typů krabic
    private double clusteringWeight = 2.0;
    
    // Penalizace vertikálních mezer
    private double gapPenalty = 1.5;
    
    // Preference stability (podpora zespodu)
    private double stabilityWeight = 3.0;
    private double minSupportRatio = 0.75; // Minimální % plochy, které musí mít podporu
    
    // Preference těžších krabic dole
    private double weightDistributionWeight = 1.0;
    
    // Povolit rotace
    private boolean allowRotations = true;
    
    // Vrstvení
    private double layerCompactnessWeight = 2.0;
    
    // Maximální výška vrstvy (0 = automaticky)
    private int maxLayerHeight = 0;
    
    // Směr plnění (true = od zadní stěny, false = od dveří)
    private boolean fillFromBack = true;
    
    // Časový limit (ms)
    private long timeoutMs = 30000;
    
    // Gettery a settery
    public double getClusteringWeight() { return clusteringWeight; }
    public PackingParameters setClusteringWeight(double weight) {
        this.clusteringWeight = weight;
        return this;
    }
    
    public double getGapPenalty() { return gapPenalty; }
    public PackingParameters setGapPenalty(double penalty) {
        this.gapPenalty = penalty;
        return this;
    }
    
    public double getStabilityWeight() { return stabilityWeight; }
    public PackingParameters setStabilityWeight(double weight) {
        this.stabilityWeight = weight;
        return this;
    }
    
    public double getMinSupportRatio() { return minSupportRatio; }
    public PackingParameters setMinSupportRatio(double ratio) {
        this.minSupportRatio = ratio;
        return this;
    }
    
    public double getWeightDistributionWeight() { return weightDistributionWeight; }
    public PackingParameters setWeightDistributionWeight(double weight) {
        this.weightDistributionWeight = weight;
        return this;
    }
    
    public boolean isAllowRotations() { return allowRotations; }
    public PackingParameters setAllowRotations(boolean allow) {
        this.allowRotations = allow;
        return this;
    }
    
    public double getLayerCompactnessWeight() { return layerCompactnessWeight; }
    public PackingParameters setLayerCompactnessWeight(double weight) {
        this.layerCompactnessWeight = weight;
        return this;
    }
    
    public int getMaxLayerHeight() { return maxLayerHeight; }
    public PackingParameters setMaxLayerHeight(int height) {
        this.maxLayerHeight = height;
        return this;
    }
    
    public boolean isFillFromBack() { return fillFromBack; }
    public PackingParameters setFillFromBack(boolean fromBack) {
        this.fillFromBack = fromBack;
        return this;
    }
    
    public long getTimeoutMs() { return timeoutMs; }
    public PackingParameters setTimeoutMs(long timeout) {
        this.timeoutMs = timeout;
        return this;
    }
}
