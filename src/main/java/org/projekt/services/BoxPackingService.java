//package org.projekt.services;
//
//import com.github.skjolber.packing.api.BoxItem;
//import com.github.skjolber.packing.api.PackagerResult;
//import com.github.skjolber.packing.api.Order;
//import com.github.skjolber.packing.api.Stack;
//import com.github.skjolber.packing.api.Box;
//import com.github.skjolber.packing.api.Container;
//import com.github.skjolber.packing.packer.plain.PlainPackager;
//import org.projekt.models.ContainerInstance;
//import org.projekt.models.Placement;
//import org.projekt.models.Shipment;
//import org.projekt.repositories.BoxRepository;
//import org.projekt.repositories.ContainerRepository;
//import org.projekt.repositories.ShipmentRepository;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.util.*;
//import java.util.stream.Collectors;
//
//@Service
//public class BoxPackingService {
//
//    private final PlainPackager packager;
//    private final BoxRepository boxRepository;
//    private final ContainerRepository containerRepository;
//    private final ShipmentRepository shipmentRepository;
//
//    public BoxPackingService(PlainPackager packager,
//                             BoxRepository boxRepository,
//                             ContainerRepository containerRepository,
//                             ShipmentRepository shipmentRepository) {
//        this.packager = packager;
//        this.boxRepository = boxRepository;
//        this.containerRepository = containerRepository;
//        this.shipmentRepository = shipmentRepository;
//    }
//
//    @Transactional
//    public Shipment packShipment(String shipmentName, List<Long> boxTypeIds, Long containerTypeId) {
//
//        // 1️⃣ Fetch container and boxes
//        org.projekt.models.Container containerType = containerRepository.findById(containerTypeId)
//                .orElseThrow(() -> new RuntimeException("Container type not found"));
//        List<org.projekt.models.Box> boxTypes = boxRepository.findAllById(boxTypeIds);
//        if (boxTypes.isEmpty()) throw new RuntimeException("No boxes found");
//
//        // Map for quick lookup
//        Map<String, org.projekt.models.Box> boxMap = boxTypes.stream()
//                .collect(Collectors.toMap(b -> b.getId().toString(), b -> b));
//
//        // 2️⃣ Create BoxItems with unique IDs
//        List<BoxItem> allBoxItems = new ArrayList<>();
//        int uniqueIdCounter = 0;
//
//        for (org.projekt.models.Box box : boxTypes) {
//            for (int i = 0; i < box.getAmount(); i++) {
//                com.github.skjolber.packing.api.Box apiBox = com.github.skjolber.packing.api.Box.newBuilder()
//                        .withId(box.getId().toString() + "-" + (uniqueIdCounter++))
//                        .withDescription(box.getName())
//                        .withSize(box.getLength(), box.getWidth(), box.getHeight())
//                        .withWeight((int) box.getWeight())
//                        .build();
//
//                BoxItem boxItem = new BoxItem(apiBox);
//                apiBox.setBoxItem(boxItem);
//                allBoxItems.add(boxItem);
//            }
//        }
//
//        if (allBoxItems.isEmpty())
//            throw new RuntimeException("No BoxItems created for packing");
//
//        // 3️⃣ Initialize shipment
//        Shipment shipment = new Shipment();
//        shipment.setName(shipmentName);
//        shipment.setCreatedAt(new Date());
//        List<ContainerInstance> containerInstances = new ArrayList<>();
//
//        List<BoxItem> remainingBoxes = new ArrayList<>(allBoxItems);
//        int containerCounter = 0;
//
//        // 4️⃣ Pack boxes into containers
//        while (!remainingBoxes.isEmpty()) {
//            containerCounter++;
//
//            // Build API container
//            com.github.skjolber.packing.api.Container apiContainer = com.github.skjolber.packing.api.Container.newBuilder()
//                    .withDescription(containerType.getName())
//                    .withSize(containerType.getLength(), containerType.getWidth(), containerType.getHeight())
//                    .withEmptyWeight(0)
//                    .withMaxLoadWeight((int) containerType.getMaxWeight())
//                    .build();
//
//            // Create ContainerItem with unlimited quantity
//            List<com.github.skjolber.packing.api.ContainerItem> containerItems =
//                    com.github.skjolber.packing.api.ContainerItem.newListBuilder()
//                            .withContainer(apiContainer)
//                            .build();
//
//            // 5️⃣ Build result with remaining boxes and container
//            PlainPackager.PlainResultBuilder builder = packager.newResultBuilder()
//                    .withBoxItems(new ArrayList<>(remainingBoxes))
//                    .withMaxContainerCount(Integer.MAX_VALUE)
//                    .withContainerItems(containerItems)
//                    .withOrder(Order.NONE);
//
//            PackagerResult result = builder.build();
//
//            if (result.isTimeout() || result.getContainers().isEmpty()) {
//                throw new RuntimeException("Packing failed: boxes too large for container");
//            }
//
//            com.github.skjolber.packing.api.Container packedContainer = result.getContainers().get(0);
//
//            // 6️⃣ Convert to ContainerInstance
//            ContainerInstance instance = new ContainerInstance();
//            instance.setContainerType(containerType);
//            instance.setShipment(shipment);
//            instance.setUsedWeight(packedContainer.getLoadWeight());
//            instance.setUsedVolume(packedContainer.getLoadVolume());
//
//            List<Placement> placements = packedContainer.getStack().getPlacements().stream()
//                    .map(apiPlacement -> {
//                        Placement placement = new Placement();
//                        placement.setContainerInstance(instance);
//                        // Extract original box ID (before the unique suffix)
//                        String boxId = apiPlacement.getBoxItem().getBox().getId().split("-")[0];
//                        placement.setBox(boxMap.get(boxId));
//                        placement.setMinX(apiPlacement.getPoint().getMinX());
//                        placement.setMaxX(apiPlacement.getPoint().getMaxX());
//                        placement.setMinY   (apiPlacement.getPoint().getMinY());
//                        placement.setMaxY(apiPlacement.getPoint().getMaxY());
//                        placement.setMinZ(apiPlacement.getPoint().getMinZ());
//                        placement.setMaxZ(apiPlacement.getPoint().getMaxZ());
//                        return placement;
//                    })
//                    .collect(Collectors.toList());
//
//            instance.setPlacements(placements);
//            containerInstances.add(instance);
//
//            // 7️⃣ Remove packed boxes by their unique IDs
//            Set<String> packedBoxIds = packedContainer.getStack().getPlacements().stream()
//                    .map(p -> p.getBoxItem().getBox().getId())
//                    .collect(Collectors.toSet());
//
//            remainingBoxes.removeIf(b -> packedBoxIds.contains(b.getBox().getId()));
//        }
//
//        shipment.setContainers(containerInstances);
//        return shipmentRepository.save(shipment);
//    }
//}

