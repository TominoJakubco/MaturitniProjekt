package org.projekt.services;

import org.projekt.models.Container;
import org.projekt.models.User;
import org.projekt.repositories.ContainerRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ContainerService {
    private final ContainerRepository containerRepository;

    public ContainerService(ContainerRepository containerRepository) {
        this.containerRepository = containerRepository;
    }

    // CREATE
    public Container createContainer(Container container) {
        System.out.println("Received container: " + container.getName());
        return containerRepository.save(container);
    }

    // READ - všechni uživatelé
    public List<Container> getAllContainers() {
        return containerRepository.findAll();
    }

    // READ - jeden podle ID
    public Optional<Container> getContainerById(Long id) {
        return containerRepository.findById(id);
    }

    // UPDATE
    public Container updateContainer(Long id, Container updatedContainer) {
        return containerRepository.findById(id).map(container -> {
            container.setName(updatedContainer.getName());
            container.setLength(updatedContainer.getLength());
            container.setWidth(updatedContainer.getWidth());
            container.setHeight(updatedContainer.getHeight());
            container.setVolume(updatedContainer.getVolume());
            container.setMaxWeight(updatedContainer.getMaxWeight());
            return containerRepository.save(container);
        }).orElseThrow(() -> new RuntimeException("User not found"));
    }

    // DELETE
    public void deleteContainer(Long id) {
        containerRepository.deleteById(id);
    }
}
