package org.projekt.test;

import com.github.skjolber.packing.api.*;
import com.github.skjolber.packing.api.PackagerResultBuilder.ControlledContainerItemBuilder;

import java.io.FileOutputStream;
import java.io.ObjectOutputStream;
import java.util.List;

public class BoxPackingService {

    private final Packager<PackagerResultBuilder> packager;

    public BoxPackingService(Packager<PackagerResultBuilder> packager) {
        this.packager = packager;
    }

    /**
     * Packs multiple box items into one or more containers.
     *
     * @param containers list of available containers
     * @param boxes list of box items to pack
     * @return the result of the packing
     * @throws Exception
     */
    public PackagerResult pack(List<Container> containers, List<BoxItem> boxes) throws Exception {

        PackagerResultBuilder builder = packager.newResultBuilder()
                .withBoxItems(boxes);

        List<ContainerItem> containerItems = containers.stream()
                .map(c -> new ContainerItem(c, Integer.MAX_VALUE))
                .toList();

        builder.withContainerItems(containerItems);

        PackagerResult result = builder.build();

        if (!result.isSuccess()) {
            throw new RuntimeException("Packing failed: unable to fit all boxes");
        }

        // Save each packed container to file
        for (int i = 0; i < result.size(); i++) {
            savePackedContainer(result.get(i), "packedContainer_" + i + ".ser");
        }

        return result;
    }

    /**
     * Serialize the packed container to a file.
     */
    private void savePackedContainer(Container packedContainer, String filename) throws Exception {
        try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream(filename))) {
            oos.writeObject(packedContainer);
        }
    }
}
