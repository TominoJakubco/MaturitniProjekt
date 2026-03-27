package org.projekt.TominoAlg;

import java.util.*;

/**
 * Výsledek balení
 */
public class PackingResult {
    private final List<PlacedItem> placedItems;
    private final List<PackingItem> unpackedItems;
    private final PackingContainer container;
    private final PackingStatistics statistics;
    private final boolean success;
    
    public PackingResult(List<PlacedItem> placedItems, 
                        List<PackingItem> unpackedItems,
                        PackingContainer container,
                        PackingStatistics statistics) {
        this.placedItems = Collections.unmodifiableList(placedItems);
        this.unpackedItems = Collections.unmodifiableList(unpackedItems);
        this.container = container;
        this.statistics = statistics;
        this.success = unpackedItems.isEmpty();
    }
    
    public List<PlacedItem> getPlacedItems() { return placedItems; }
    public List<PackingItem> getUnpackedItems() { return unpackedItems; }
    public PackingContainer getContainer() { return container; }
    public PackingStatistics getStatistics() { return statistics; }
    public boolean isSuccess() { return success; }
    public boolean isPartialSuccess() { return !placedItems.isEmpty(); }
}
