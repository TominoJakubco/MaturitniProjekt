package org.projekt.services;

import org.projekt.models.ContainerInstance;
import org.projekt.models.Placement;
import org.projekt.models.Shipment;
import org.projekt.repositories.BoxRepository;
import org.projekt.repositories.ContainerRepository;
import org.projekt.repositories.ShipmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import xf.xflp.XFLP;
import xf.xflp.base.container.GroundContactRule;
import xf.xflp.opt.XFLPOptType;
import xf.xflp.report.LPReport;
import xf.xflp.report.ContainerReport;
import xf.xflp.report.LPPackageEvent;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class BoxPackingServiceToo {

    private final BoxRepository boxRepository;
    private final ContainerRepository containerRepository;
    private final ShipmentRepository shipmentRepository;

    public BoxPackingServiceToo(BoxRepository boxRepository,
                                ContainerRepository containerRepository,
                                ShipmentRepository shipmentRepository) {
        this.boxRepository = boxRepository;
        this.containerRepository = containerRepository;
        this.shipmentRepository = shipmentRepository;
    }

    @Transactional
    public Shipment packShipment(String shipmentName, List<Long> boxTypeIds, Long containerTypeId) {
        System.out.println("=== XFLP Packing Started ===");
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

            XFLP xflp = new XFLP();

            xflp.addContainer()
                    .setLength(containerType.getLength())
                    .setWidth(containerType.getWidth())
                    .setHeight(containerType.getHeight())
                    .setMaxWeight((int) containerType.getMaxWeight());

            for (ItemMetadata itemMeta : remainingBoxes) {
                org.projekt.models.Box box = boxMap.get(itemMeta.originalBoxId);

                xflp.addItem()
                        .setExternID(itemMeta.uniqueId)
                        .setLength(box.getLength())
                        .setWidth(box.getWidth())
                        .setHeight(box.getHeight())
                        .setWeight((int) box.getWeight());
            }

            xflp.getParameter().setMaxNbrOfContainer(1);
            xflp.setTypeOfOptimization(XFLPOptType.FAST_MIN_CONTAINER_PACKER);
            xflp.getParameter().setLifoImportance(1);
            xflp.getParameter().setGroundContactRule(GroundContactRule.COVERED);


            System.out.println("Starting XFLP execution...");
            long startTime = System.currentTimeMillis();
            xflp.executeLoadPlanning();
            long endTime = System.currentTimeMillis();
            System.out.println("XFLP execution completed in " + (endTime - startTime) + "ms");

            LPReport report = xflp.getReport();
            System.out.println("Report received: " + (report != null));

            if (report == null) {
                throw new RuntimeException("Packing failed: no report generated");
            }

            List<ContainerReport> containerReports = report.getContainerReports();

            if (containerReports == null || containerReports.isEmpty()) {
                throw new RuntimeException("Packing failed: no items could be packed into container #" + containerCounter);
            }

            ContainerReport containerReport = containerReports.get(0);

            List<LPPackageEvent> packageEvents = containerReport.getPackageEvents();

            if (packageEvents == null || packageEvents.isEmpty()) {
                System.out.println("ERROR: No items packed in this iteration!");
                throw new RuntimeException(
                        "Packing failed: no items could be packed into container #" + containerCounter + ". " +
                                "Container: " + containerType.getName() +
                                " (" + containerType.getLength() + "×" + containerType.getWidth() + "×" + containerType.getHeight() + "), " +
                                "Remaining boxes: " + remainingBoxes.size()
                );
            }

            System.out.println("Packed " + packageEvents.size() + " items in this container");

            ContainerInstance instance = new ContainerInstance();
            instance.setContainerType(containerType);
            instance.setShipment(shipment);

            // Calculate used weight and volume
            int usedWeight = 0;
            long usedVolume = 0;
            Set<String> packedItemIds = new HashSet<>();

            for (LPPackageEvent event : packageEvents) {
                packedItemIds.add(event.id());

                // Get the original box to calculate weight and volume
                String boxId = event.id().split("-")[0];
                org.projekt.models.Box box = boxMap.get(boxId);

                usedWeight += box.getWeight();
                usedVolume += (long) box.getLength() * box.getWidth() * box.getHeight();
            }

            instance.setUsedWeight(usedWeight);
            instance.setUsedVolume(usedVolume);

            System.out.println("Container usage - Weight: " + usedWeight + "/" + containerType.getMaxWeight() +
                    ", Volume: " + usedVolume + "/" + containerType.getVolume());

            List<Placement> placements = new ArrayList<>();

            for (LPPackageEvent event : packageEvents) {
                Placement placement = new Placement();
                placement.setContainerInstance(instance);

                // Extract original box ID (before the unique suffix)
                String boxId = event.id().split("-")[0];
                placement.setBox(boxMap.get(boxId));

                // FIXED: XFLP coordinate mapping to match Skjolber's coordinate system
                // XFLP uses: x=width, y=length, z=height
                // We map: y→X (length), x→Y (width), z→Z (height)
                placement.setMinX(event.y());
                placement.setMinY(event.x());
                placement.setMinZ(event.z());

                // Map dimensions: l()→X, w()→Y, h()→Z
                placement.setMaxX(event.y() + event.l());
                placement.setMaxY(event.x() + event.w());
                placement.setMaxZ(event.z() + event.h());

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
        }

        shipment.setContainers(containerInstances);
        System.out.println("\n=== Packing Complete ===");
        System.out.println("Total containers used: " + containerInstances.size());
        System.out.println("Saving shipment...");

        Shipment savedShipment = shipmentRepository.save(shipment);
        System.out.println("Shipment saved with ID: " + savedShipment.getId());
        return savedShipment;
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