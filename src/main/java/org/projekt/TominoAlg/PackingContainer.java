package org.projekt.TominoAlg;

/**
 * Kontejner pro balení
 */
public class PackingContainer {
    private final int length;
    private final int width;
    private final int height;
    private final int maxWeight;
    private final long volume;
    
    public PackingContainer(int length, int width, int height, int maxWeight) {
        this.length = length;
        this.width = width;
        this.height = height;
        this.maxWeight = maxWeight;
        this.volume = (long) length * width * height;
    }
    
    public int getLength() { return length; }
    public int getWidth() { return width; }
    public int getHeight() { return height; }
    public int getMaxWeight() { return maxWeight; }
    public long getVolume() { return volume; }
}
