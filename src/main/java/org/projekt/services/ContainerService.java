package org.projekt.services;

import org.projekt.models.Container;
import org.projekt.models.User;
import org.projekt.models.manytomany.UserContainer;
import org.projekt.repositories.ContainerRepository;
import org.projekt.repositories.UserContainerRepository;
import org.projekt.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ContainerService {

    private final ContainerRepository containerRepository;
    private final UserContainerRepository userContainerRepository;
    private final UserRepository userRepository;

    public ContainerService(ContainerRepository containerRepository,
                            UserContainerRepository userContainerRepository,
                            UserRepository userRepository) {
        this.containerRepository = containerRepository;
        this.userContainerRepository = userContainerRepository;
        this.userRepository = userRepository;
    }

    // ── Helper ─────────────────────────────────────────────────────────────────

    private boolean isAdmin(User user) {
        return user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    // ── CREATE ─────────────────────────────────────────────────────────────────

    public Container createContainer(Container container, User owner) {
        container.setOwner(owner);
        container.setVolume(container.getLength() * container.getWidth() * container.getHeight());
        return containerRepository.save(container);
    }

    // ── READ ───────────────────────────────────────────────────────────────────

    public List<Container> getVisibleContainers(User user) {
        if (isAdmin(user)) return containerRepository.findAll();
        return containerRepository.findVisibleContainers(user.getId());
    }

    public List<Container> getAllContainers(User user) {
        if (!isAdmin(user)) throw new RuntimeException("Only admin can access all containers");
        return containerRepository.findAll();
    }

    public Optional<Container> getContainerByIdWithPermission(Long id, User user) {
        Optional<Container> containerOpt = containerRepository.findById(id);
        if (containerOpt.isEmpty()) return Optional.empty();
        Container container = containerOpt.get();

        if (isAdmin(user)) return Optional.of(container);

        if (container.getOwner().getId().equals(user.getId())) return Optional.of(container);

        return userContainerRepository.findByUserAndContainer(user, container)
                .filter(UserContainer::isCanView)
                .map(uc -> container);
    }

    // ── UPDATE ─────────────────────────────────────────────────────────────────

    public Container updateContainerWithPermission(Long id, Container updatedContainer, User user) {
        Container container = containerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Container not found"));

        if (!isAdmin(user)) {
            if (!container.getOwner().getId().equals(user.getId())) {
                UserContainer permission = userContainerRepository.findByUserAndContainer(user, container)
                        .orElseThrow(() -> new RuntimeException("No permission"));
                if (!permission.isCanEdit()) throw new RuntimeException("No permission to edit");
            }
        }

        container.setName(updatedContainer.getName());
        container.setLength(updatedContainer.getLength());
        container.setWidth(updatedContainer.getWidth());
        container.setHeight(updatedContainer.getHeight());
        container.setVolume(container.getLength() * container.getWidth() * container.getHeight());
        container.setMaxWeight(updatedContainer.getMaxWeight());

        return containerRepository.save(container);
    }

    // ── DELETE ─────────────────────────────────────────────────────────────────

    public void deleteContainerWithPermission(Long id, User user) {
        Container container = containerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Container not found"));

        if (!isAdmin(user)) {
            if (!container.getOwner().getId().equals(user.getId())) {
                UserContainer permission = userContainerRepository.findByUserAndContainer(user, container)
                        .orElseThrow(() -> new RuntimeException("No permission"));
                if (!permission.isCanEdit()) throw new RuntimeException("No permission to delete");
            }
        }

        containerRepository.delete(container);
    }

    // ── SHARE ──────────────────────────────────────────────────────────────────

    public UserContainer shareContainer(Long containerId, Long targetUserId, boolean canView, boolean canEdit, User owner) {
        Container container = containerRepository.findById(containerId)
                .orElseThrow(() -> new RuntimeException("Container not found"));

        if (!isAdmin(owner) && !container.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("Only owner can share the container");
        }

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("Target user not found"));

        UserContainer userContainer = new UserContainer(targetUser, container, canView, canEdit);
        return userContainerRepository.save(userContainer);
    }
}