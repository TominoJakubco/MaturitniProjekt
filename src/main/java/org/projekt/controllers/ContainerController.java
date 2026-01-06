package org.projekt.controllers;

import org.projekt.models.Container;
import org.projekt.models.User;
import org.projekt.models.manytomany.UserContainer;
import org.projekt.services.ContainerService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/containers")
public class ContainerController {

    private final ContainerService containerService;

    public ContainerController(ContainerService containerService) {
        this.containerService = containerService;
    }

    // CREATE - nastaví ownera
    @PostMapping
    public Container createContainer(@RequestBody Container container, @AuthenticationPrincipal User user) {
        System.out.println("Received container: " + container.getName());
        return containerService.createContainer(container, user);
    }

    @GetMapping("/all")
    public List<Container> getAllContainersAdmin(@AuthenticationPrincipal User user) {
        return containerService.getAllContainers(user);
    }

    // READ - všechny kontejnery, které může uživatel vidět (owner nebo shared)
    @GetMapping
    public List<Container> getAllContainers(@AuthenticationPrincipal User user) {
        return containerService.getVisibleContainers(user);
    }

    // READ - jeden kontejner podle ID + kontrola přístupu
    @GetMapping("/{id}")
    public Container getContainerById(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return containerService.getContainerByIdWithPermission(id, user)
                .orElseThrow(() -> new RuntimeException("Container not found or no permission"));
    }

    // UPDATE - jen owner nebo user s canEdit = true
    @PutMapping("/{id}")
    public Container updateContainer(@PathVariable Long id, @RequestBody Container updatedContainer,
                                     @AuthenticationPrincipal User user) {
        return containerService.updateContainerWithPermission(id, updatedContainer, user);
    }

    // DELETE - jen owner nebo user s canEdit = true
    @DeleteMapping("/{id}")
    public void deleteContainer(@PathVariable Long id, @AuthenticationPrincipal User user) {
        containerService.deleteContainerWithPermission(id, user);
    }

    // SHARE - přidání přístupu pro jiného uživatele
    @PostMapping("/{id}/share")
    public UserContainer shareContainer(@PathVariable Long id,
                                        @RequestParam Long targetUserId,
                                        @RequestParam boolean canView,
                                        @RequestParam boolean canEdit,
                                        @AuthenticationPrincipal User user) {
        return containerService.shareContainer(id, targetUserId, canView, canEdit, user);
    }
}
