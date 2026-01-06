package org.projekt.services;

import org.projekt.models.ContainerInstance;
import org.projekt.models.Placement;
import org.projekt.models.Shipment;
import org.projekt.KlaudieAlg.*;
import org.projekt.repositories.BoxRepository;
import org.projekt.repositories.ContainerRepository;
import org.projekt.repositories.ShipmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RealisticPackingService {

    private final BoxRepository boxRepository;
    private final ContainerRepository containerRepository;
    private final ShipmentRepository shipmentRepository;

    public RealisticPackingService(BoxRepository boxRepository,
                                   ContainerRepository containerRepository,
                                   ShipmentRepository shipmentRepository) {
        this.boxRepository = boxRepository;
        this.containerRepository = containerRepository;
        this.shipmentRepository = shipmentRepository;
    }

    @Transactional
    public Shipment packShipment(String shipmentName, List<Long> boxTypeIds, Long containerTypeId) {
        System.out.println("=== Realistic Packing Started ===");
        System.out.println("Shipment name: " + shipmentName);
        System.out.println("Box IDs: " + boxTypeIds);
        System.out.println("Container ID: " + containerTypeId);

        org.projekt.models.Container containerType = containerRepository.findById(containerTypeId)
                .orElseThrow(() -> new RuntimeException("Container type not found"));
        System.out.println("Container: " + containerType.getName() +
                " (" + containerType.getLength() + "×" + containerType.getWidth() + "×" + containerType.getHeight() + ")");

        List<org.projekt.models.Box> boxTypes = boxRepository.findAllById(boxTypeIds);
        if (boxTypes.isEmpty()) throw new RuntimeException("No boxes found");
        System.out.println("Found " + boxTypes.size() + " box types");

        // Map for quick lookup
        Map<String, org.projekt.models.Box> boxMap = boxTypes.stream()
                .collect(Collectors.toMap(b -> b.getId().toString(), b -> b));

        List<ItemMetadata> allItems = new ArrayList<>();
        int uniqueIdCounter = 0;

        for (org.projekt.models.Box box : boxTypes) {
            for (int i = 0; i < box.getAmount(); i++) {
                String uniqueId = box.getId().toString() + "-" + (uniqueIdCounter++);
                allItems.add(new ItemMetadata(uniqueId, box.getId().toString()));
            }
        }

        if (allItems.isEmpty())
            throw new RuntimeException("No items created for packing");

        System.out.println("Total items to pack: " + allItems.size());

        Shipment shipment = new Shipment();
        shipment.setName(shipmentName);
        shipment.setCreatedAt(new Date());
        List<ContainerInstance> containerInstances = new ArrayList<>();

        List<ItemMetadata> remainingBoxes = new ArrayList<>(allItems);
        int containerCounter = 0;

        while (!remainingBoxes.isEmpty()) {
            containerCounter++;
            System.out.println("\n--- Container #" + containerCounter + " ---");
            System.out.println("Remaining boxes to pack: " + remainingBoxes.size());

            // Create RealisticPacker instance
            RealisticPacker packer = new RealisticPacker();

            packer.setContainer(
                    containerType.getLength(),
                    containerType.getWidth(),
                    containerType.getHeight(),
                    (int) containerType.getMaxWeight()
            );

            // Configure parameters for realistic packing
            packer.getParameters()
                    .setAllowRotations(true)
                    .setClusteringWeight(2.0)
                    .setGapPenalty(1.5)
                    .setStabilityWeight(3.0)
                    .setMinSupportRatio(0.75)
                    .setWeightDistributionWeight(1.0)
                    .setLayerCompactnessWeight(2.0)
                    .setFillFromBack(true)
                    .setTimeoutMs(30000);

            // Add items to pack
            for (ItemMetadata itemMeta : remainingBoxes) {
                org.projekt.models.Box box = boxMap.get(itemMeta.originalBoxId);

                packer.addItem(
                        itemMeta.uniqueId,
                        box.getLength(),
                        box.getWidth(),
                        box.getHeight(),
                        (int) box.getWeight()
                );
            }

            System.out.println("Starting Realistic Packing execution...");
            long startTime = System.currentTimeMillis();
            PackingResult result = packer.pack();
            long endTime = System.currentTimeMillis();
            System.out.println("Realistic Packing execution completed in " + (endTime - startTime) + "ms");

            System.out.println("Result received: " + (result != null));

            if (result == null) {
                throw new RuntimeException("Packing failed: no result generated");
            }

            List<PlacedItem> placedItems = result.getPlacedItems();

            if (placedItems == null || placedItems.isEmpty()) {
                System.out.println("ERROR: No items packed in this iteration!");
                throw new RuntimeException(
                        "Packing failed: no items could be packed into container #" + containerCounter + ". " +
                                "Container: " + containerType.getName() +
                                " (" + containerType.getLength() + "×" + containerType.getWidth() + "×" + containerType.getHeight() + "), " +
                                "Remaining boxes: " + remainingBoxes.size()
                );
            }

            System.out.println("Packed " + placedItems.size() + " items in this container");

            // Print statistics
            PackingStatistics stats = result.getStatistics();
            System.out.println("Statistics:");
            System.out.println("  Volume utilization: " + String.format("%.1f%%", stats.getVolumeUtilization()));
            System.out.println("  Weight utilization: " + String.format("%.1f%%", stats.getWeightUtilization()));
            System.out.println("  Realism score: " + String.format("%.1f/100", stats.getRealismScore()));
            System.out.println("  Number of layers: " + stats.getNumberOfLayers());

            ContainerInstance instance = new ContainerInstance();
            instance.setContainerType(containerType);
            instance.setShipment(shipment);

            // Calculate used weight and volume
            int usedWeight = 0;
            long usedVolume = 0;
            Set<String> packedItemIds = new HashSet<>();

            for (PlacedItem placedItem : placedItems) {
                packedItemIds.add(placedItem.getItem().getId());

                // Get the original box to calculate weight and volume
                String boxId = placedItem.getItem().getId().split("-")[0];
                org.projekt.models.Box box = boxMap.get(boxId);

                usedWeight += box.getWeight();
                usedVolume += (long) box.getLength() * box.getWidth() * box.getHeight();
            }

            instance.setUsedWeight(usedWeight);
            instance.setUsedVolume(usedVolume);

            System.out.println("Container usage - Weight: " + usedWeight + "/" + containerType.getMaxWeight() +
                    ", Volume: " + usedVolume + "/" + containerType.getVolume());

            List<Placement> placements = new ArrayList<>();

            for (PlacedItem placedItem : placedItems) {
                Placement placement = new Placement();
                placement.setContainerInstance(instance);

                // Extract original box ID (before the unique suffix)
                String boxId = placedItem.getItem().getId().split("-")[0];
                placement.setBox(boxMap.get(boxId));

                // Set position from PlacedItem
                // RealisticPacker already uses the correct coordinate system
                placement.setMinX(placedItem.getMinX());
                placement.setMinY(placedItem.getMinY());
                placement.setMinZ(placedItem.getMinZ());
                placement.setMaxX(placedItem.getMaxX());
                placement.setMaxY(placedItem.getMaxY());
                placement.setMaxZ(placedItem.getMaxZ());

                placements.add(placement);
            }

            instance.setPlacements(placements);
            containerInstances.add(instance);

            remainingBoxes.removeIf(itemMeta -> packedItemIds.contains(itemMeta.uniqueId));

            System.out.println("Boxes remaining after this iteration: " + remainingBoxes.size());

            // Safety check: if no items were packed, break to avoid infinite loop
            if (packedItemIds.isEmpty()) {
                System.out.println("FATAL ERROR: No items were packed!");
                throw new RuntimeException(
                        "Packing iteration produced no packed items - boxes may be too large for container. " +
                                "Container: " + containerType.getName() +
                                " (" + containerType.getLength() + "×" + containerType.getWidth() + "×" + containerType.getHeight() + "), " +
                                "Remaining boxes: " + remainingBoxes.size()
                );
            }

            // Check if we should continue with remaining items
            // If realism score is too low, we might want to adjust parameters
            if (stats.getRealismScore() < 40 && !remainingBoxes.isEmpty()) {
                System.out.println("WARNING: Low realism score (" + 
                    String.format("%.1f", stats.getRealismScore()) + 
                    "). Consider adjusting packing parameters.");
            }
        }

        shipment.setContainers(containerInstances);
        System.out.println("\n=== Packing Complete ===");
        System.out.println("Total containers used: " + containerInstances.size());
        System.out.println("Saving shipment...");

        Shipment savedShipment = shipmentRepository.save(shipment);
        System.out.println("Shipment saved with ID: " + savedShipment.getId());
        return savedShipment;
    }

    /**
     * Overloaded method with custom parameters
     */
    @Transactional
    public Shipment packShipment(String shipmentName, 
                                List<Long> boxTypeIds, 
                                Long containerTypeId,
                                PackingParameters customParameters) {
        System.out.println("=== Realistic Packing Started (with custom parameters) ===");
        System.out.println("Shipment name: " + shipmentName);
        System.out.println("Box IDs: " + boxTypeIds);
        System.out.println("Container ID: " + containerTypeId);

        org.projekt.models.Container containerType = containerRepository.findById(containerTypeId)
                .orElseThrow(() -> new RuntimeException("Container type not found"));
        
        List<org.projekt.models.Box> boxTypes = boxRepository.findAllById(boxTypeIds);
        if (boxTypes.isEmpty()) throw new RuntimeException("No boxes found");

        Map<String, org.projekt.models.Box> boxMap = boxTypes.stream()
                .collect(Collectors.toMap(b -> b.getId().toString(), b -> b));

        List<ItemMetadata> allItems = new ArrayList<>();
        int uniqueIdCounter = 0;

        for (org.projekt.models.Box box : boxTypes) {
            for (int i = 0; i < box.getAmount(); i++) {
                String uniqueId = box.getId().toString() + "-" + (uniqueIdCounter++);
                allItems.add(new ItemMetadata(uniqueId, box.getId().toString()));
            }
        }

        Shipment shipment = new Shipment();
        shipment.setName(shipmentName);
        shipment.setCreatedAt(new Date());
        List<ContainerInstance> containerInstances = new ArrayList<>();

        List<ItemMetadata> remainingBoxes = new ArrayList<>(allItems);
        int containerCounter = 0;

        while (!remainingBoxes.isEmpty()) {
            containerCounter++;

            RealisticPacker packer = new RealisticPacker();
            packer.setContainer(
                    containerType.getLength(),
                    containerType.getWidth(),
                    containerType.getHeight(),
                    (int) containerType.getMaxWeight()
            );

            // Use custom parameters
            packer.getParameters()
                    .setAllowRotations(customParameters.isAllowRotations())
                    .setClusteringWeight(customParameters.getClusteringWeight())
                    .setGapPenalty(customParameters.getGapPenalty())
                    .setStabilityWeight(customParameters.getStabilityWeight())
                    .setMinSupportRatio(customParameters.getMinSupportRatio())
                    .setWeightDistributionWeight(customParameters.getWeightDistributionWeight())
                    .setLayerCompactnessWeight(customParameters.getLayerCompactnessWeight())
                    .setMaxLayerHeight(customParameters.getMaxLayerHeight())
                    .setFillFromBack(customParameters.isFillFromBack())
                    .setTimeoutMs(customParameters.getTimeoutMs());

            for (ItemMetadata itemMeta : remainingBoxes) {
                org.projekt.models.Box box = boxMap.get(itemMeta.originalBoxId);
                packer.addItem(
                        itemMeta.uniqueId,
                        box.getLength(),
                        box.getWidth(),
                        box.getHeight(),
                        (int) box.getWeight()
                );
            }

            PackingResult result = packer.pack();

            if (result == null || result.getPlacedItems().isEmpty()) {
                throw new RuntimeException("Packing failed for container #" + containerCounter);
            }

            ContainerInstance instance = createContainerInstance(
                    result, containerType, shipment, boxMap
            );
            containerInstances.add(instance);

            Set<String> packedIds = result.getPlacedItems().stream()
                    .map(p -> p.getItem().getId())
                    .collect(Collectors.toSet());
            remainingBoxes.removeIf(itemMeta -> packedIds.contains(itemMeta.uniqueId));
        }

        shipment.setContainers(containerInstances);
        return shipmentRepository.save(shipment);
    }

    /**
     * Helper method to create ContainerInstance from PackingResult
     */
    private ContainerInstance createContainerInstance(
            PackingResult result,
            org.projekt.models.Container containerType,
            Shipment shipment,
            Map<String, org.projekt.models.Box> boxMap) {

        ContainerInstance instance = new ContainerInstance();
        instance.setContainerType(containerType);
        instance.setShipment(shipment);

        int usedWeight = 0;
        long usedVolume = 0;

        for (PlacedItem placedItem : result.getPlacedItems()) {
            String boxId = placedItem.getItem().getId().split("-")[0];
            org.projekt.models.Box box = boxMap.get(boxId);
            usedWeight += box.getWeight();
            usedVolume += box.getVolume();
        }

        instance.setUsedWeight(usedWeight);
        instance.setUsedVolume(usedVolume);

        List<Placement> placements = new ArrayList<>();

        for (PlacedItem placedItem : result.getPlacedItems()) {
            Placement placement = new Placement();
            placement.setContainerInstance(instance);

            String boxId = placedItem.getItem().getId().split("-")[0];
            placement.setBox(boxMap.get(boxId));

            placement.setMinX(placedItem.getMinX());
            placement.setMinY(placedItem.getMinY());
            placement.setMinZ(placedItem.getMinZ());
            placement.setMaxX(placedItem.getMaxX());
            placement.setMaxY(placedItem.getMaxY());
            placement.setMaxZ(placedItem.getMaxZ());

            placements.add(placement);
        }

        instance.setPlacements(placements);
        return instance;
    }

    // Helper class to track unique IDs with original box ID
    private static class ItemMetadata {
        final String uniqueId;
        final String originalBoxId;

        ItemMetadata(String uniqueId, String originalBoxId) {
            this.uniqueId = uniqueId;
            this.originalBoxId = originalBoxId;
        }
    }
}