package org.projekt.services;

import com.github.skjolber.packing.api.BoxItem;
import com.github.skjolber.packing.api.PackagerResult;
import com.github.skjolber.packing.api.Order;
import com.github.skjolber.packing.api.Stack;
import com.github.skjolber.packing.api.Box;
import com.github.skjolber.packing.api.Container;
import com.github.skjolber.packing.packer.plain.PlainPackager;
import org.projekt.models.ContainerInstance;
import org.projekt.models.Placement;
import org.projekt.models.Shipment;
import org.projekt.repositories.BoxRepository;
import org.projekt.repositories.ContainerRepository;
import org.projekt.repositories.ShipmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
        import java.util.stream.Collectors;

@Service
public class BoxPackingService {

    private final PlainPackager packager;
    private final BoxRepository boxRepository;
    private final ContainerRepository containerRepository;
    private final ShipmentRepository shipmentRepository;

    public BoxPackingService(PlainPackager packager,
                             BoxRepository boxRepository,
                             ContainerRepository containerRepository,
                             ShipmentRepository shipmentRepository) {
        this.packager = packager;
        this.boxRepository = boxRepository;
        this.containerRepository = containerRepository;
        this.shipmentRepository = shipmentRepository;
    }

    @Transactional
    public Shipment packShipment(String shipmentName, List<Long> boxTypeIds, Long containerTypeId) {

        // 1️⃣ Fetch container and boxes
        org.projekt.models.Container containerType = containerRepository.findById(containerTypeId)
                .orElseThrow(() -> new RuntimeException("Container type not found"));
        List<org.projekt.models.Box> boxTypes = boxRepository.findAllById(boxTypeIds);
        if (boxTypes.isEmpty()) throw new RuntimeException("No boxes found");

        // Map for quick lookup
        Map<String, org.projekt.models.Box> boxMap = boxTypes.stream()
                .collect(Collectors.toMap(b -> b.getId().toString(), b -> b));

        // 2️⃣ Create BoxItems with unique IDs
        List<BoxItem> allBoxItems = new ArrayList<>();
        int uniqueIdCounter = 0;

        for (org.projekt.models.Box box : boxTypes) {
            for (int i = 0; i < box.getAmount(); i++) {
                com.github.skjolber.packing.api.Box apiBox = com.github.skjolber.packing.api.Box.newBuilder()
                        .withId(box.getId().toString() + "-" + (uniqueIdCounter++))
                        .withDescription(box.getName())
                        .withSize(box.getLength(), box.getWidth(), box.getHeight())
                        .withWeight((int) box.getWeight())
                        .build();

                BoxItem boxItem = new BoxItem(apiBox);
                apiBox.setBoxItem(boxItem);
                allBoxItems.add(boxItem);
            }
        }

        if (allBoxItems.isEmpty())
            throw new RuntimeException("No BoxItems created for packing");

        // 3️⃣ Initialize shipment
        Shipment shipment = new Shipment();
        shipment.setName(shipmentName);
        shipment.setCreatedAt(new Date());
        List<ContainerInstance> containerInstances = new ArrayList<>();

        List<BoxItem> remainingBoxes = new ArrayList<>(allBoxItems);
        int containerCounter = 0;

        // 4️⃣ Pack boxes into containers
        while (!remainingBoxes.isEmpty()) {
            containerCounter++;

            // Build API container
            com.github.skjolber.packing.api.Container apiContainer = com.github.skjolber.packing.api.Container.newBuilder()
                    .withDescription(containerType.getName())
                    .withSize(containerType.getLength(), containerType.getWidth(), containerType.getHeight())
                    .withEmptyWeight(0)
                    .withMaxLoadWeight((int) containerType.getMaxWeight())
                    .build();

            // Create ContainerItem with unlimited quantity
            List<com.github.skjolber.packing.api.ContainerItem> containerItems =
                    com.github.skjolber.packing.api.ContainerItem.newListBuilder()
                            .withContainer(apiContainer)
                            .build();

            // 5️⃣ Build result with remaining boxes and container
            PlainPackager.PlainResultBuilder builder = packager.newResultBuilder()
                    .withBoxItems(new ArrayList<>(remainingBoxes))
                    .withMaxContainerCount(Integer.MAX_VALUE)
                    .withContainerItems(containerItems)
                    .withOrder(Order.NONE);

            PackagerResult result = builder.build();

            if (result.isTimeout() || result.getContainers().isEmpty()) {
                throw new RuntimeException("Packing failed: boxes too large for container");
            }

            com.github.skjolber.packing.api.Container packedContainer = result.getContainers().get(0);

            // 6️⃣ Convert to ContainerInstance
            ContainerInstance instance = new ContainerInstance();
            instance.setContainerType(containerType);
            instance.setShipment(shipment);
            instance.setUsedWeight(packedContainer.getLoadWeight());
            instance.setUsedVolume(packedContainer.getLoadVolume());

            List<Placement> placements = packedContainer.getStack().getPlacements().stream()
                    .map(apiPlacement -> {
                        Placement placement = new Placement();
                        placement.setContainerInstance(instance);

                        // Extract original box ID (before the unique suffix)
                        String boxId = apiPlacement.getBoxItem().getBox().getId().split("-")[0];
                        placement.setBox(boxMap.get(boxId));

                        // CRITICAL FIX: The Space object represents the placed position and dimensions
                        // Get the Space from the placement which contains the actual bounding box
                        //com.github.skjolber.packing.api.Space space = apiPlacement.getSpace();

                        // The Space object has the correct min/max coordinates after placement
                        placement.setMinX(apiPlacement.getPoint().getMinX());
                        placement.setMinY(apiPlacement.getPoint().getMinY());
                        placement.setMinZ(apiPlacement.getPoint().getMinZ());
                        placement.setMaxX(apiPlacement.getPoint().getMinX() + apiPlacement.getStackValue().getDx());
                        placement.setMaxY(apiPlacement.getPoint().getMinY() + apiPlacement.getStackValue().getDy());
                        placement.setMaxZ(apiPlacement.getPoint().getMinZ() + apiPlacement.getStackValue().getDz());

                        return placement;
                    })
                    .collect(Collectors.toList());

            instance.setPlacements(placements);
            containerInstances.add(instance);

            // 7️⃣ Remove packed boxes by their unique IDs
            Set<String> packedBoxIds = packedContainer.getStack().getPlacements().stream()
                    .map(p -> p.getBoxItem().getBox().getId())
                    .collect(Collectors.toSet());

            remainingBoxes.removeIf(b -> packedBoxIds.contains(b.getBox().getId()));
        }

        shipment.setContainers(containerInstances);
        return shipmentRepository.save(shipment);
    }
}