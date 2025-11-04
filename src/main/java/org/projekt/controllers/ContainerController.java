package org.projekt.controllers;

import org.projekt.models.Box;
import org.projekt.models.Container;
import org.projekt.repositories.ContainerRepository;
import org.projekt.services.BoxService;
import org.projekt.services.ContainerService;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/containers")
public class ContainerController {

    private final ContainerService containerService;

    public ContainerController(ContainerService containerService) {
        this.containerService = containerService;
    }

    // CREATE
    @PostMapping
    public Container createContainer(@RequestBody Container container) {
        System.out.println("Received user: " + container.getName());
        return containerService.createContainer(container);
    }

    // READ - všechny
    @GetMapping
    public List<Container> getAllContainers() {
        return containerService.getAllContainers();
    }

    // READ - jeden podle ID
    @GetMapping("/{id}")
    public Container getContainerById(@PathVariable Long id) {
        return containerService.getContainerById(id)
                .orElseThrow(() -> new RuntimeException("Box not found"));
    }

    // UPDATE
    @PutMapping("/{id}")
    public Container updateContainer(@PathVariable Long id, @RequestBody Container updatedContainer) {
        return containerService.updateContainer(id, updatedContainer);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public void deleteContainer(@PathVariable Long id) {
        containerService.deleteContainer(id);
    }
}
