package org.projekt.TominoAlg;

/**
 * Umístění krabice v kontejneru
 */
public class PlacedItem {
    private final PackingItem item;
    private final Position position;
    private final int layerIndex;
    
    public PlacedItem(PackingItem item, Position position, int layerIndex) {
        this.item = item;
        this.position = position;
        this.layerIndex = layerIndex;
    }
    
    public PackingItem getItem() { return item; }
    public Position getPosition() { return position; }
    public int getLayerIndex() { return layerIndex; }
    
    public int getMinX() { return position.x; }
    public int getMinY() { return position.y; }
    public int getMinZ() { return position.z; }
    public int getMaxX() { return position.x + item.getLength(); }
    public int getMaxY() { return position.y + item.getWidth(); }
    public int getMaxZ() { return position.z + item.getHeight(); }
    
    /**
     * Zkontroluje překryv s jinou krabicí
     */
    public boolean intersects(PlacedItem other) {
        return !(getMaxX() <= other.getMinX() || 
                 getMinX() >= other.getMaxX() ||
                 getMaxY() <= other.getMinY() || 
                 getMinY() >= other.getMaxY() ||
                 getMaxZ() <= other.getMinZ() || 
                 getMinZ() >= other.getMaxZ());
    }
}
